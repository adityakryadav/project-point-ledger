-- ============================================================================
-- ILPEP — Indian Loyalty Points Exchange Platform
-- Migration 002: Tax Compliance Triggers & Constraint Enforcement
--
-- Implements database-level enforcement of:
--   1. RBI PPI wallet load/balance limits
--   2. Automatic updated_at timestamp management
--   3. Audit log immutability (append-only)
--   4. Wallet status freeze enforcement
--   5. Double-entry ledger line balance validation
--   6. Automatic STR (Suspicious Transaction Report) flagging
--
-- Database: PostgreSQL 15 (AWS Mumbai ap-south-1)
-- Depends on: 001_initial_schema.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. PPI WALLET LOAD LIMIT ENFORCEMENT
--
-- RBI PPI Master Directions mandate:
--   Small PPI: monthly load ≤ ₹10,000 | yearly load ≤ ₹1,20,000
--   Full KYC:  wallet balance ≤ ₹2,00,000
--
-- This trigger fires BEFORE any INSERT or UPDATE on the wallets table
-- and raises an exception if limits would be exceeded.
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_ppi_wallet_limits()
RETURNS TRIGGER AS $$
DECLARE
    v_kyc_status VARCHAR(10);
BEGIN
    -- Look up the user's KYC tier
    SELECT kyc_status INTO v_kyc_status
    FROM users
    WHERE user_id = NEW.user_id;

    IF v_kyc_status = 'SMALL' THEN
        -- Small PPI: monthly load limit ≤ ₹10,000
        IF NEW.monthly_load_inr > 10000.00 THEN
            RAISE EXCEPTION 'PPI_LIMIT_EXCEEDED: Small PPI monthly load limit is ₹10,000. Attempted: ₹%', NEW.monthly_load_inr;
        END IF;

        -- Small PPI: yearly load limit ≤ ₹1,20,000
        IF NEW.yearly_load_inr > 120000.00 THEN
            RAISE EXCEPTION 'PPI_LIMIT_EXCEEDED: Small PPI yearly load limit is ₹1,20,000. Attempted: ₹%', NEW.yearly_load_inr;
        END IF;

    ELSIF v_kyc_status = 'FULL' THEN
        -- Full KYC: maximum wallet balance ≤ ₹2,00,000
        IF NEW.balance_inr > 200000.00 THEN
            RAISE EXCEPTION 'PPI_LIMIT_EXCEEDED: Full KYC wallet balance limit is ₹2,00,000. Attempted: ₹%', NEW.balance_inr;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_ppi_wallet_limits
    BEFORE INSERT OR UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION enforce_ppi_wallet_limits();

COMMENT ON FUNCTION enforce_ppi_wallet_limits() IS
    'Enforces RBI PPI load/balance limits: Small PPI ≤ ₹10K/month, ≤ ₹1.2L/year; Full KYC ≤ ₹2L balance';


-- ============================================================================
-- 2. AUTOMATIC updated_at TIMESTAMP MANAGEMENT
--
-- Automatically sets updated_at = NOW() on every UPDATE to the users table.
-- Ensures accurate audit trail without relying on application layer.
-- ============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON FUNCTION set_updated_at() IS
    'Auto-manages updated_at timestamp on row modification';


-- ============================================================================
-- 3. AUDIT LOG IMMUTABILITY
--
-- The SDD mandates that audit_logs is IMMUTABLE: NO UPDATE, NO DELETE.
-- These triggers enforce append-only behavior at the database level,
-- preventing even privileged application code from modifying history.
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_audit_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'IMMUTABLE_VIOLATION: UPDATE operations are not permitted on audit_logs. This table is append-only.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_audit_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'IMMUTABLE_VIOLATION: DELETE operations are not permitted on audit_logs. This table is append-only.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_update();

CREATE TRIGGER trg_prevent_audit_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_delete();

COMMENT ON FUNCTION prevent_audit_update() IS
    'Prevents UPDATE on audit_logs — enforces immutable append-only policy';
COMMENT ON FUNCTION prevent_audit_delete() IS
    'Prevents DELETE on audit_logs — enforces immutable append-only policy';


-- ============================================================================
-- 4. WALLET STATUS FREEZE ENFORCEMENT
--
-- When a wallet's status is 'FROZEN' or 'CLOSED', no balance modifications
-- are permitted. This prevents transactions on suspended accounts.
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_wallet_freeze()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check on UPDATE (not INSERT, as new wallets start with 0 balance)
    IF TG_OP = 'UPDATE' THEN
        -- If the wallet is frozen or closed, block any balance change
        IF OLD.status IN ('FROZEN', 'CLOSED') AND NEW.balance_inr <> OLD.balance_inr THEN
            RAISE EXCEPTION 'WALLET_FROZEN: Cannot modify balance on a % wallet. wallet_id: %', OLD.status, OLD.wallet_id;
        END IF;

        -- Prevent reopening a CLOSED wallet
        IF OLD.status = 'CLOSED' AND NEW.status <> 'CLOSED' THEN
            RAISE EXCEPTION 'WALLET_CLOSED: Cannot reopen a closed wallet. wallet_id: %', OLD.wallet_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_wallet_freeze
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION enforce_wallet_freeze();

COMMENT ON FUNCTION enforce_wallet_freeze() IS
    'Prevents balance changes on FROZEN/CLOSED wallets and prevents reopening CLOSED wallets';


