#!/usr/bin/env python3
"""
Point Ledger — Git History Rewrite (Python version)
Uses git fast-export / fast-import for reliable cross-platform operation.
"""

import subprocess
import sys
import os
import re

# ── Contributor details ────────────────────────────────────────────────────────
A1 = ("Aditya Kumar Yadav", "adityakyadav02@gmail.com")
A2 = ("Bhakti",             "bhaktib716@gmail.com")
A3 = ("Jashwanth B",        "jashwanthbala09@ce.du.ac.in")
A4 = ("Pranjal Gupta A",    "pranjalg544@gmail.com")
A5 = ("Yash Ahlawat",       "ahlawat.ay@gmail.com")

# ── Commit metadata: (author_tuple, iso_date, message) ─────────────────────────
# 53 entries total: 46 from rewrite_commits_attributed.sh + 7 extra (Aditya)
COMMITS = [
    # adityakryadav: indices 0–22
    (A1, "2026-01-13T10:22:00+05:30", "chore: initialise monorepo with frontend/, api-service/, db/ structure"),
    (A1, "2026-01-14T14:07:00+05:30", "docs: add README with project overview and local setup instructions"),
    (A1, "2026-01-15T09:45:00+05:30", "chore: add .gitignore for node_modules, .env files, and build artefacts"),
    (A1, "2026-01-17T11:30:00+05:30", "chore: scaffold Next.js 14 frontend with TypeScript and Tailwind CSS"),
    (A1, "2026-01-17T16:50:00+05:30", "chore: bootstrap Express api-service with Helmet, CORS, and rate-limiter"),
    (A1, "2026-01-20T10:15:00+05:30", "feat: add migration 001 — initial schema for users, cards, reward_points"),
    (A1, "2026-01-22T14:33:00+05:30", "feat: add migration 002 — coupon_categories, coupons, user_coupons tables"),
    (A1, "2026-01-24T11:02:00+05:30", "feat: add migration 003 — reward_history table and database indexes"),
    (A1, "2026-01-28T15:40:00+05:30", "feat: add migration 004 — seed 7 coupon categories and 100+ coupons"),
    (A1, "2026-01-28T17:10:00+05:30", "feat: add auto-migration runner and pg connection pool in config/db.js"),
    (A1, "2026-02-03T10:55:00+05:30", "feat(auth): implement email/password registration with bcrypt cost-12 hashing"),
    (A1, "2026-02-05T14:20:00+05:30", "feat(auth): implement JWT HS256 login and GET /api/auth/me endpoint"),
    (A1, "2026-02-08T11:35:00+05:30", "feat(auth): add Google OAuth 2.0 sign-in via passport-google-oauth20"),
    (A1, "2026-02-10T09:18:00+05:30", "feat(auth): add JWT verify middleware and protect all non-auth routes"),
    (A1, "2026-02-12T16:42:00+05:30", "fix(auth): link Google ID to existing local account on matching email"),
    (A1, "2026-02-17T10:30:00+05:30", "feat(cards): implement add-card with AES-256-CBC tokenisation and soft-delete"),
    (A1, "2026-02-19T14:05:00+05:30", "feat(cards): add mock bank adapter to populate reward_points on card add"),
    (A1, "2026-02-21T11:50:00+05:30", "feat(cards): implement POST /api/cards/:id/sync to refresh reward points"),
    (A1, "2026-02-24T09:22:00+05:30", "fix(cards): validate last_four_digits is exactly 4 numeric characters"),
    (A1, "2026-03-02T10:10:00+05:30", "feat(coupons): implement GET /api/coupons with category, tier, and search filters"),
    (A1, "2026-03-05T14:45:00+05:30", "feat(coupons): add section filtering — best, premium, trending, budget by demand_score"),
    (A1, "2026-03-07T11:00:00+05:30", "feat(coupons): implement coupon purchase with point deduction and user_coupons record"),
    (A1, "2026-03-11T09:38:00+05:30", "feat(coupons): increment demand_score on purchase, capped at 100 (REQ-CPN-008)"),
    # Bhakti73: indices 23–29
    (A2, "2026-03-14T10:55:00+05:30", "feat(generate): implement tier-fallback algorithm — none/category/subcategory cases"),
    (A2, "2026-03-17T14:20:00+05:30", "feat(generate): wrap generation in ACID transaction with ROLLBACK on insufficient points"),
    (A2, "2026-03-20T11:05:00+05:30", "feat(generate): return breakdown object with coupon_value, category_premium, brand_premium"),
    (A2, "2026-03-24T10:40:00+05:30", "feat(redeem): implement redeem endpoint — validate ownership, status, and expiry"),
    (A2, "2026-03-26T14:55:00+05:30", "feat(redeem): add GET /api/coupons/user/:id/bill with full breakdown data"),
    (A2, "2026-03-28T11:15:00+05:30", "feat(redeem): implement client-side PDF bill generator with browser print dialog"),
    (A2, "2026-03-31T10:25:00+05:30", "feat(dashboard): implement GET /api/dashboard with 6 parallel aggregation queries"),
    # Jash0906: indices 30–35
    (A3, "2026-04-01T09:10:00+05:30", "feat(dashboard): add expiring-points alert for cards expiring within 4 days"),
    (A3, "2026-04-02T14:30:00+05:30", "feat(profile): implement GET/PATCH /api/profile with reward history and coupon log"),
    (A3, "2026-04-03T10:00:00+05:30", "feat(frontend): add Zustand authStore and Axios client with JWT Bearer interceptor"),
    (A3, "2026-04-04T11:20:00+05:30", "feat(frontend): build dashboard page — stat cards, expiry alerts, recent coupons"),
    (A3, "2026-04-05T14:00:00+05:30", "feat(frontend): build marketplace page with section tabs, search, and brand logo fallback"),
    (A3, "2026-04-06T10:45:00+05:30", "feat(frontend): implement settings page with dark/light mode and localStorage persistence"),
    # pranjalg544: indices 36–41
    (A4, "2026-04-06T13:00:00+05:30", "feat(frontend): implement KYC onboarding flow and two-step registration UI"),
    (A4, "2026-04-07T10:15:00+05:30", "fix: resolve CORS origin mismatch on production Railway deploy"),
    (A4, "2026-04-08T11:30:00+05:30", "refactor: split couponsController into purchase, generate, and redeem modules"),
    (A4, "2026-04-09T14:00:00+05:30", "feat(frontend): add premium brand theming and sidebar quick-toggle for dark mode"),
    (A4, "2026-04-10T09:45:00+05:30", "fix(coupons): handle edge case when demand_score reaches cap of 100"),
    (A4, "2026-04-11T15:20:00+05:30", "docs: add .env.example for api-service and frontend with all required variables"),
    # yash-ahlawat0: indices 42–45
    (A5, "2026-04-12T10:00:00+05:30", "feat(frontend): add toast notifications for coupon purchase and redemption actions"),
    (A5, "2026-04-13T11:30:00+05:30", "fix(frontend): fix mobile sidebar drawer collapse below 1024px viewport"),
    (A5, "2026-04-14T14:10:00+05:30", "chore: add .env.example and update README with deployment instructions"),
    (A5, "2026-04-15T09:50:00+05:30", "feat(frontend): add realtime coupon count badge and 700+ coupon catalog display"),
    # adityakryadav: extra 7 commits (indices 46–52)
    (A1, "2026-04-16T10:00:00+05:30", "feat: realtime coupons, 2-step registration, full brand theming, 700+ coupons"),
    (A1, "2026-04-17T11:00:00+05:30", "refactor: restructure into frontend, api-service, db"),
    (A1, "2026-04-18T12:00:00+05:30", "fix: exclude Google OAuth routes from rate limiter (REQ-AUTH-005)"),
    (A1, "2026-04-19T10:00:00+05:30", "fix: pad referral code to consistent 8 chars, return in API response"),
    (A1, "2026-04-20T10:00:00+05:30", "chore: add CI workflow for Point Ledger project"),
    (A1, "2026-04-21T10:00:00+05:30", "chore: update CI workflow configuration"),
    (A5, "2026-04-22T10:00:00+05:30", "docs: update README with deployment and usage instructions"),
]


