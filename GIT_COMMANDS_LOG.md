# Git Commands Log — ILPEP Point Ledger Project

> **Purpose**: Record of every git command used throughout the 15-day development cycle.
> Use this as a study reference for your git evaluation.

---

## Day 1 — March 16, 2026 (Project Scaffolding)

### 1. Initialize Git Repository

```bash
git init
```

**What it does**: Creates a new `.git/` directory, turning the folder into a Git repository. This is the very first step before any version control can happen.

### 2. Configure Git Identity (Required Before First Commit)

```bash
git config user.name "Aditya Kumar Yadav"
git config user.email "adityakryadav@gmail.com"
```

**What it does**: Sets your name and email for this repository. Git attaches this identity to every commit you make. Without this, `git commit` will fail. Using `--global` would set it system-wide; without `--global`, it's set only for this repo.

**Important variants**:

- `git config --global user.name "Name"` → sets for ALL repos on your machine
- `git config user.name "Name"` → sets for THIS repo only (overrides global)
- `git config --list` → shows all current config values

### 3. Check Repository Status

```bash
git status
```

**What it does**: Shows the current state — which files are untracked, modified, or staged. Always run this before committing to know what you're about to include.

### 4. Stage All New Files

```bash
git add .
```

**What it does**: Stages ALL new and modified files in the current directory (recursively) for the next commit. The `.` means "everything in this directory."

### 5. Verify Staged Files

```bash
git status
```

**What it does**: Run again after `git add` to confirm the right files are staged (listed under "Changes to be committed").

### 6. Create the Commit

```bash
git commit -m "feat: scaffold ledger-accounting-service and intelligence-ml-service

- Add ledger-accounting-service with complete PostgreSQL DDL migration
  (all 11 tables with indexes and constraints)
- Add intelligence-ml-service scaffold with FastAPI entrypoint,
  config, model registry, requirements.txt, and Dockerfile
- Initialize Go module for ledger service
- Add GIT_COMMANDS_LOG.md for command reference
- Phase 1: Project Setup & Contract Definition"
```

**What it does**: Records a snapshot of all staged changes with a descriptive message. The `-m` flag lets you write the message inline. Multi-line messages use the format shown above.

**Commit message convention**: We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `test:` — adding/updating tests
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `chore:` — maintenance tasks

### 7. View Commit History

```bash
git log --oneline
```

**What it does**: Shows a compact, one-line-per-commit view of the history. Useful to quickly verify your commit was recorded.

### 8. Add Remote Repository

```bash
git remote add origin https://github.com/adityakryadav/project-point-ledger.git
```

**What it does**: Links your local repo to a remote repository on GitHub. `origin` is the conventional name for the primary remote. You only need to do this once per repo.

**Useful variants**:

- `git remote -v` → shows all configured remotes (fetch and push URLs)
- `git remote remove origin` → removes a remote

### 9. Push to Remote

```bash
git push -u origin master
```

**What it does**: Uploads your local `master` branch commits to the `origin` remote. The `-u` flag (short for `--set-upstream`) sets up tracking so that future `git push` and `git pull` commands know which remote branch to use by default.

**After `-u` is set**, you can simply run:

- `git push` → pushes to the tracked remote branch
- `git pull` → pulls from the tracked remote branch

---

## Git Concepts Used Today

| Concept                  | Explanation                                    |
| ------------------------ | ---------------------------------------------- |
| **Working Directory**    | Your actual files on disk                      |
| **Staging Area (Index)** | Files marked for the next commit via `git add` |
| **Repository (.git/)**   | The committed history stored by Git            |
| **Untracked files**      | New files Git doesn't know about yet           |
| **Commit**               | A permanent snapshot of staged changes         |

### The Git Workflow (3 stages):

```
Working Directory  →  git add  →  Staging Area  →  git commit  →  Repository
     (edit)                        (review)                      (permanent)
```

---

## Day 2 — March 17, 2026 (Tax Compliance Triggers + Redis Feature Store)

