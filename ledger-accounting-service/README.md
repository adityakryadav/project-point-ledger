# Ledger Accounting Service

Core financial backend service for the ILPEP (Indian Loyalty Points Exchange Platform).

## Responsibilities

- **PostgreSQL Schema**: All 11 database tables (users, wallets, transactions, journal entries, ledger lines, GST records, fraud logs, STR reports, audit logs)
- **Double-Entry Bookkeeping**: Every debit has an equal and opposite credit (`total_debit = total_credit`)
- **Atomic Transactions**: `CommitExchangeTransaction()` — ACID-compliant exchange execution with full rollback on failure
- **GST Computation**: 18% GST split (CGST 9% + SGST 9% for intra-state, IGST 18% for inter-state)
- **PPI Compliance**: RBI-mandated wallet limits (Small PPI: ₹10K/month, Full KYC: ₹2L balance)
- **Financial Integrity**: Row-level locking, serializable isolation for concurrent transaction safety

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Go 1.21+ | Primary language |
| PostgreSQL 15 | Financial database (ACID, double-entry) |
| SQL migrations | Schema versioning |

## Directory Structure

```
├── db/
│   └── migrations/           # Ordered SQL migration scripts
│       ├── 001_initial_schema.sql    # All 11 tables
│       └── 002_tax_compliance.sql    # Triggers & constraints (Day 2)
├── models/                   # Go structs & DB interfaces
├── services/                 # Business logic (transaction processor)
├── handlers/                 # HTTP API handlers
├── tests/                    # Integration & unit tests
├── go.mod                    # Go module definition
└── README.md
```

## Database Tables (11)

1. `users` — User identity with tiered KYC
2. `wallets` — PPI wallet balances with load constraints
3. `partner_merchants` — External loyalty program partners
4. `loyalty_accounts` — User-partner point account linkage
5. `exchange_transactions` — Core exchange records
6. `journal_entries` — Double-entry header (debit = credit)
7. `ledger_lines` — Individual debit/credit line items
8. `gst_records` — GST tax records (CGST/SGST/IGST)
9. `fraud_logs` — ML fraud scoring audit trail
10. `str_reports` — Suspicious Transaction Reports (FIU-IND)
11. `audit_logs` — Immutable append-only audit trail

## Setup

```bash
# Apply initial schema to PostgreSQL
psql -U postgres -d ilpep -f db/migrations/001_initial_schema.sql
```

## Running Tests

To verify ACID invariants, double-entry logic, PPI limits, and idempotency checks, run the Golang test suite:
```bash
go test ./tests/... -v
```

## Running the Service

Build and run the Ledger HTTP handler mapping (defaults to port 8080):
```bash
go run .
```
*(Ensure PostgreSQL configuration is injected correctly when launching).*
