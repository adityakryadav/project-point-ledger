-- ============================================================================
-- ILPEP — Indian Loyalty Points Exchange Platform
-- Migration 001: Initial Database Schema
-- 
-- All 11 tables as specified in the Software Design Document (SDD)
-- Database: PostgreSQL 15 (AWS Mumbai ap-south-1)
-- Design: 3NF, ACID-compliant, double-entry accounting, RBI data localization
-- ============================================================================

BEGIN;

-- ============================================================================
-- Table 1: users
-- Core user identity table with tiered KYC support
-- PAN stored as SHA-256 hash only (never raw)
-- Aadhaar stored as masked reference only
-- ============================================================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(100),
    pan_hash VARCHAR(64),                  -- SHA-256 hash, never raw PAN
    aadhaar_reference VARCHAR(20),         -- masked/reference only, no raw Aadhaar
    kyc_status VARCHAR(10) NOT NULL CHECK (kyc_status IN ('SMALL', 'FULL')),
    state_code VARCHAR(2) NOT NULL,        -- for GST CGST/SGST vs IGST determination
    kyc_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

COMMENT ON TABLE users IS 'Core user identity with tiered KYC (Small PPI / Full KYC)';
COMMENT ON COLUMN users.pan_hash IS 'SHA-256 hash of PAN card number — never store raw PAN';
COMMENT ON COLUMN users.aadhaar_reference IS 'Masked Aadhaar reference — never store raw Aadhaar';
COMMENT ON COLUMN users.state_code IS 'Indian state code for GST split (intra vs inter state)';