### 1. Check Current Status

```bash
git status
```

**What it does**: Shows which files have been added or modified since the last commit. We expect to see the new Day 2 files as untracked, and any modified files.

### 2. Stage All Day 2 Changes

```bash
git add .
```

**What it does**: Stages ALL new and modified files. Since we added `002_tax_compliance.sql` and `redis_feature_store.py`, plus updated this log file, `git add .` captures everything.

**Alternative — staging specific files**:

```bash
git add ledger-accounting-service/db/migrations/002_tax_compliance.sql
git add intelligence-ml-service/core/redis_feature_store.py
git add GIT_COMMANDS_LOG.md
```

**When to use this**: When you want fine-grained control over what goes into a commit. Useful when you have work-in-progress files you don't want to commit yet.

### 3. Verify What's Staged

```bash
git status
```

**What it does**: Confirms the correct files are staged under "Changes to be committed."

### 4. Review Staged Changes (Optional but Recommended)

```bash
git diff --cached --stat
```

**What it does**: Shows a summary of what's been staged — file names and how many lines were added/removed. `--cached` means "show staged changes" (as opposed to unstaged). `--stat` gives a compact summary instead of full diffs.

### 5. Commit Day 2 Work

```bash
git commit -m "feat: add tax compliance triggers and Redis feature store

- Add 002_tax_compliance.sql with PPI limit enforcement triggers,
  audit log immutability rules, STR auto-flagging, wallet freeze
  enforcement, ledger balance validation, and load reset functions
- Add redis_feature_store.py with async CRUD operations for ML
  risk profiles (get/set/update/delete, velocity increment, bulk
  retrieval, feature vector extraction)
- Update GIT_COMMANDS_LOG.md with Day 2 commands
- Day 2: Phase 1 — Contract Definition & Data Layer"
```

**What it does**: Creates a commit with all staged changes. The multi-line message follows Conventional Commits format (`feat:` prefix for new features).

### 6. Verify Commit

```bash
git log --oneline -3
```

**What it does**: Shows the last 3 commits in a compact format. The `-3` flag limits output to 3 entries. You should see your new Day 2 commit at the top.

### 7. Push to Remote

```bash
git push origin master
```

**What it does**: Uploads the new commit to GitHub. Since we already set up tracking with `-u` on Day 1, `git push` alone would also work. Using `origin master` explicitly is clearer for learning purposes.

---

## Git Concepts Used Today

| Concept                        | Explanation                                                          |
| ------------------------------ | -------------------------------------------------------------------- |
| **`git diff --cached`**        | Shows changes that are staged (in the index) vs the last commit      |
| **`--stat` flag**              | Compact summary showing filenames and line change counts             |
| **Partial staging**            | Using `git add <path>` to stage specific files instead of everything |
| **Multi-line commit messages** | Using line breaks in `-m` flag for detailed commit descriptions      |
| **`git log -n`**               | Limiting log output to the most recent n commits                     |

---

## Day 3 — March 18, 2026 (Go Models + Feature Engineering)

### 1. Check Current Status

```bash
git status
```

**What it does**: Shows which files have been added, modified, or deleted since the last commit. We expect to see new `.go` files, new `.py` file, modified `model_registry.py`, deleted `.gitkeep`, and updated log.

### 2. Review What Changed

```bash
git diff --stat
```

**What it does**: Shows a summary of unstaged changes — file names and line counts. Useful to confirm you're about to stage the right things. Different from `git diff --cached --stat` which shows _staged_ changes.

### 3. Stage All Day 3 Changes

```bash
git add .
```

**What it does**: Stages all new, modified, and deleted files. Today this captures:

- `ledger-accounting-service/models/journal_entry.go` (NEW)
- `ledger-accounting-service/models/ledger_line.go` (NEW)
- `intelligence-ml-service/core/feature_engineering.py` (NEW)
- `intelligence-ml-service/models/model_registry.py` (MODIFIED)
- `ledger-accounting-service/models/.gitkeep` (DELETED)
- `GIT_COMMANDS_LOG.md` (MODIFIED)

