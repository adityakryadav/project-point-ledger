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

| Concept | Explanation |
|---------|------------|
| **Working Directory** | Your actual files on disk |
| **Staging Area (Index)** | Files marked for the next commit via `git add` |
| **Repository (.git/)** | The committed history stored by Git |
| **Untracked files** | New files Git doesn't know about yet |
| **Commit** | A permanent snapshot of staged changes |

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

| Concept | Explanation |
|---------|-------------|
| **`git diff --cached`** | Shows changes that are staged (in the index) vs the last commit |
| **`--stat` flag** | Compact summary showing filenames and line change counts |
| **Partial staging** | Using `git add <path>` to stage specific files instead of everything |
| **Multi-line commit messages** | Using line breaks in `-m` flag for detailed commit descriptions |
| **`git log -n`** | Limiting log output to the most recent n commits |

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
**What it does**: Shows a summary of unstaged changes — file names and line counts. Useful to confirm you're about to stage the right things. Different from `git diff --cached --stat` which shows *staged* changes.

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

| Concept | Explanation |
|---------|-------------|
| **File deletion tracking** | `git add .` automatically stages deleted files — Git records the removal |
| **`git diff --stat`** | Shows unstaged changes summary (vs `git diff --cached --stat` for staged) |
| **Mixed operations** | A single commit can contain new files, modifications, AND deletions |
| **`.gitkeep` lifecycle** | `.gitkeep` is a convention to track empty directories; remove it once real files exist |
| **Conventional Commits** | `feat:` prefix indicates a new feature; body lists individual changes |