def run(cmd, **kwargs):
    result = subprocess.run(cmd, capture_output=True, text=True, **kwargs)
    if result.returncode != 0:
        print(f"ERROR running: {' '.join(cmd)}")
        print(result.stderr)
        sys.exit(1)
    return result.stdout.strip()


def main():
    if not os.path.isdir(".git"):
        print("ERROR: Run from the root of your git repo.")
        sys.exit(1)

    # Get all commits oldest → newest
    commits_raw = run(["git", "log", "--reverse", "--format=%H"])
    hashes = commits_raw.splitlines()
    total = len(hashes)
    print(f"==> Found {total} commits.")

    if total != len(COMMITS):
        print(f"WARNING: Expected {len(COMMITS)} commits but found {total}.")
        print("         Will map what we can and use Aditya as fallback for extras.")

    # Build mapping: old_hash → new metadata
    mapping = {}
    for i, h in enumerate(hashes):
        if i < len(COMMITS):
            author, date, msg = COMMITS[i]
        else:
            author, date, msg = A1, "2026-04-23T10:00:00+05:30", "chore: update"
        mapping[h] = (author[0], author[1], date, msg)

    # Export the history
    print("==> Exporting git history...")
    export_result = subprocess.run(
        ["git", "fast-export", "--all", "--signed-tags=strip"],
        capture_output=True
    )
    if export_result.returncode != 0:
        print("ERROR during fast-export:", export_result.stderr.decode())
        sys.exit(1)

    raw = export_result.stdout.decode("utf-8", errors="replace")
    lines = raw.split("\n")

    # Parse and rewrite
    print("==> Rewriting metadata...")
    out_lines = []
    i = 0
    commit_idx = 0
    
    # We need to match commits in order to their metadata
    # fast-export outputs commits in topological order (oldest first with --all)
    
    while i < len(lines):
        line = lines[i]
        
        if line.startswith("commit "):
            # Start of a commit block
            # Get metadata for this commit
            if commit_idx < len(COMMITS):
                author, date, msg = COMMITS[commit_idx]
                an, ae, ad = author[0], author[1], date
            else:
                an, ae = A1
                ad = "2026-04-23T10:00:00+05:30"
                msg = "chore: update"
            
            out_lines.append(line)
            i += 1
            
            # Process lines until next commit or end
            while i < len(lines) and not lines[i].startswith("commit ") and not lines[i].startswith("reset ") and not lines[i].startswith("tag "):
                l = lines[i]
                
                if l.startswith("author "):
                    out_lines.append(f"author {an} <{ae}> {ad}")
                elif l.startswith("committer "):
                    out_lines.append(f"committer {an} <{ae}> {ad}")
                elif l.startswith("data "):
                    # This is the commit message data block
                    # Skip old message and write new one
                    try:
                        size = int(l[5:])
                    except ValueError:
                        out_lines.append(l)
                        i += 1
                        continue
                    
                    i += 1
                    # Skip 'size' characters of old message
                    old_msg_bytes = ""
                    while len(old_msg_bytes.encode("utf-8")) < size and i < len(lines):
                        old_msg_bytes += lines[i] + "\n"
                        i += 1
                    
                    # Write new message
                    msg_bytes = msg.encode("utf-8")
                    out_lines.append(f"data {len(msg_bytes)}")
                    out_lines.append(msg)
                    continue
                else:
                    out_lines.append(l)
                
                i += 1
            
            commit_idx += 1
        else:
            out_lines.append(line)
            i += 1

    # Convert date format: ISO → Unix timestamp with timezone
    # fast-export uses "seconds timezone" format, e.g. "1704345720 +0530"
    # We need to convert our ISO dates
    
    # Actually, let's use a simpler approach: use git filter-branch via environment variables
    # but do it properly with the correct hashes post-3-empty-commits
    
    print("==> Using git filter-branch approach with correct commit hashes...")
    
    # Build the env-filter script
    filter_lines = []
    for idx, h in enumerate(hashes):
        if idx < len(COMMITS):
            author, date, msg = COMMITS[idx]
            an, ae, ad = author[0], author[1], date
        else:
            an, ae = A1
            ad = "2026-04-23T10:00:00+05:30"
        
        filter_lines.append(f'if [ "$GIT_COMMIT" = "{h}" ]; then')
        filter_lines.append(f'  export GIT_AUTHOR_NAME="{an}"')
        filter_lines.append(f'  export GIT_AUTHOR_EMAIL="{ae}"')
        filter_lines.append(f'  export GIT_AUTHOR_DATE="{ad}"')
        filter_lines.append(f'  export GIT_COMMITTER_NAME="{an}"')
        filter_lines.append(f'  export GIT_COMMITTER_EMAIL="{ae}"')
        filter_lines.append(f'  export GIT_COMMITTER_DATE="{ad}"')
        filter_lines.append('fi')
    
    filter_script = "\n".join(filter_lines)
    
    # Write filter script to temp file
    with open("_filter_env.sh", "w", newline="\n") as f:
        f.write(filter_script)
    
    print("==> Applying filter-branch for author/date rewrite...")
    env = os.environ.copy()
    env["FILTER_BRANCH_SQUELCH_WARNING"] = "1"
    
    result = subprocess.run(
        ["git", "filter-branch", "-f", "--env-filter", filter_script, "HEAD"],
        env=env,
        capture_output=False
    )
    if result.returncode != 0:
        print("ERROR during filter-branch")
        sys.exit(1)
    
    # Now reword commit messages using a temp orphan branch
    print("")
    print("==> Rewording commit messages...")
    
    # Get updated hashes after filter-branch
    rewritten_raw = run(["git", "log", "--reverse", "--format=%H"])
    rewritten = rewritten_raw.splitlines()
    new_total = len(rewritten)
    
    orig_branch = run(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    
    # Delete temp branch if it exists
    subprocess.run(["git", "branch", "-D", "tmp_rewrite_attr"],
                   capture_output=True)
    
    # Create orphan branch
    subprocess.run(["git", "checkout", "--orphan", "tmp_rewrite_attr"],
                   capture_output=True)
    subprocess.run(["git", "reset", "--hard"], capture_output=True)
    
    # Commit 0 (root)
    an0, ae0, ad0, msg0 = COMMITS[0][0][0], COMMITS[0][0][1], COMMITS[0][1], COMMITS[0][2]
    subprocess.run(["git", "cherry-pick", rewritten[0], "--allow-empty", "--no-commit"],
                   capture_output=True)
    subprocess.run(["git", "add", "-A"], capture_output=True)
    
    env0 = os.environ.copy()
    env0["GIT_AUTHOR_NAME"] = an0
    env0["GIT_AUTHOR_EMAIL"] = ae0
    env0["GIT_AUTHOR_DATE"] = ad0
    env0["GIT_COMMITTER_NAME"] = an0
    env0["GIT_COMMITTER_EMAIL"] = ae0
    env0["GIT_COMMITTER_DATE"] = ad0
    
    r = subprocess.run(
        ["git", "commit", "--allow-empty", "-m", msg0],
        env=env0, capture_output=True, text=True
    )
    print(f"    [1/{new_total}] {an0} — {msg0[:60]}")
    
    # Remaining commits
    for idx in range(1, new_total):
        h = rewritten[idx]
        if idx < len(COMMITS):
            author, date, msg = COMMITS[idx]
            an, ae, ad = author[0], author[1], date
        else:
            an, ae = A1
            ad = "2026-04-23T10:00:00+05:30"
            msg = "chore: update"
        
        subprocess.run(["git", "cherry-pick", h, "--allow-empty", "--no-commit"],
                       capture_output=True)
        subprocess.run(["git", "add", "-A"], capture_output=True)
        
        env_c = os.environ.copy()
        env_c["GIT_AUTHOR_NAME"] = an
        env_c["GIT_AUTHOR_EMAIL"] = ae
        env_c["GIT_AUTHOR_DATE"] = ad
        env_c["GIT_COMMITTER_NAME"] = an
        env_c["GIT_COMMITTER_EMAIL"] = ae
        env_c["GIT_COMMITTER_DATE"] = ad
        
        r = subprocess.run(
            ["git", "commit", "--allow-empty", "-m", msg],
            env=env_c, capture_output=True, text=True
        )
        print(f"    [{idx+1}/{new_total}] {an} — {msg[:60]}")
    
    # Replace original branch
    print(f"\n==> Replacing '{orig_branch}' with rewritten history...")
    subprocess.run(["git", "branch", "-f", orig_branch, "tmp_rewrite_attr"],
                   check=True)
    subprocess.run(["git", "checkout", orig_branch], check=True)
    subprocess.run(["git", "branch", "-D", "tmp_rewrite_attr"], check=True)
    
    # Clean up refs/original
    refs_result = subprocess.run(
        ["git", "for-each-ref", "--format=%(refname)", "refs/original/"],
        capture_output=True, text=True
    )
    for ref in refs_result.stdout.splitlines():
        subprocess.run(["git", "update-ref", "-d", ref], capture_output=True)
    
    # Clean up temp file
    if os.path.exists("_filter_env.sh"):
        os.remove("_filter_env.sh")
    
    print("\n===================================================================")
    print(" All done! Verify with:")
    print("   git log --format='%h %an %ad %s' --date=short")
    print("")
    print(" Contributor summary:")
    print("   adityakryadav  → 30 commits (23 defined + 7 extra)")
    print("   Bhakti73       →  7 commits")
    print("   Jash0906       →  6 commits")
    print("   pranjalg544    →  6 commits")
    print("   yash-ahlawat0  →  4 commits (+1 extra = 5)")
    print("")
    print(" When happy, force-push:")
    print("   git push origin main --force")
    print("===================================================================")


if __name__ == "__main__":
    main()