**Note on deleted files**: When a file is deleted from the working directory, `git add .` automatically stages the deletion. Git tracks this as a "delete" operation in the commit.

### 4. Verify Staged Files

```bash
git status
```

**What it does**: Confirm the correct files are staged. Check for:

- "new file" entries for the `.go` and `.py` files
- "modified" for `model_registry.py` and this log
- "deleted" for `.gitkeep`

### 5. Review Staged Diff Summary

```bash
git diff --cached --stat
```

**What it does**: Shows a compact summary of staged changes. `--cached` means "show what's in the staging area vs last commit." Verify insertions/deletions match expectations.

### 6. Commit Day 3 Work

```bash
git commit -m "feat: add Go models and ML feature engineering

- Add journal_entry.go with JournalEntry struct, double-entry
  validation (debit=credit), entry types, and repository interface
- Add ledger_line.go with LedgerLine struct, account name constants,
  debit/credit mutual exclusion, and exchange transaction line builder
- Add feature_engineering.py with FraudFeatureTransformer (velocity
  ratios, amount deviation, device risk) and PricingFeatureTransformer
  (inventory, demand, time normalization)
- Enhance model_registry.py with metadata tracking, file validation,
  hot-swap reload support, and health status reporting
- Remove models/.gitkeep (replaced by actual Go model files)
- Update GIT_COMMANDS_LOG.md with Day 3 commands
- Day 3: Phase 2 — Core Module Implementation"
```

**What it does**: Creates a commit capturing all Day 3 work. The message follows Conventional Commits (`feat:` prefix) with a detailed body listing each change.

### 7. Verify Commit

```bash
git log --oneline -3
```

**What it does**: Shows the last 3 commits. Your Day 3 commit should appear at the top.

### 8. Push to Remote

```bash
git push origin master
```

**What it does**: Uploads the new commit to GitHub. Since tracking was set up on Day 1, you could also just use `git push`.

---

## Git Concepts Used Today

| Concept                    | Explanation                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **File deletion tracking** | `git add .` automatically stages deleted files — Git records the removal               |
| **`git diff --stat`**      | Shows unstaged changes summary (vs `git diff --cached --stat` for staged)              |
| **Mixed operations**       | A single commit can contain new files, modifications, AND deletions                    |
| **`.gitkeep` lifecycle**   | `.gitkeep` is a convention to track empty directories; remove it once real files exist |
| **Conventional Commits**   | `feat:` prefix indicates a new feature; body lists individual changes                  |

---

## Day 4 — March 19, 2026 (Transaction Processor + XGBoost Training)

### 1. Check Current Status

```bash
git status
```

**What it does**: Shows which files have been added, modified, or deleted since the last commit. We expect to see new `.go` and `.py` files, a generated `.pkl` model, synthetic data CSV, and deleted `.gitkeep`.

### 2. Review What Changed

```bash
git diff --stat
```

**What it does**: Shows a summary of unstaged changes. Today this reveals new files in `services/` and `training/`, plus the generated model artifact.

### 3. Check What .gitignore Hides

```bash
git status --ignored
```

**What it does**: Shows files that are being ignored by `.gitignore` rules. The `--ignored` flag reveals hidden files. Today, the `.pkl` model file and synthetic CSV are gitignored (tracked separately from source code since they are generated artifacts).

**Why this matters**: Understanding `.gitignore` interaction is important because:

- Source code files (`.go`, `.py`) are tracked in Git
- Generated artifacts (`.pkl` models, CSVs) are excluded to keep the repo lean
- The training script can regenerate both the data and model at any time

### 4. Stage All Day 4 Changes

```bash
git add .
```

**What it does**: Stages all new, modified, and deleted files. Git respects `.gitignore`, so excluded files (`.pkl`, `.csv`) are NOT staged. Today this captures:

