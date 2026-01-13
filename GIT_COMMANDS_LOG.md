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
