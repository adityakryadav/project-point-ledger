# Point Ledger

A full-stack Credit Card Rewards Coupon Marketplace — aggregate reward points from all your cards and redeem them for curated coupons.

---

## Project Structure

```
point-ledger/
├── frontend/          # Next.js 14 + TypeScript + Tailwind CSS — user-facing web app
├── api-service/       # Node.js + Express — REST API (auth, cards, coupons, dashboard, profile)
└── db/                # PostgreSQL migrations and seed data
```

### Why this structure?

The backend logic (auth, cards, coupons, dashboard, profile) all share the same PostgreSQL database tightly — splitting them into separate microservices would add network overhead and complexity with no real benefit at this scale. They live together in `api-service/` as a well-organised monolith.

`db/` is separated out so migrations can be run independently of the API server and shared across any future services.

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Create the database
```bash
psql -U postgres -c "CREATE DATABASE point_ledger;"
```

### 2. Start the API
```bash
cd api-service
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, Google OAuth credentials
npm install
npm run dev
# Migrations run automatically on first start
```

### 3. Start the frontend
```bash
cd frontend
cp .env.example .env
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

App runs at **http://localhost:3000**

---

## Tech Stack

| Layer      | Stack                                              |
|------------|----------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS, Zustand      |
| API        | Node.js, Express, PostgreSQL, JWT, Passport.js     |
| Auth       | JWT RS256, Google OAuth 2.0, bcrypt                |
| Security   | Helmet, rate-limiting, AES-256 card tokenization   |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/google` | Google OAuth |
| GET  | `/api/dashboard` | Dashboard stats |
| GET/POST/DELETE | `/api/cards` | Card management |
| GET/POST | `/api/coupons` | Marketplace + generation |
| GET  | `/api/coupons/my-coupons` | User's coupons |
| POST | `/api/coupons/user/:id/redeem` | Redeem coupon |
| GET  | `/api/coupons/user/:id/bill` | Bill data for PDF |
| GET/PATCH | `/api/profile` | Profile |

---

## Database

All migrations live in `db/migrations/` and run in order on API startup:

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | All 7 core tables |
| `002_seed_data.sql` | Categories and initial coupons |
| `003_add_columns.sql` | Demand score + breakdown columns |
| `004_expanded_coupons.sql` | 100+ coupons with brand logos |