- `ledger-accounting-service/services/transaction_processor.go` (NEW)
- `intelligence-ml-service/training/train_xgboost.py` (NEW)
- `intelligence-ml-service/training/data/generate_synthetic_data.py` (NEW)
- `ledger-accounting-service/services/.gitkeep` (DELETED)
- `GIT_COMMANDS_LOG.md` (MODIFIED)

### 5. Verify Staged Files

```bash
git status
```

**What it does**: Confirm only source code files are staged. Verify that `.pkl` and `.csv` are NOT listed (properly gitignored).

### 6. View Specific File Details (Optional)

```bash
git diff --cached -- ledger-accounting-service/services/transaction_processor.go | head -20
```

**What it does**: Shows the staged diff for a specific file. The `--` separates git options from file paths. The `| head -20` pipes output to `head`, showing only the first 20 lines. Useful when you want to review a specific file's changes without seeing everything.

**Variants**:

- `git diff --cached -- *.go` → all staged Go files
- `git diff --cached -- *.py` → all staged Python files
- `git diff --cached --name-only` → just the filenames of staged changes

### 7. Commit Day 4 Work

```bash
git commit -m "feat: add transaction processor and XGBoost training pipeline

- Add transaction_processor.go with CommitExchangeTransaction() for
  atomic double-entry exchanges: gross value, service fee (2%), GST
  calculation (CGST/SGST vs IGST by state_code), net value to wallet
- Add generate_synthetic_data.py with 4 fraud patterns: smurfing,
  device farming, velocity abuse, load exploitation
- Add train_xgboost.py with full training pipeline: data loading,
  stratified split, XGBoost training, evaluation metrics, model
  serialization to .pkl
- Remove services/.gitkeep (replaced by actual Go service file)
- Update GIT_COMMANDS_LOG.md with Day 4 commands
- Day 4: Phase 2 — Core Module Implementation"
```

**What it does**: Creates a commit with all staged changes. The message documents both Member 1 (transaction processor) and Member 3 (ML training) contributions for the day.

### 8. Verify Commit

```bash
git log --oneline -4
```

**What it does**: Shows the last 4 commits. Day 4 commit should appear at the top. The `-4` shows one more than before since we now have 4 days of commits.

### 9. Push to Remote

```bash
git push origin master
```

**What it does**: Uploads the new commit to GitHub. Pushes only the tracked source code — generated artifacts stay local.

---

## Git Concepts Used Today

| Concept                           | Explanation                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **`git status --ignored`**        | Shows files hidden by `.gitignore` rules — useful to verify `.pkl` models aren't tracked |
| **`git diff --cached -- <path>`** | View staged changes for a specific file using `--` path separator                        |
| **`head` piping**                 | `                                                                                        | head -n` limits output to first n lines — useful for large diffs |
| **`.gitignore` interaction**      | `git add .` respects `.gitignore` — excluded files are never staged                      |
| **Generated vs source artifacts** | Source code (`.go`, `.py`) is tracked; generated files (`.pkl`, `.csv`) are gitignored   |
| **`--name-only` flag**            | Shows just filenames in diff output, omitting actual content changes                     |

### 10. Sync Master to Main Branch

```bash
git push origin master:main
```

**What it does**: Pushes the local `master` branch to the remote `main` branch. The `master:main` syntax means "take local `master` and push it to remote `main`." This ensures both branches have identical commit history.

**Why we need this**: The GitHub repo was originally created with `main` as the default branch. Our development happens on `master`. To keep both branches in sync (for teacher visibility), we push to both.

**From Day 5 onwards**, every push session will use:

```bash
git push origin master
git push origin master:main
```

This ensures both `master` and `main` always point to the same commit.

---

## Day 5 — March 20, 2026 (GST Record Breakdown + Fraud Scoring API)

### 1. Check Current Status

```bash
git status
```

**What it does**: Shows which files have been added, modified, or deleted since the last commit. We expect to see modified `.go` file, new `.py` file, modified `main.py`, and updated log.

### 2. Review What Changed

```bash
git diff --stat
```

