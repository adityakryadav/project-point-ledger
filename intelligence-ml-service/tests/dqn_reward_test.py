import logging
import pytest
from unittest.mock import patch
import numpy as np

from training.train_dqn import (
    PricingEnvironment,
    PRICE_ACTIONS,
    BASE_EXCHANGE_RATE,
    COST_FACTOR,
    RETENTION_BONUS,
    INVENTORY_PENALTY_COEFF,
)

logger = logging.getLogger(__name__)

# Mock the random functions to ensure deterministic behavior
@pytest.fixture
def run_env():
    env = PricingEnvironment(max_steps=10)
    env.reset()
    # Ensure known state
    env.inventory = 10000.0
    env.redemption_rate = 0.8
    env.user_frequency = 5.0
    env.demand_index = 0.5
    return env


@patch("numpy.random.random")
@patch("numpy.random.uniform")
def test_exchange_happened_reward(mock_uniform, mock_random, run_env):
    """Test reward calculation when an exchange happens."""
    # Force exchange_happened = True by returning 0.0 for random.random()
    mock_random.return_value = 0.0

    # Force txn_amount = 5000 / demand_index
    # demand_index is 0.5, so 10000.0 * 0.5 = 5000.0 txn amount
    mock_uniform.side_effect = [10000.0]

    action_idx = 5  # PRICE_ACTIONS[5] is 1.00 (par price)
    price_multiplier = PRICE_ACTIONS[action_idx]

    _, reward, _ = run_env.step(action_idx)

    # Calculate expected reward
    txn_amount = 5000.0
    expected_revenue = txn_amount * (price_multiplier - COST_FACTOR / BASE_EXCHANGE_RATE)
    # COST_FACTOR / BASE = 0.60 / 0.75 = 0.80
    # expected_revenue = 5000.0 * (1.00 - 0.80) = 5000.0 * 0.20 = 1000.0
    
    expected_inventory = run_env.inventory   # run_env.inventory is updated inside step()
    # It started at 10000.0, minus 5000.0 -> 5000.0
    
    inventory_normalized = np.log1p(5000.0) / np.log1p(100000)
    inventory_penalty = INVENTORY_PENALTY_COEFF * inventory_normalized
    
    expected_reward = 1000.0 + RETENTION_BONUS - inventory_penalty

    # Allow floating point inaccuracies
    assert abs(reward - expected_reward) < 1e-6
    assert run_env.inventory == 5000.0


@patch("numpy.random.random")
def test_no_exchange_reward(mock_random, run_env):
    """Test reward calculation when no exchange happens."""
    # Force exchange_happened = False by returning 1.0 for random.random()
    mock_random.return_value = 1.0

    action_idx = 10  # PRICE_ACTIONS[10] is 1.15 (highest price)
    
    initial_inventory = run_env.inventory
    _, reward, _ = run_env.step(action_idx)

    inventory_normalized = np.log1p(initial_inventory) / np.log1p(100000)
    inventory_penalty = INVENTORY_PENALTY_COEFF * inventory_normalized
    
    # -0.1 penalty for no exchange
    expected_reward = -0.1 - inventory_penalty

    assert abs(reward - expected_reward) < 1e-6
    assert run_env.inventory == initial_inventory  # inventory unchanged