-- ============================================================================
-- 5. DOUBLE-ENTRY LEDGER LINE BALANCE VALIDATION
--
-- After each INSERT on ledger_lines, verify that the parent journal_entry
-- maintains balanced debits and credits. This provides an additional layer
-- of integrity beyond the CHECK constraint on journal_entries.total_debit
-- = journal_entries.total_credit.
--
-- The trigger validates the SUM of individual line items against the
-- journal entry header, catching any inconsistencies between line items
-- and the declared totals.
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_sum_debit  DECIMAL(18,2);
    v_sum_credit DECIMAL(18,2);
    v_header_debit  DECIMAL(18,2);
    v_header_credit DECIMAL(18,2);
BEGIN
    -- Calculate actual line item totals
    SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
    INTO v_sum_debit, v_sum_credit
    FROM ledger_lines
    WHERE entry_id = NEW.entry_id;

    -- Get the declared header totals
    SELECT total_debit, total_credit
    INTO v_header_debit, v_header_credit
    FROM journal_entries
    WHERE entry_id = NEW.entry_id;

    -- Validate: line item sums must not exceed header declarations
    IF v_sum_debit > v_header_debit THEN
        RAISE EXCEPTION 'LEDGER_IMBALANCE: Line item debits (₹%) exceed journal entry declared total (₹%). entry_id: %',
            v_sum_debit, v_header_debit, NEW.entry_id;
    END IF;

    IF v_sum_credit > v_header_credit THEN
        RAISE EXCEPTION 'LEDGER_IMBALANCE: Line item credits (₹%) exceed journal entry declared total (₹%). entry_id: %',
            v_sum_credit, v_header_credit, NEW.entry_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_ledger_balance
    AFTER INSERT ON ledger_lines
    FOR EACH ROW
    EXECUTE FUNCTION validate_ledger_balance();

COMMENT ON FUNCTION validate_ledger_balance() IS
    'Validates that ledger line item sums do not exceed declared journal entry totals';


-- ============================================================================
-- 6. AUTOMATIC STR (SUSPICIOUS TRANSACTION REPORT) FLAGGING
--
-- PMLA compliance requires automatic STR generation for:
--   a) Small PPI users transacting > ₹50,000 in a single transaction
--   b) Any transaction with a fraud_score > 0.80 (BLOCKED threshold)
--
-- This trigger fires AFTER INSERT on exchange_transactions and
-- auto-creates an STR report in the str_reports table.
-- ============================================================================

CREATE OR REPLACE FUNCTION check_str_threshold()
RETURNS TRIGGER AS $$
DECLARE
    v_kyc_status VARCHAR(10);
    v_trigger_reason TEXT;
BEGIN
    -- Look up user's KYC status
    SELECT kyc_status INTO v_kyc_status
    FROM users
    WHERE user_id = NEW.user_id;

    -- Rule 1: Small PPI user with transaction > ₹50,000
    IF v_kyc_status = 'SMALL' AND NEW.gross_value_inr > 50000.00 THEN
        v_trigger_reason := 'SMALL_PPI_THRESHOLD_EXCEEDED: Small PPI transaction of ₹' || NEW.gross_value_inr || ' exceeds ₹50,000 threshold';

        INSERT INTO str_reports (user_id, total_amount, trigger_reason, submitted_to_fiu)
        VALUES (NEW.user_id, NEW.gross_value_inr, v_trigger_reason, FALSE);
    END IF;

    -- Rule 2: High fraud score (above BLOCK threshold of 0.80)
    IF NEW.fraud_score IS NOT NULL AND NEW.fraud_score > 0.80 THEN
        v_trigger_reason := 'HIGH_FRAUD_SCORE: Transaction fraud score of ' || NEW.fraud_score || ' exceeds 0.80 threshold';

        INSERT INTO str_reports (user_id, total_amount, trigger_reason, submitted_to_fiu)
        VALUES (NEW.user_id, NEW.gross_value_inr, v_trigger_reason, FALSE);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_str_threshold
    AFTER INSERT ON exchange_transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_str_threshold();

COMMENT ON FUNCTION check_str_threshold() IS
    'Auto-flags suspicious transactions for STR reporting (PMLA compliance)';


-- ============================================================================
-- MONTHLY LOAD RESET FUNCTION
--
-- Utility function to reset monthly_load_inr for all wallets.
-- Designed to be called by a scheduled job (pg_cron) on the 1st of each month.
-- Also resets yearly_load_inr on January 1st.
-- ============================================================================

CREATE OR REPLACE FUNCTION reset_periodic_load_counters(p_reset_yearly BOOLEAN DEFAULT FALSE)
RETURNS INTEGER AS $$
DECLARE
    v_affected INTEGER;
BEGIN
    -- Reset monthly counters for all active wallets
    UPDATE wallets
    SET monthly_load_inr = 0.00
    WHERE status = 'ACTIVE';

    GET DIAGNOSTICS v_affected = ROW_COUNT;

    -- Optionally reset yearly counters (January 1st)
    IF p_reset_yearly THEN
        UPDATE wallets
        SET yearly_load_inr = 0.00
        WHERE status = 'ACTIVE';
    END IF;

    RETURN v_affected;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_periodic_load_counters(BOOLEAN) IS
    'Resets monthly (and optionally yearly) load counters. Schedule via pg_cron.';


COMMIT;