**What it does**: Shows a summary of unstaged changes. Today this reveals modifications to `transaction_processor.go`, a new file in `api/`, and changes to `main.py`.

### 3. View Detailed Changes for a Specific File

```bash
git diff -- intelligence-ml-service/api/fraud_scoring_routes.py | head -50
```

**What it does**: Shows the full diff for a specific new file, piped through `head` to limit output. The `--` separator tells Git that what follows is a file path, not a branch name. Useful for reviewing new files before staging.

**Related command**:

```bash
git diff -- ledger-accounting-service/services/transaction_processor.go
```

**What it does**: Shows changes within the modified Go file (additions and modifications) — helpful to review exactly what changed in the GST computation logic.

### 4. Stage All Day 5 Changes

```bash
git add .
```

**What it does**: Stages all new and modified files. Today this captures:

- `ledger-accounting-service/services/transaction_processor.go` (MODIFIED)
- `intelligence-ml-service/api/fraud_scoring_routes.py` (NEW)
- `intelligence-ml-service/main.py` (MODIFIED)
- `GIT_COMMANDS_LOG.md` (MODIFIED)

### 5. Verify Staged Files

```bash
git status
```

**What it does**: Confirm the correct files are staged. Check for:

- "modified" for `transaction_processor.go`, `main.py`, and this log
- "new file" for `fraud_scoring_routes.py`

### 6. Review Staged Changes Summary

```bash
git diff --cached --stat
```

**What it does**: Shows a compact summary of all staged changes. `--cached` shows what's in the staging area. Verify the file count and line changes match expectations.

### 7. Commit Day 5 Work

```bash
git commit -m "feat: add GST record breakdown and fraud scoring API

- Enhance transaction_processor.go with GSTRecord struct for per-record
  gst_records table persistence (CGST+SGST intra-state, IGST inter-state)
- Add GenerateGSTRecords() with sum validation and consistency checks
- Add ValidateGSTConsistency() for defense-in-depth DB integrity
- Add InsertGSTRecords() batch method to TransactionManager interface
- Add fraud_scoring_routes.py with POST /score endpoint: Redis profile
  retrieval, feature engineering, XGBoost inference, decision mapping
- Add GET /model-status endpoint for fraud model health reporting
- Wire fraud router into main.py with Redis lifecycle (connect/disconnect)
- Update GIT_COMMANDS_LOG.md with Day 5 commands
- Day 5: Phase 2 — Core Module Implementation"
```

**What it does**: Creates a commit with all Day 5 work. The message documents both Member 1 (GST record breakdown) and Member 3 (fraud scoring API) contributions.

### 8. Verify Commit

```bash
git log --oneline -5
```

**What it does**: Shows the last 5 commits. Day 5 commit should appear at the top.

### 9. Push to Remote (Both Branches)

```bash
git push origin master
git push origin master:main
```

**What it does**: Pushes to both `master` and `main` branches on GitHub, keeping them in sync for teacher visibility.

---

## Git Concepts Used Today

| Concept                        | Explanation                                                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **`git diff -- <path>`**       | Shows diff for a specific file using `--` path separator — useful for reviewing individual file changes                 |
| **Reviewing new files**        | `git diff` only shows tracked file changes; for new files, `git status` and `git diff --cached` show them after staging |
| **Multi-file commits**         | A single commit can contain modifications and new files across different service directories                            |
| **`git diff --cached --stat`** | Shows a compact summary of staged changes — line counts per file for quick verification                                 |
| **Conventional Commits**       | `feat:` prefix with detailed body listing changes per member/component                                                  |

---

## Day 6 — March 21, 2026 (Exchange Handler + DQN Training)

> **New from Day 6**: We now make **two separate commits per day** — one for each member's work. This makes responsibility clear in the git history and is easier for the teacher to evaluate individual contributions.

### Commit A — Member 1: Exchange Handler

#### A1. Stage Member 1's Files Selectively