-- ============================================================================
-- Table 2: wallets
-- PPI wallet with RBI-mandated balance and load constraints
-- Business rules enforced via triggers (see migration 002)
--   Small PPI: monthly_load ≤ ₹10,000 | yearly_load ≤ ₹1,20,000
--   Full KYC:  balance ≤ ₹2,00,000
-- ============================================================================
CREATE TABLE wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    balance_inr DECIMAL(18,2) DEFAULT 0.00 CHECK (balance_inr >= 0),
    monthly_load_inr DECIMAL(18,2) DEFAULT 0.00,
    yearly_load_inr DECIMAL(18,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE wallets IS 'PPI wallet with RBI balance/load constraints per KYC tier';

-- ============================================================================
-- Table 3: partner_merchants
-- External loyalty program partners (banks, e-commerce, airlines, etc.)
-- ============================================================================
CREATE TABLE partner_merchants (
    partner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name VARCHAR(100) NOT NULL,
    api_endpoint TEXT NOT NULL,
    auth_type VARCHAR(50),                 -- e.g., 'OAUTH2', 'API_KEY', 'HMAC'
    settlement_account VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE partner_merchants IS 'External loyalty program partners (banks, airlines, e-commerce)';

-- ============================================================================
-- Table 4: loyalty_accounts
-- Links a user to their external loyalty program account at a partner
-- Points balance is synced periodically from partner APIs
-- ============================================================================
CREATE TABLE loyalty_accounts (
    loyalty_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partner_merchants(partner_id),
    external_account_id VARCHAR(100) NOT NULL,
    points_balance DECIMAL(18,2) DEFAULT 0.00,
    last_synced_at TIMESTAMPTZ,
    UNIQUE(user_id, partner_id)
);

COMMENT ON TABLE loyalty_accounts IS 'User-partner loyalty account linkage with synced point balances';

-- ============================================================================
-- Table 5: exchange_transactions
-- Core transaction record for point-to-wallet-credit exchanges
-- Includes fraud scoring metadata for audit trail
-- ============================================================================
CREATE TABLE exchange_transactions (
    txn_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    source_partner_id UUID REFERENCES partner_merchants(partner_id),
    source_points DECIMAL(18,2) NOT NULL,
    exchange_rate DECIMAL(10,4) NOT NULL,  -- DQN-determined rate
    gross_value_inr DECIMAL(18,2) NOT NULL,
    service_fee DECIMAL(18,2) NOT NULL,
    gst_amount DECIMAL(18,2) NOT NULL,
    net_value_inr DECIMAL(18,2) NOT NULL,
    fraud_score DECIMAL(5,4),              -- 0.0 (safe) to 1.0 (fraud)
    txn_status VARCHAR(20) CHECK (txn_status IN ('PENDING', 'SUCCESS', 'BLOCKED', 'FLAGGED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for common query patterns
CREATE INDEX idx_txn_user ON exchange_transactions(user_id);
CREATE INDEX idx_txn_created ON exchange_transactions(created_at);
CREATE INDEX idx_txn_fraud ON exchange_transactions(fraud_score);
CREATE INDEX idx_txn_status ON exchange_transactions(txn_status);

COMMENT ON TABLE exchange_transactions IS 'Core exchange transaction records with fraud metadata';
COMMENT ON COLUMN exchange_transactions.exchange_rate IS 'DQN-determined exchange rate at time of transaction';
COMMENT ON COLUMN exchange_transactions.fraud_score IS 'XGBoost fraud probability: 0.0 (safe) to 1.0 (fraud)';

-- ============================================================================
-- Table 6: journal_entries
-- Double-entry bookkeeping header — every transaction gets one journal entry
-- CRITICAL: CHECK constraint enforces total_debit = total_credit
-- ============================================================================
CREATE TABLE journal_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id UUID UNIQUE REFERENCES exchange_transactions(txn_id) ON DELETE CASCADE,
    entry_type VARCHAR(50),                -- e.g., 'EXCHANGE', 'REFUND', 'ADJUSTMENT'
    total_debit DECIMAL(18,2) NOT NULL,
    total_credit DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (total_debit = total_credit)     -- CRITICAL: enforces double-entry balance
);

COMMENT ON TABLE journal_entries IS 'Double-entry bookkeeping header — debit must equal credit';
COMMENT ON COLUMN journal_entries.entry_type IS 'Journal entry type: EXCHANGE, REFUND, ADJUSTMENT';

-- ============================================================================
-- Table 7: ledger_lines
-- Individual debit/credit line items within a journal entry
-- Each line is either a debit OR a credit, never both
-- ============================================================================
CREATE TABLE ledger_lines (
    line_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES journal_entries(entry_id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,    -- e.g., 'USER_POINTS_LIABILITY', 'REVENUE', 'GST_PAYABLE'
    debit DECIMAL(18,2) DEFAULT 0.00,
    credit DECIMAL(18,2) DEFAULT 0.00,
    CHECK (
        (debit > 0 AND credit = 0) OR
        (credit > 0 AND debit = 0)
    )
);

CREATE INDEX idx_ledger_entry ON ledger_lines(entry_id);
CREATE INDEX idx_ledger_account ON ledger_lines(account_name);

COMMENT ON TABLE ledger_lines IS 'Individual debit/credit line items in double-entry accounting';
COMMENT ON COLUMN ledger_lines.account_name IS 'Account name: USER_POINTS_LIABILITY, REVENUE, PARTNER_RECEIVABLES, GST_PAYABLE, etc.';

-- ============================================================================
-- Table 8: gst_records
-- GST tax records per transaction
-- Intra-state: CGST (9%) + SGST (9%)
-- Inter-state: IGST (18%)
-- SAC Code: 9971
-- ============================================================================
CREATE TABLE gst_records (
    gst_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id UUID REFERENCES exchange_transactions(txn_id) ON DELETE CASCADE,
    gst_type VARCHAR(10) CHECK (gst_type IN ('CGST', 'SGST', 'IGST')),
    gst_rate DECIMAL(5,2) NOT NULL,        -- 9.00 for CGST/SGST, 18.00 for IGST
    gst_amount DECIMAL(18,2) NOT NULL,
    state_code VARCHAR(2) NOT NULL,        -- user's state for tax jurisdiction
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gst_txn ON gst_records(txn_id);

COMMENT ON TABLE gst_records IS 'GST tax records — CGST+SGST (intra-state) or IGST (inter-state)';

-- ============================================================================
-- Table 9: fraud_logs
-- Audit trail for every fraud scoring decision made by the ML service
-- Links to exchange_transactions for full traceability
-- ============================================================================
CREATE TABLE fraud_logs (
    fraud_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id UUID REFERENCES exchange_transactions(txn_id),
    model_version VARCHAR(20),             -- e.g., 'v1.0', 'v1.2'
    fraud_score DECIMAL(5,4),              -- 0.0000 to 1.0000
    decision VARCHAR(20),                  -- 'AUTHORIZED', 'FLAGGED', 'BLOCKED'
    flagged_reason TEXT,                   -- human-readable reason
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_txn ON fraud_logs(txn_id);
CREATE INDEX idx_fraud_decision ON fraud_logs(decision);

COMMENT ON TABLE fraud_logs IS 'ML fraud scoring audit trail for every transaction evaluation';

-- ============================================================================
-- Table 10: str_reports
-- Suspicious Transaction Reports for FIU-IND (PMLA compliance)
-- Auto-generated when: txn > ₹50K in Small PPI, or high fraud score
-- ============================================================================
CREATE TABLE str_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    total_amount DECIMAL(18,2),
    trigger_reason TEXT,                   -- e.g., 'SMALL_PPI_THRESHOLD_EXCEEDED', 'HIGH_FRAUD_SCORE'
    xml_payload TEXT,                      -- FINnet XML schema for FIU-IND submission
    submitted_to_fiu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_str_user ON str_reports(user_id);
CREATE INDEX idx_str_submitted ON str_reports(submitted_to_fiu);

COMMENT ON TABLE str_reports IS 'Suspicious Transaction Reports for FIU-IND (PMLA compliance)';

-- ============================================================================
-- Table 11: audit_logs
-- IMMUTABLE append-only audit trail
-- NO UPDATE, NO DELETE operations permitted on this table
-- ============================================================================
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50),               -- e.g., 'USER', 'WALLET', 'TRANSACTION'
    entity_id UUID,
    action_type VARCHAR(50),               -- e.g., 'CREATE', 'UPDATE', 'KYC_UPGRADE', 'EXCHANGE'
    performed_by UUID,                     -- user_id or system identifier
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB                         -- flexible additional context
);

-- IMMUTABLE: No UPDATE, No DELETE — Append-only
-- This must be enforced at the application layer and via database permissions

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action_type);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_performer ON audit_logs(performed_by);

COMMENT ON TABLE audit_logs IS 'IMMUTABLE append-only audit trail — NO UPDATE, NO DELETE';

COMMIT;
