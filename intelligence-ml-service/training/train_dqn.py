"""
ILPEP Intelligence ML Service — DQN Pricing Agent Training

End-to-end training pipeline for the Deep Q-Network (DQN) dynamic pricing agent.
Trains a neural network to determine optimal exchange rates that balance
revenue maximization, inventory management, and user retention.

Architecture:
    DQNNetwork — 3-layer feedforward network (6 state features → 128 → 64 → N actions)
    ReplayBuffer — Experience replay memory with uniform random sampling
    PricingEnvironment — Simulated exchange environment with reward shaping
    DQNTrainer — Training loop with epsilon-greedy exploration and target net

State Space (6 features, matching PricingFeatureTransformer):
    partner_inventory_level   — current point inventory (log-scaled)
    partner_redemption_rate   — historical redemption success rate (0-1)
    user_exchange_frequency   — monthly exchange count (log-scaled)
    market_demand_index       — aggregate demand metric (0-1)
    time_of_day_normalized    — 0.0 (midnight) to 1.0 (23:59)
    day_of_week_normalized    — 0.0 (Monday) to 1.0 (Sunday)

Action Space (11 discrete price multipliers):
    [0.85, 0.88, 0.91, 0.94, 0.97, 1.00, 1.03, 1.06, 1.09, 1.12, 1.15]
    Multiplied by base_rate to get the final exchange rate.

Reward Function:
    R = revenue_component + retention_bonus - inventory_penalty
    Where:
        revenue_component  = amount × (price_multiplier - cost_factor)
        retention_bonus    = bonus if exchange happens (user retention)
        inventory_penalty  = penalty for holding excess inventory too long

Output:
    models/dqn_pricing_agent_v1.pt — serialized PyTorch model state dict

Usage:
    cd intelligence-ml-service
    python -m training.train_dqn
    python -m training.train_dqn --episodes 2000 --batch-size 64 --lr 0.001
"""

import argparse
import logging
import random
import sys
from collections import deque, namedtuple
from pathlib import Path
from typing import List, Tuple

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.config import DQN_MODEL_PATH, DQN_MODEL_VERSION

logger = logging.getLogger(__name__)


# ==============================================================================
# Constants
# ==============================================================================

# State space dimension (matches PricingFeatureTransformer output)
STATE_DIM = 6

# Discrete price multiplier actions
# Range: 0.85x to 1.15x of base rate, in 3% steps
PRICE_ACTIONS = [0.85, 0.88, 0.91, 0.94, 0.97, 1.00, 1.03, 1.06, 1.09, 1.12, 1.15]
ACTION_DIM = len(PRICE_ACTIONS)

# Base exchange rate (INR per point) — reference point for pricing
BASE_EXCHANGE_RATE = 0.75

# Cost factor for revenue calculation (platform cost per point exchanged)
COST_FACTOR = 0.60

# Reward shaping constants
RETENTION_BONUS = 0.5       # Bonus when user completes an exchange
INVENTORY_PENALTY_COEFF = 0.3  # Penalty for excess inventory
DEMAND_SENSITIVITY = 1.5    # How much demand affects exchange probability


# ==============================================================================
# Experience Replay
# ==============================================================================

Transition = namedtuple("Transition", ["state", "action", "reward", "next_state", "done"])


class ReplayBuffer:
    """
    Fixed-size circular buffer for storing and sampling transitions.

    Experience replay is essential for DQN training stability — it breaks
    temporal correlations between consecutive transitions and enables
    efficient mini-batch learning.

    Attributes:
        capacity: Maximum number of transitions stored.
        buffer: Internal deque with auto-eviction of oldest entries.
    """

    def __init__(self, capacity: int = 10000):
        self.capacity = capacity
        self.buffer = deque(maxlen=capacity)

    def push(self, state: np.ndarray, action: int, reward: float,
             next_state: np.ndarray, done: bool) -> None:
        """Add a transition to the buffer."""
        self.buffer.append(Transition(state, action, reward, next_state, done))

    def sample(self, batch_size: int) -> List[Transition]:
        """Sample a random mini-batch of transitions."""
        return random.sample(self.buffer, min(batch_size, len(self.buffer)))

    def __len__(self) -> int:
        return len(self.buffer)