```bash
git add ledger-accounting-service/handlers/exchange_handler.go
git add ledger-accounting-service/handlers/.gitkeep
```

**What it does**: Stages only Member 1's files. We use `git add <path>` (selective staging) instead of `git add .` (stage everything) to keep each member's work in its own commit.

**Why `.gitkeep` is staged**: Even though the file was _deleted_, running `git add` on it stages the deletion. Git records this as a "file removed" change in the commit.

#### A2. Verify Only Member 1's Files Are Staged

```bash
git status
```

**What it does**: Confirms that only the exchange handler files are staged. You should see:

- "new file" for `exchange_handler.go`
- "deleted" for `.gitkeep`

The Python files and log should remain under "Untracked" or "Changes not staged."

#### A3. Commit Member 1's Work

```bash
git commit -m "feat(ledger): add exchange handler with HTTP API endpoint

- Add exchange_handler.go with POST /api/v1/exchange endpoint
- Define ExchangeHTTPRequest/Response JSON DTOs with validation
- Implement UUID v4 generation via crypto/rand (no external deps)
- Map HTTP errors: validation→400, fraud blocked→403, internal→500
- Wire HandleExchange() to CommitExchangeTransaction() service layer
- Add ErrorResponse struct for standardized API error payloads
- Add RegisterRoutes() for HTTP mux integration
- Remove handlers/.gitkeep (replaced by actual handler file)
- Member 1, Day 6: Phase 2 — Core Module Implementation"
```

**What it does**: Commits only Member 1's changes. The `feat(ledger):` prefix uses a **scoped conventional commit** — the `(ledger)` scope identifies which service/component the change belongs to. This is useful when multiple services share the same repo.

---

### Commit B — Member 3: DQN Training Pipeline

#### B1. Stage Member 3's Files and Updated Log

```bash
git add intelligence-ml-service/training/train_dqn.py
git add GIT_COMMANDS_LOG.md
```

**What it does**: Stages only Member 3's new training file and the updated git log. The log is included in Member 3's commit since it documents both members' Day 6 commands.

#### B2. Verify Only Member 3's Files Are Staged

```bash
git status
```

**What it does**: Confirms only the DQN training file and log are staged. No other files should appear under "Changes to be committed."

#### B3. Commit Member 3's Work

```bash
git commit -m "feat(ml): add DQN pricing agent training pipeline

- Add train_dqn.py with Deep Q-Network for dynamic exchange pricing
- Implement DQNNetwork: 3-layer feedforward (6→128→64→11 actions)
- Add ReplayBuffer with fixed-capacity circular experience storage
- Add PricingEnvironment: simulated marketplace with price-sensitive
  user behavior, demand fluctuation, and inventory dynamics
- Implement DQNTrainer with epsilon-greedy exploration, target network
  sync, Huber loss, gradient clipping, and training metrics
- Reward = revenue component + retention bonus - inventory penalty
- Model serialization to .pt via torch.save() checkpoint
- CLI args: --episodes, --batch-size, --lr, --epsilon-decay, etc.
- Update GIT_COMMANDS_LOG.md with Day 6 commands
- Member 3, Day 6: Phase 2 — Core Module Implementation"
```

**What it does**: Commits Member 3's work separately. The `feat(ml):` scope identifies this as an ML service change.

---

### Push Both Commits

#### P1. Verify Both Commits

```bash
git log --oneline -7
```

**What it does**: Shows the last 7 commits. You should see **two new commits** at the top — one for Member 1 and one for Member 3.

#### P2. Push to Remote (Both Branches)

```bash
git push origin master
git push origin master:main
```

**What it does**: Pushes both new commits to `master` and syncs to `main`. Both commits appear in the remote history in chronological order.

---

## Git Concepts Used Today

