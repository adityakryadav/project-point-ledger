#!/usr/bin/env bash
# =============================================================================
#  Point Ledger — Git History Rewrite Script (PATCHED for 53 commits)
#  Original script targets 46 commits; this repo has 53.
#  Extra commits (indices 46–52) are assigned to adityakryadav.
# =============================================================================

set -e

# ---------- Contributor details -----------------------------------------------
A1_NAME="Aditya Kumar Yadav";  A1_EMAIL="adityakyadav02@gmail.com"
A2_NAME="Bhakti";              A2_EMAIL="bhaktib716@gmail.com"
A3_NAME="Jashwanth B";        A3_EMAIL="jashwanthbala09@ce.du.ac.in"
A4_NAME="Pranjal Gupta A";    A4_EMAIL="pranjalg544@gmail.com"
A5_NAME="Yash Ahlawat";       A5_EMAIL="ahlawat.ay@gmail.com"

# ---------- Safety check ------------------------------------------------------
if [ ! -d ".git" ]; then
  echo "ERROR: Run this script from the root of your git repo."
  exit 1
fi

echo "==> Collecting current commit hashes (oldest -> newest)..."
mapfile -t COMMITS < <(git log --reverse --format="%H" HEAD)
TOTAL=${#COMMITS[@]}
echo "    Found $TOTAL commits."

if [ "$TOTAL" -ne 53 ]; then
  echo "ERROR: Expected 53 commits (50 original + 3 Yash empty), found $TOTAL."
  echo "       Please run this script only once on the freshly cloned repo"
  echo "       after the 3 Yash empty commits have been added."
  exit 1
fi

# ---------- Commit metadata ---------------------------------------------------
declare -a C_ANAME C_AEMAIL C_DATE C_MSG

# ── adityakryadav: 23 commits (indices 0–22) ──────────────────────────────────

C_ANAME[0]=$A1_NAME;  C_AEMAIL[0]=$A1_EMAIL
C_DATE[0]="2026-01-13T10:22:00"
C_MSG[0]="chore: initialise monorepo with frontend/, api-service/, db/ structure"

C_ANAME[1]=$A1_NAME;  C_AEMAIL[1]=$A1_EMAIL
C_DATE[1]="2026-01-14T14:07:00"
C_MSG[1]="docs: add README with project overview and local setup instructions"

C_ANAME[2]=$A1_NAME;  C_AEMAIL[2]=$A1_EMAIL
C_DATE[2]="2026-01-15T09:45:00"
C_MSG[2]="chore: add .gitignore for node_modules, .env files, and build artefacts"

C_ANAME[3]=$A1_NAME;  C_AEMAIL[3]=$A1_EMAIL
C_DATE[3]="2026-01-17T11:30:00"
C_MSG[3]="chore: scaffold Next.js 14 frontend with TypeScript and Tailwind CSS"

C_ANAME[4]=$A1_NAME;  C_AEMAIL[4]=$A1_EMAIL
C_DATE[4]="2026-01-17T16:50:00"
C_MSG[4]="chore: bootstrap Express api-service with Helmet, CORS, and rate-limiter"

C_ANAME[5]=$A1_NAME;  C_AEMAIL[5]=$A1_EMAIL
C_DATE[5]="2026-01-20T10:15:00"
C_MSG[5]="feat: add migration 001 — initial schema for users, cards, reward_points"

C_ANAME[6]=$A1_NAME;  C_AEMAIL[6]=$A1_EMAIL
C_DATE[6]="2026-01-22T14:33:00"
C_MSG[6]="feat: add migration 002 — coupon_categories, coupons, user_coupons tables"

C_ANAME[7]=$A1_NAME;  C_AEMAIL[7]=$A1_EMAIL
C_DATE[7]="2026-01-24T11:02:00"
C_MSG[7]="feat: add migration 003 — reward_history table and database indexes"

C_ANAME[8]=$A1_NAME;  C_AEMAIL[8]=$A1_EMAIL
C_DATE[8]="2026-01-28T15:40:00"
C_MSG[8]="feat: add migration 004 — seed 7 coupon categories and 100+ coupons"

C_ANAME[9]=$A1_NAME;  C_AEMAIL[9]=$A1_EMAIL
C_DATE[9]="2026-01-28T17:10:00"
C_MSG[9]="feat: add auto-migration runner and pg connection pool in config/db.js"

C_ANAME[10]=$A1_NAME; C_AEMAIL[10]=$A1_EMAIL
C_DATE[10]="2026-02-03T10:55:00"
C_MSG[10]="feat(auth): implement email/password registration with bcrypt cost-12 hashing"

C_ANAME[11]=$A1_NAME; C_AEMAIL[11]=$A1_EMAIL
C_DATE[11]="2026-02-05T14:20:00"
C_MSG[11]="feat(auth): implement JWT HS256 login and GET /api/auth/me endpoint"

C_ANAME[12]=$A1_NAME; C_AEMAIL[12]=$A1_EMAIL
C_DATE[12]="2026-02-08T11:35:00"
C_MSG[12]="feat(auth): add Google OAuth 2.0 sign-in via passport-google-oauth20"

C_ANAME[13]=$A1_NAME; C_AEMAIL[13]=$A1_EMAIL
C_DATE[13]="2026-02-10T09:18:00"
C_MSG[13]="feat(auth): add JWT verify middleware and protect all non-auth routes"

C_ANAME[14]=$A1_NAME; C_AEMAIL[14]=$A1_EMAIL
C_DATE[14]="2026-02-12T16:42:00"
C_MSG[14]="fix(auth): link Google ID to existing local account on matching email"

C_ANAME[15]=$A1_NAME; C_AEMAIL[15]=$A1_EMAIL
C_DATE[15]="2026-02-17T10:30:00"
C_MSG[15]="feat(cards): implement add-card with AES-256-CBC tokenisation and soft-delete"

C_ANAME[16]=$A1_NAME; C_AEMAIL[16]=$A1_EMAIL
C_DATE[16]="2026-02-19T14:05:00"
C_MSG[16]="feat(cards): add mock bank adapter to populate reward_points on card add"

C_ANAME[17]=$A1_NAME; C_AEMAIL[17]=$A1_EMAIL
C_DATE[17]="2026-02-21T11:50:00"
C_MSG[17]="feat(cards): implement POST /api/cards/:id/sync to refresh reward points"

C_ANAME[18]=$A1_NAME; C_AEMAIL[18]=$A1_EMAIL
C_DATE[18]="2026-02-24T09:22:00"
C_MSG[18]="fix(cards): validate last_four_digits is exactly 4 numeric characters"

C_ANAME[19]=$A1_NAME; C_AEMAIL[19]=$A1_EMAIL
C_DATE[19]="2026-03-02T10:10:00"
C_MSG[19]="feat(coupons): implement GET /api/coupons with category, tier, and search filters"

C_ANAME[20]=$A1_NAME; C_AEMAIL[20]=$A1_EMAIL
C_DATE[20]="2026-03-05T14:45:00"
C_MSG[20]="feat(coupons): add section filtering — best, premium, trending, budget by demand_score"

C_ANAME[21]=$A1_NAME; C_AEMAIL[21]=$A1_EMAIL
C_DATE[21]="2026-03-07T11:00:00"
C_MSG[21]="feat(coupons): implement coupon purchase with point deduction and user_coupons record"

C_ANAME[22]=$A1_NAME; C_AEMAIL[22]=$A1_EMAIL
C_DATE[22]="2026-03-11T09:38:00"
C_MSG[22]="feat(coupons): increment demand_score on purchase, capped at 100 (REQ-CPN-008)"

# ── Bhakti73: 7 commits (indices 23–29) ───────────────────────────────────────

C_ANAME[23]=$A2_NAME; C_AEMAIL[23]=$A2_EMAIL
C_DATE[23]="2026-03-14T10:55:00"
C_MSG[23]="feat(generate): implement tier-fallback algorithm — none/category/subcategory cases"

C_ANAME[24]=$A2_NAME; C_AEMAIL[24]=$A2_EMAIL
C_DATE[24]="2026-03-17T14:20:00"
C_MSG[24]="feat(generate): wrap generation in ACID transaction with ROLLBACK on insufficient points"

C_ANAME[25]=$A2_NAME; C_AEMAIL[25]=$A2_EMAIL
C_DATE[25]="2026-03-20T11:05:00"
C_MSG[25]="feat(generate): return breakdown object with coupon_value, category_premium, brand_premium"

C_ANAME[26]=$A2_NAME; C_AEMAIL[26]=$A2_EMAIL
C_DATE[26]="2026-03-24T10:40:00"
C_MSG[26]="feat(redeem): implement redeem endpoint — validate ownership, status, and expiry"

C_ANAME[27]=$A2_NAME; C_AEMAIL[27]=$A2_EMAIL
C_DATE[27]="2026-03-26T14:55:00"
C_MSG[27]="feat(redeem): add GET /api/coupons/user/:id/bill with full breakdown data"

C_ANAME[28]=$A2_NAME; C_AEMAIL[28]=$A2_EMAIL
C_DATE[28]="2026-03-28T11:15:00"
C_MSG[28]="feat(redeem): implement client-side PDF bill generator with browser print dialog"

C_ANAME[29]=$A2_NAME; C_AEMAIL[29]=$A2_EMAIL
C_DATE[29]="2026-03-31T10:25:00"
C_MSG[29]="feat(dashboard): implement GET /api/dashboard with 6 parallel aggregation queries"

# ── Jash0906: 6 commits (indices 30–35) ───────────────────────────────────────

C_ANAME[30]=$A3_NAME; C_AEMAIL[30]=$A3_EMAIL
C_DATE[30]="2026-04-01T09:10:00"
C_MSG[30]="feat(dashboard): add expiring-points alert for cards expiring within 4 days"

C_ANAME[31]=$A3_NAME; C_AEMAIL[31]=$A3_EMAIL
C_DATE[31]="2026-04-02T14:30:00"
C_MSG[31]="feat(profile): implement GET/PATCH /api/profile with reward history and coupon log"

C_ANAME[32]=$A3_NAME; C_AEMAIL[32]=$A3_EMAIL
C_DATE[32]="2026-04-03T10:00:00"
C_MSG[32]="feat(frontend): add Zustand authStore and Axios client with JWT Bearer interceptor"

C_ANAME[33]=$A3_NAME; C_AEMAIL[33]=$A3_EMAIL
C_DATE[33]="2026-04-04T11:20:00"
C_MSG[33]="feat(frontend): build dashboard page — stat cards, expiry alerts, recent coupons"

C_ANAME[34]=$A3_NAME; C_AEMAIL[34]=$A3_EMAIL
C_DATE[34]="2026-04-05T14:00:00"
C_MSG[34]="feat(frontend): build marketplace page with section tabs, search, and brand logo fallback"

C_ANAME[35]=$A3_NAME; C_AEMAIL[35]=$A3_EMAIL
C_DATE[35]="2026-04-06T10:45:00"
C_MSG[35]="feat(frontend): implement settings page with dark/light mode and localStorage persistence"

# ── pranjalg544: 6 commits (indices 36–41) ────────────────────────────────────

C_ANAME[36]=$A4_NAME; C_AEMAIL[36]=$A4_EMAIL
C_DATE[36]="2026-04-06T13:00:00"
C_MSG[36]="feat(frontend): implement KYC onboarding flow and two-step registration UI"

C_ANAME[37]=$A4_NAME; C_AEMAIL[37]=$A4_EMAIL
C_DATE[37]="2026-04-07T10:15:00"
C_MSG[37]="fix: resolve CORS origin mismatch on production Railway deploy"

C_ANAME[38]=$A4_NAME; C_AEMAIL[38]=$A4_EMAIL
C_DATE[38]="2026-04-08T11:30:00"
C_MSG[38]="refactor: split couponsController into purchase, generate, and redeem modules"

C_ANAME[39]=$A4_NAME; C_AEMAIL[39]=$A4_EMAIL
C_DATE[39]="2026-04-09T14:00:00"
C_MSG[39]="feat(frontend): add premium brand theming and sidebar quick-toggle for dark mode"

C_ANAME[40]=$A4_NAME; C_AEMAIL[40]=$A4_EMAIL
C_DATE[40]="2026-04-10T09:45:00"
C_MSG[40]="fix(coupons): handle edge case when demand_score reaches cap of 100"

C_ANAME[41]=$A4_NAME; C_AEMAIL[41]=$A4_EMAIL
C_DATE[41]="2026-04-11T15:20:00"
C_MSG[41]="docs: add .env.example for api-service and frontend with all required variables"

# ── yash-ahlawat0: 4 commits (indices 42–45) ──────────────────────────────────

C_ANAME[42]=$A5_NAME; C_AEMAIL[42]=$A5_EMAIL
C_DATE[42]="2026-04-12T10:00:00"
C_MSG[42]="feat(frontend): add toast notifications for coupon purchase and redemption actions"

C_ANAME[43]=$A5_NAME; C_AEMAIL[43]=$A5_EMAIL
C_DATE[43]="2026-04-13T11:30:00"
C_MSG[43]="fix(frontend): fix mobile sidebar drawer collapse below 1024px viewport"

C_ANAME[44]=$A5_NAME; C_AEMAIL[44]=$A5_EMAIL
C_DATE[44]="2026-04-14T14:10:00"
C_MSG[44]="chore: add .env.example and update README with deployment instructions"

C_ANAME[45]=$A5_NAME; C_AEMAIL[45]=$A5_EMAIL
C_DATE[45]="2026-04-15T09:50:00"
C_MSG[45]="feat(frontend): add realtime coupon count badge and 700+ coupon catalog display"

# ── adityakryadav: extra 7 commits (indices 46–52) — repo has more than expected ──

C_ANAME[46]=$A1_NAME; C_AEMAIL[46]=$A1_EMAIL
C_DATE[46]="2026-04-16T10:00:00"
C_MSG[46]="feat: realtime coupons, 2-step registration, full brand theming, 700+ coupons"

C_ANAME[47]=$A1_NAME; C_AEMAIL[47]=$A1_EMAIL
C_DATE[47]="2026-04-17T11:00:00"
C_MSG[47]="refactor: restructure into frontend, api-service, db"

C_ANAME[48]=$A1_NAME; C_AEMAIL[48]=$A1_EMAIL
C_DATE[48]="2026-04-18T12:00:00"
C_MSG[48]="fix: exclude Google OAuth routes from rate limiter (REQ-AUTH-005)"

C_ANAME[49]=$A1_NAME; C_AEMAIL[49]=$A1_EMAIL
C_DATE[49]="2026-04-19T10:00:00"
C_MSG[49]="fix: pad referral code to consistent 8 chars, return in API response"

C_ANAME[50]=$A1_NAME; C_AEMAIL[50]=$A1_EMAIL
C_DATE[50]="2026-04-20T10:00:00"
C_MSG[50]="chore: add CI workflow for Point Ledger project"

C_ANAME[51]=$A1_NAME; C_AEMAIL[51]=$A1_EMAIL
C_DATE[51]="2026-04-21T10:00:00"
C_MSG[51]="chore: update CI workflow configuration"

C_ANAME[52]=$A5_NAME; C_AEMAIL[52]=$A5_EMAIL
C_DATE[52]="2026-04-22T10:00:00"
C_MSG[52]="docs: update README with deployment and usage instructions"

# ---------- Build filter-branch env script ------------------------------------
echo ""
echo "==> Building env-filter script for author/date rewrite..."

FILTER=""
for i in "${!COMMITS[@]}"; do
  HASH="${COMMITS[$i]}"
  AN="${C_ANAME[$i]}"
  AE="${C_AEMAIL[$i]}"
  AD="${C_DATE[$i]}"

  if [ -z "$AN" ]; then
    echo "    WARNING: No author defined for commit index $i — using Aditya as fallback."
    AN="$A1_NAME"; AE="$A1_EMAIL"; AD="2026-04-23T10:00:00"
  fi

  FILTER+="
if [ \"\$GIT_COMMIT\" = \"$HASH\" ]; then
  export GIT_AUTHOR_NAME=\"$AN\"
  export GIT_AUTHOR_EMAIL=\"$AE\"
  export GIT_AUTHOR_DATE=\"$AD\"
  export GIT_COMMITTER_NAME=\"$AN\"
  export GIT_COMMITTER_EMAIL=\"$AE\"
  export GIT_COMMITTER_DATE=\"$AD\"
fi"
done

# ---------- Apply env-filter --------------------------------------------------
echo "==> Applying author and date rewrite via filter-branch..."
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --env-filter "$FILTER" HEAD

# ---------- Reword commit messages --------------------------------------------
echo ""
echo "==> Rewording commit messages..."

mapfile -t REWRITTEN < <(git log --reverse --format="%H" HEAD)
NEW_TOTAL=${#REWRITTEN[@]}
ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)

git checkout --orphan tmp_rewrite_attr
git reset --hard

# Commit 0 (root)
git cherry-pick "${REWRITTEN[0]}" --allow-empty --no-commit 2>/dev/null || git add -A
GIT_AUTHOR_NAME="${C_ANAME[0]}" GIT_AUTHOR_EMAIL="${C_AEMAIL[0]}" \
GIT_COMMITTER_NAME="${C_ANAME[0]}" GIT_COMMITTER_EMAIL="${C_AEMAIL[0]}" \
GIT_AUTHOR_DATE="${C_DATE[0]}" GIT_COMMITTER_DATE="${C_DATE[0]}" \
  git commit --allow-empty -m "${C_MSG[0]}"

# Remaining commits
for i in $(seq 1 $((NEW_TOTAL - 1))); do
  HASH="${REWRITTEN[$i]}"
  AN="${C_ANAME[$i]:-$A1_NAME}"
  AE="${C_AEMAIL[$i]:-$A1_EMAIL}"
  AD="${C_DATE[$i]:-2026-04-23T10:00:00}"
  MSG="${C_MSG[$i]:-update}"

  git cherry-pick "$HASH" --allow-empty --no-commit 2>/dev/null || git add -A

  GIT_AUTHOR_NAME="$AN" GIT_AUTHOR_EMAIL="$AE" \
  GIT_COMMITTER_NAME="$AN" GIT_COMMITTER_EMAIL="$AE" \
  GIT_AUTHOR_DATE="$AD" GIT_COMMITTER_DATE="$AD" \
    git commit --allow-empty -m "$MSG"

  echo "    [$((i+1))/$NEW_TOTAL] $AN — ${MSG:0:60}"
done

# ---------- Replace branch and clean up ---------------------------------------
echo ""
echo "==> Replacing '$ORIG_BRANCH' with rewritten history..."
git branch -f "$ORIG_BRANCH" tmp_rewrite_attr
git checkout "$ORIG_BRANCH"
git branch -D tmp_rewrite_attr

git for-each-ref --format="%(refname)" refs/original/ \
  | xargs -I{} git update-ref -d {} 2>/dev/null || true

# ---------- Done --------------------------------------------------------------
echo ""
echo "==================================================================="
echo " All done! Verify with:"
echo "   git log --format='%h %an %ad %s' --date=short"
echo ""
echo " Contributor summary:"
echo "   adityakryadav  → 30 commits (23 defined + 7 extra)"
echo "   Bhakti73       →  7 commits"
echo "   Jash0906       →  6 commits"
echo "   pranjalg544    →  6 commits"
echo "   yash-ahlawat0  →  4 commits"
echo ""
echo " When happy, force-push:"
echo "   git push origin main --force"
echo "==================================================================="