# ==============================================================================
# DQN Neural Network
# ==============================================================================

class DQNNetwork(nn.Module):
    """
    Deep Q-Network for pricing decisions.

    Architecture:
        Input  → Linear(6, 128) → ReLU → Dropout(0.1)
        Hidden → Linear(128, 64) → ReLU → Dropout(0.1)
        Output → Linear(64, 11)  → Q-values for each price action

    The network learns to estimate Q(s, a) — the expected cumulative
    reward of taking action a (setting a price multiplier) in state s
    (current market conditions).

    Weight initialization uses Kaiming (He) for ReLU layers, which
    provides better gradient flow during early training.
    """

    def __init__(self, state_dim: int = STATE_DIM, action_dim: int = ACTION_DIM):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(64, action_dim),
        )

        # Kaiming initialization for ReLU networks
        self._init_weights()

    def _init_weights(self):
        """Apply Kaiming initialization to linear layers."""
        for module in self.modules():
            if isinstance(module, nn.Linear):
                nn.init.kaiming_normal_(module.weight, nonlinearity="relu")
                nn.init.zeros_(module.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass: state → Q-values for all actions.

        Args:
            x: State tensor of shape (batch_size, state_dim).

        Returns:
            Q-values tensor of shape (batch_size, action_dim).
        """
        return self.network(x)


# ==============================================================================
# Pricing Environment (Simulated)
# ==============================================================================

class PricingEnvironment:
    """
    Simulated exchange environment for training the DQN pricing agent.

    Models the dynamics of the ILPEP exchange marketplace:
    - Users arrive with varying demand levels
    - Exchange probability depends on the offered price vs demand
    - Inventory levels change based on exchanges
    - Revenue is earned from successful exchanges

    Each episode simulates one "day" of trading (max_steps exchanges).

    State transitions:
        1. Environment generates a market state (inventory, demand, etc.)
        2. Agent selects a price multiplier action
        3. User decides whether to exchange (stochastic, price-sensitive)
        4. Inventory and demand update based on the outcome
        5. Reward is calculated from revenue, retention, and inventory cost

    The environment is reset at the start of each episode.
    """

    def __init__(self, max_steps: int = 50):
        """
        Initialize the pricing environment.

        Args:
            max_steps: Maximum number of exchange opportunities per episode.
        """
        self.max_steps = max_steps
        self.step_count = 0

        # State variables (updated each step)
        self.inventory = 0.0
        self.redemption_rate = 0.0
        self.user_frequency = 0.0
        self.demand_index = 0.0
        self.time_of_day = 0.0
        self.day_of_week = 0.0

    def reset(self) -> np.ndarray:
        """
        Reset the environment to a random initial state.

        Returns:
            Initial state vector (6 features).
        """
        self.step_count = 0

        # Randomize initial market conditions
        self.inventory = np.random.uniform(1000, 100000)
        self.redemption_rate = np.random.uniform(0.5, 0.95)
        self.user_frequency = np.random.randint(1, 30)
        self.demand_index = np.random.uniform(0.2, 0.9)
        self.time_of_day = np.random.uniform(0.0, 1.0)
        self.day_of_week = np.random.uniform(0.0, 1.0)

        return self._get_state()

    def step(self, action: int) -> Tuple[np.ndarray, float, bool]:
        """
        Execute one step in the environment.

        Args:
            action: Index into PRICE_ACTIONS (0-10).

        Returns:
            Tuple of (next_state, reward, done).
        """
        self.step_count += 1
        price_multiplier = PRICE_ACTIONS[action]
        offered_rate = BASE_EXCHANGE_RATE * price_multiplier

        # =====================================================================
        # Simulate user decision (price-sensitive exchange probability)
        # =====================================================================
        # Higher price → lower exchange probability (price elasticity)
        # Higher demand → higher exchange probability
        base_prob = 0.7  # Base exchange probability at par price
        price_effect = (1.0 - price_multiplier) * DEMAND_SENSITIVITY
        demand_effect = (self.demand_index - 0.5) * 0.4
        exchange_prob = np.clip(base_prob + price_effect + demand_effect, 0.05, 0.95)

        exchange_happened = np.random.random() < exchange_prob

        # =====================================================================
        # Calculate reward
        # =====================================================================
        reward = 0.0

        if exchange_happened:
            # Transaction amount (random, based on market conditions)
            txn_amount = np.random.uniform(100, 10000) * self.demand_index

            # Revenue = profit margin on the exchange
            revenue = txn_amount * (price_multiplier - COST_FACTOR / BASE_EXCHANGE_RATE)
            reward += max(revenue, 0.0)

            # Retention bonus — successful exchanges build platform loyalty
            reward += RETENTION_BONUS

            # Inventory decreases with successful exchanges
            self.inventory = max(self.inventory - txn_amount, 0)
        else:
            # No exchange happened — slight negative signal for lost opportunity
            reward -= 0.1

        # Inventory holding penalty (excess inventory costs money)
        inventory_normalized = np.log1p(self.inventory) / np.log1p(100000)
        inventory_penalty = INVENTORY_PENALTY_COEFF * inventory_normalized
        reward -= inventory_penalty

        # =====================================================================
        # Update environment state for next step
        # =====================================================================
        # Demand fluctuates slightly each step
        self.demand_index = np.clip(
            self.demand_index + np.random.normal(0, 0.05), 0.1, 1.0
        )
        # Time progresses
        self.time_of_day = (self.time_of_day + 1.0 / self.max_steps) % 1.0
        # Redemption rate adapts based on recent success
        if exchange_happened:
            self.redemption_rate = min(self.redemption_rate + 0.01, 1.0)
        else:
            self.redemption_rate = max(self.redemption_rate - 0.005, 0.0)

        done = self.step_count >= self.max_steps
        return self._get_state(), reward, done

    def _get_state(self) -> np.ndarray:
        """
        Build the state vector matching PricingFeatureTransformer output.

        State normalization matches the transformer:
        - Inventory: log-scaled via log1p
        - Frequency: log-scaled via log1p
        - Other features: already in [0, 1] range
        """
        return np.array([
            np.log1p(max(self.inventory, 0)),        # partner_inventory_level
            np.clip(self.redemption_rate, 0.0, 1.0), # partner_redemption_rate
            np.log1p(max(self.user_frequency, 0)),    # user_exchange_frequency
            np.clip(self.demand_index, 0.0, 1.0),     # market_demand_index
            self.time_of_day,                          # time_of_day_normalized
            self.day_of_week,                          # day_of_week_normalized
        ], dtype=np.float64)


# ==============================================================================
# DQN Trainer
# ==============================================================================

class DQNTrainer:
    """
    DQN training loop with experience replay and target network.

    Implements the standard DQN algorithm (Mnih et al., 2015) adapted
    for the pricing optimization task:

    1. Collect experience using epsilon-greedy exploration
    2. Store transitions in replay buffer
    3. Sample random mini-batches for training
    4. Update Q-network using Bellman equation targets
    5. Periodically sync target network weights

    The epsilon schedule decays from 1.0 (full exploration) to 0.05
    (mostly exploitation) over training, allowing the agent to discover
    good pricing strategies before converging.

    Attributes:
        policy_net: The Q-network being trained.
        target_net: Frozen copy for computing stable TD targets.
        optimizer: Adam optimizer for policy_net parameters.
        replay_buffer: Experience replay memory.
        env: Simulated pricing environment.
    """

    def __init__(
        self,
        learning_rate: float = 0.001,
        gamma: float = 0.99,
        epsilon_start: float = 1.0,
        epsilon_end: float = 0.05,
        epsilon_decay: float = 0.995,
        buffer_capacity: int = 10000,
        target_update_freq: int = 10,
        max_steps_per_episode: int = 50,
    ):
        """
        Initialize the DQN trainer.

        Args:
            learning_rate: Adam learning rate.
            gamma: Discount factor for future rewards.
            epsilon_start: Initial exploration rate.
            epsilon_end: Minimum exploration rate.
            epsilon_decay: Multiplicative decay per episode.
            buffer_capacity: Replay buffer size.
            target_update_freq: Episodes between target network syncs.
            max_steps_per_episode: Steps per episode in the environment.
        """
        # Hyperparameters
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_end = epsilon_end
        self.epsilon_decay = epsilon_decay
        self.target_update_freq = target_update_freq

        # Networks
        self.policy_net = DQNNetwork()
        self.target_net = DQNNetwork()
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()  # Target network is never trained directly

        # Optimizer
        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=learning_rate)

        # Loss function (Huber loss for stability — less sensitive to outliers)
        self.criterion = nn.SmoothL1Loss()

        # Experience replay
        self.replay_buffer = ReplayBuffer(capacity=buffer_capacity)

        # Environment
        self.env = PricingEnvironment(max_steps=max_steps_per_episode)

        # Training metrics
        self.episode_rewards: List[float] = []
        self.episode_losses: List[float] = []

    def select_action(self, state: np.ndarray) -> int:
        """
        Select an action using epsilon-greedy exploration.

        With probability epsilon, select a random action (explore).
        Otherwise, select the action with the highest Q-value (exploit).

        Args:
            state: Current state vector.

        Returns:
            Action index (0 to ACTION_DIM-1).
        """
        if random.random() < self.epsilon:
            return random.randrange(ACTION_DIM)

        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            q_values = self.policy_net(state_tensor)
            return int(q_values.argmax(dim=1).item())

    def train_step(self, batch_size: int) -> float:
        """
        Perform one training step on a mini-batch from replay buffer.

        Uses the standard DQN update rule:
            Q_target = reward + gamma * max_a' Q_target(s', a')
            Loss = SmoothL1(Q_policy(s, a) - Q_target)

        Args:
            batch_size: Number of transitions to sample.

        Returns:
            Loss value for this training step.
        """
        if len(self.replay_buffer) < batch_size:
            return 0.0

        transitions = self.replay_buffer.sample(batch_size)
        batch = Transition(*zip(*transitions))

        # Convert to tensors
        states = torch.FloatTensor(np.array(batch.state))
        actions = torch.LongTensor(batch.action).unsqueeze(1)
        rewards = torch.FloatTensor(batch.reward).unsqueeze(1)
        next_states = torch.FloatTensor(np.array(batch.next_state))
        dones = torch.FloatTensor(batch.done).unsqueeze(1)

        # Current Q-values for the taken actions
        current_q = self.policy_net(states).gather(1, actions)

        # Target Q-values using the target network (no gradient)
        with torch.no_grad():
            next_q = self.target_net(next_states).max(1, keepdim=True)[0]
            target_q = rewards + self.gamma * next_q * (1 - dones)

        # Compute loss and backpropagate
        loss = self.criterion(current_q, target_q)

        self.optimizer.zero_grad()
        loss.backward()
        # Gradient clipping for training stability
        torch.nn.utils.clip_grad_norm_(self.policy_net.parameters(), max_norm=1.0)
        self.optimizer.step()

        return loss.item()

    def train(self, num_episodes: int, batch_size: int = 32) -> dict:
        """
        Run the full DQN training loop.

        For each episode:
        1. Reset environment to random initial state
        2. Collect experience using epsilon-greedy policy
        3. Train on mini-batches from replay buffer
        4. Decay epsilon and sync target network periodically

        Args:
            num_episodes: Number of training episodes.
            batch_size: Mini-batch size for training steps.

        Returns:
            Dict with training metrics.
        """
        logger.info("Starting DQN training: %d episodes, batch_size=%d", num_episodes, batch_size)
        logger.info("Epsilon schedule: %.2f → %.2f (decay=%.4f)",
                     self.epsilon, self.epsilon_end, self.epsilon_decay)

        best_avg_reward = float("-inf")

        for episode in range(1, num_episodes + 1):
            state = self.env.reset()
            episode_reward = 0.0
            episode_loss = 0.0
            steps = 0

            done = False
            while not done:
                # Select and execute action
                action = self.select_action(state)
                next_state, reward, done = self.env.step(action)

                # Store in replay buffer
                self.replay_buffer.push(state, action, reward, next_state, done)

                # Train on mini-batch
                loss = self.train_step(batch_size)

                state = next_state
                episode_reward += reward
                episode_loss += loss
                steps += 1

            # Decay epsilon
            self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)

            # Sync target network
            if episode % self.target_update_freq == 0:
                self.target_net.load_state_dict(self.policy_net.state_dict())

            # Track metrics
            self.episode_rewards.append(episode_reward)
            avg_loss = episode_loss / max(steps, 1)
            self.episode_losses.append(avg_loss)

            # Logging (every 100 episodes or at key milestones)
            if episode % 100 == 0 or episode <= 5 or episode == num_episodes:
                recent_rewards = self.episode_rewards[-100:]
                avg_reward = sum(recent_rewards) / len(recent_rewards)

                if avg_reward > best_avg_reward:
                    best_avg_reward = avg_reward

                logger.info(
                    "Episode %4d/%d | Reward: %8.2f | Avg(100): %8.2f | "
                    "Loss: %.4f | Epsilon: %.4f | Buffer: %d",
                    episode, num_episodes, episode_reward, avg_reward,
                    avg_loss, self.epsilon, len(self.replay_buffer),
                )

        # Final metrics
        final_100_rewards = self.episode_rewards[-100:]
        metrics = {
            "total_episodes": num_episodes,
            "final_epsilon": self.epsilon,
            "best_avg_reward_100": best_avg_reward,
            "final_avg_reward_100": sum(final_100_rewards) / len(final_100_rewards),
            "total_transitions": len(self.replay_buffer),
            "final_avg_loss": sum(self.episode_losses[-100:]) / len(self.episode_losses[-100:]),
        }

        return metrics


# ==============================================================================
# Model Serialization
# ==============================================================================

def save_model(trainer: DQNTrainer, output_path: Path, version: str) -> None:
    """
    Save the trained DQN model as a PyTorch .pt file.

    Saves the full model checkpoint including:
    - policy_net state_dict (the actual trained weights)
    - target_net state_dict
    - optimizer state (for potential fine-tuning / resuming)
    - model architecture metadata
    - training metrics summary

    The .pt file is loaded by ModelRegistry.load_pricing_model() at
    service startup for real-time pricing inference.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    checkpoint = {
        "model_state_dict": trainer.policy_net.state_dict(),
        "target_state_dict": trainer.target_net.state_dict(),
        "optimizer_state_dict": trainer.optimizer.state_dict(),
        "model_config": {
            "state_dim": STATE_DIM,
            "action_dim": ACTION_DIM,
            "price_actions": PRICE_ACTIONS,
            "base_exchange_rate": BASE_EXCHANGE_RATE,
        },
        "version": version,
        "training_metrics": {
            "total_episodes": len(trainer.episode_rewards),
            "final_epsilon": trainer.epsilon,
            "best_avg_reward": max(
                sum(trainer.episode_rewards[i:i+100]) / min(100, len(trainer.episode_rewards[i:i+100]))
                for i in range(0, len(trainer.episode_rewards), 100)
            ) if trainer.episode_rewards else 0,
        },
    }

    torch.save(checkpoint, output_path)
    file_size = output_path.stat().st_size
    logger.info("Model saved to %s (%.1f KB)", output_path, file_size / 1024)


# ==============================================================================
# Main Pipeline
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Train DQN pricing agent for ILPEP dynamic exchange rate optimization"
    )
    parser.add_argument(
        "--episodes", type=int, default=1000,
        help="Number of training episodes (default: 1000)"
    )
    parser.add_argument(
        "--batch-size", type=int, default=32,
        help="Mini-batch size for replay training (default: 32)"
    )
    parser.add_argument(
        "--lr", type=float, default=0.001,
        help="Learning rate for Adam optimizer (default: 0.001)"
    )
    parser.add_argument(
        "--gamma", type=float, default=0.99,
        help="Discount factor for future rewards (default: 0.99)"
    )
    parser.add_argument(
        "--epsilon-start", type=float, default=1.0,
        help="Initial exploration rate (default: 1.0)"
    )
    parser.add_argument(
        "--epsilon-end", type=float, default=0.05,
        help="Minimum exploration rate (default: 0.05)"
    )
    parser.add_argument(
        "--epsilon-decay", type=float, default=0.995,
        help="Epsilon decay rate per episode (default: 0.995)"
    )
    parser.add_argument(
        "--buffer-size", type=int, default=10000,
        help="Replay buffer capacity (default: 10000)"
    )
    parser.add_argument(
        "--target-update", type=int, default=10,
        help="Episodes between target network syncs (default: 10)"
    )
    parser.add_argument(
        "--max-steps", type=int, default=50,
        help="Max steps per episode (default: 50)"
    )
    parser.add_argument(
        "--model-output", type=str, default=None,
        help=f"Output path for .pt model (default: {DQN_MODEL_PATH})"
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    model_output = Path(args.model_output) if args.model_output else DQN_MODEL_PATH

    # Set random seeds for reproducibility
    random.seed(42)
    np.random.seed(42)
    torch.manual_seed(42)

    # =========================================================================
    # Step 1: Initialize trainer
    # =========================================================================
    logger.info("=" * 60)
    logger.info("Step 1: Initializing DQN trainer")
    logger.info("=" * 60)

    trainer = DQNTrainer(
        learning_rate=args.lr,
        gamma=args.gamma,
        epsilon_start=args.epsilon_start,
        epsilon_end=args.epsilon_end,
        epsilon_decay=args.epsilon_decay,
        buffer_capacity=args.buffer_size,
        target_update_freq=args.target_update,
        max_steps_per_episode=args.max_steps,
    )

    logger.info("Network architecture: %s", trainer.policy_net)
    total_params = sum(p.numel() for p in trainer.policy_net.parameters())
    logger.info("Total parameters: %d", total_params)

    # =========================================================================
    # Step 2: Train
    # =========================================================================
    logger.info("=" * 60)
    logger.info("Step 2: Training DQN agent (%d episodes)", args.episodes)
    logger.info("=" * 60)

    metrics = trainer.train(num_episodes=args.episodes, batch_size=args.batch_size)

    # =========================================================================
    # Step 3: Save model
    # =========================================================================
    logger.info("=" * 60)
    logger.info("Step 3: Saving model to %s", model_output)
    logger.info("=" * 60)

    save_model(trainer, model_output, DQN_MODEL_VERSION)

    # =========================================================================
    # Summary
    # =========================================================================
    print(f"\n{'='*60}")
    print(f"  DQN Pricing Agent — Training Complete!")
    print(f"{'='*60}")
    print(f"  Model version        : {DQN_MODEL_VERSION}")
    print(f"  Model file           : {model_output}")
    print(f"  Total episodes       : {metrics['total_episodes']}")
    print(f"  Final epsilon        : {metrics['final_epsilon']:.4f}")
    print(f"  Best avg reward(100) : {metrics['best_avg_reward_100']:.2f}")
    print(f"  Final avg reward(100): {metrics['final_avg_reward_100']:.2f}")
    print(f"  Final avg loss       : {metrics['final_avg_loss']:.4f}")
    print(f"  Replay buffer size   : {metrics['total_transitions']}")
    print(f"  Price actions        : {PRICE_ACTIONS}")
    print(f"  State dimensions     : {STATE_DIM}")
    print(f"{'='*60}\n")

    return metrics


if __name__ == "__main__":
    main()