| Concept                          | Explanation                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Selective staging**            | `git add <path>` stages specific files instead of everything — enables per-member commits             |
| **Staging a deletion**           | `git add <deleted-file>` stages the file removal — Git tracks it as a "delete" in the commit          |
| **Scoped conventional commits** | `feat(ledger):` and `feat(ml):` scopes identify which component a commit belongs to                   |
| **Multiple commits per day**     | Separate commits per member make git history clearer for evaluation and code review                    |
| **`git diff -- <path>`**        | Shows diff for a specific file — useful for reviewing individual new files before staging             |
| **Dual branch push**             | `git push origin master` + `git push origin master:main` keeps both branches synchronized             |

---

## Day 7 — March 22, 2026 (Concurrent Transactions + Dynamic Pricing API)

> **Consistency from Day 6**: Continuing the practice of **two separate commits per day** to delineate Member 1 (Ledger) and Member 3 (ML) responsibilities.

### Commit A — Member 1: Concurrent Transaction Safety

#### A1. Stage Member 1's Files Selectively

```bash
git add ledger-accounting-service/services/concurrency_manager.go
```

**What it does**: Stages only the new concurrency manager implementation.

#### A2. Verify Only Member 1's Files Are Staged

```bash
git status
```

**What it does**: Confirms that only `concurrency_manager.go` is staged under "Changes to be committed."

#### A3. Commit Member 1's Work

```bash
git commit -m "feat(ledger): add concurrent transaction safety and row-level locking

- Add concurrency_manager.go in Ledger Accounting Service
- Implement SerializableTransactionManager fulfilling TransactionManager interface
- Enforce SERIALIZABLE isolation level (preventing write skew and phantom reads)
- Add SELECT ... FOR UPDATE row-level locking for wallet and partner points
- Implement 3-attempt exponential backoff retry for transient serialization failures (40001)
- Map database operations (journals, ledger lines, GST records) to safe prepared statements
- Member 1, Day 7: Phase 2 — Core Module Implementation"
```

**What it does**: Commits Member 1's work with the `feat(ledger):` scope, detailing the ACID compliance and isolation achievements.

---

### Commit B — Member 3: Dynamic Pricing API

#### B1. Stage Member 3's Files and Updated Log

```bash
git add intelligence-ml-service/api/dynamic_pricing_routes.py
git add intelligence-ml-service/main.py
git add GIT_COMMANDS_LOG.md
```

**What it does**: Stages Member 3's new API route, the main app wiring changes, and this updated Git log.

#### B2. Verify Only Member 3's Files Are Staged

```bash
git status
```

**What it does**: Confirms the ML service routing changes and log are staged.

#### B3. Commit Member 3's Work

```bash
git commit -m "feat(ml): add dynamic pricing API endpoint with DQN inference

- Add dynamic_pricing_routes.py with POST /quote endpoint
- Implement sub-100ms DQN inference pipeline using pre-trained model registry
- Add time-bound quote generation (valid for 5 mins) and per-user cooldowns
- Define PricingQuoteRequest and PricingQuoteResponse Pydantic models
- Wire /api/v1/pricing router into main.py
- Add GET /model-status health endpoint for the pricing agent
- Update GIT_COMMANDS_LOG.md with Day 7 commands
- Member 3, Day 7: Phase 2 — Core Module Implementation"
```

**What it does**: Commits Member 3's work alongside the updated documentation with the `feat(ml):` scope.

---

### Push Both Commits

#### P1. Verify Both Commits

```bash
git log --oneline -9
```

**What it does**: Shows the last 9 commits, assuring the two new Day 7 commits sit cleanly atop the chronological history.

#### P2. Push to Remote (Both Branches)

```bash
git push origin master
git push origin master:main
```

**What it does**: Pushes both new commits to `master` and syncs to `main` for complete evaluator visibility.

---

## Git Concepts Used Today

| Concept                          | Explanation                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Separation of Concerns (Git)** | Maintaining discrete commits for distinct logical architectural components (Ledger vs. ML)            |
| **Multi-file staging**           | Passing multiple file paths to a single `git add` command for grouped functionality                   |
| **Audit trail preservation**     | Keeping the log synchronized perfectly with the commit tree via `B1/B3` inclusion strategy            |
