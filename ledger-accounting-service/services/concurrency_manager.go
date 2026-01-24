// =============================================================================
// ILPEP — Indian Loyalty Points Exchange Platform
// Ledger Accounting Service — Concurrency Manager
//
// Implements the TransactionManager interface with production-grade
// concurrency controls:
//   - Serializable isolation level (prevent phantom reads/write skew)
//   - Row-level locking (SELECT ... FOR UPDATE) for balance mutations
//   - Automatic retry for transient serialization failures (40001)
//
// All mutations within CommitExchangeTransaction() execute within a
// single, retryable PostgreSQL transaction boundary.
//
// Maps to execution plan: Member 1, Day 7, Phase 2
// =============================================================================

package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/adityakryadav/project-point-ledger/ledger-accounting-service/models"
)

// PostgreSQL error code for serialization failure (deadlock/concurrent modification)
const PgErrCodeSerializationFailure = "40001"

// Maximum attempts for a retryable transaction
const MaxTxnRetries = 3

// Base delay between retries
const BaseRetryDelay = 50 * time.Millisecond

// =============================================================================
// Concurrency Manager
// =============================================================================

// SerializableTransactionManager implements TransactionManager using a *sql.Tx.
// It ensures that all operations are performed within a single database transaction
// with SERIALIZABLE isolation.
type SerializableTransactionManager struct {
	db     *sql.DB
	tx     *sql.Tx
	logger *log.Logger
}

// NewSerializableTransactionManager creates a new transaction manager bound to the given DB pool.
func NewSerializableTransactionManager(db *sql.DB) *SerializableTransactionManager {
	return &SerializableTransactionManager{
		db:     db,
		logger: log.New(log.Writer(), "[concurrency-manager] ", log.LstdFlags|log.Lmicroseconds),
	}
}

// =============================================================================
// Transaction Lifecycle
// =============================================================================

// Begin starts a new database transaction with SERIALIZABLE isolation.
func (m *SerializableTransactionManager) Begin() error {
	if m.tx != nil {
		return errors.New("transaction already in progress")
	}

	opts := &sql.TxOptions{
		Isolation: sql.LevelSerializable,
	}

	tx, err := m.db.BeginTx(context.Background(), opts)
	if err != nil {
		return fmt.Errorf("failed to begin serializable transaction: %w", err)
	}

	m.tx = tx
	return nil
}

// Commit finalizes all operations within the transaction.
func (m *SerializableTransactionManager) Commit() error {
	if m.tx == nil {
		return errors.New("no transaction in progress")
	}

	err := m.tx.Commit()
	m.tx = nil
	return err
}

// Rollback aborts all operations within the transaction.
// Safe to call redundantly (e.g., in a defer).
func (m *SerializableTransactionManager) Rollback() error {
	if m.tx == nil {
		return nil // Already committed or rolled back
	}

	err := m.tx.Rollback()
	m.tx = nil

	if err != nil && err != sql.ErrTxDone {
		m.logger.Printf("ERROR: Rollback failed: %v", err)
		return err
	}
	return nil
}

// =============================================================================
// Row-Level Locking & Balance Updates
// =============================================================================

// UpdateWalletBalance atomically increments the user's wallet balance.
// Uses SELECT ... FOR UPDATE to lock the row, preventing concurrent modification.
func (m *SerializableTransactionManager) UpdateWalletBalance(userID string, amount float64) error {
	if m.tx == nil {
		return errors.New("cannot update wallet: no active transaction")
	}

	// 1. Lock row for update
	queryLock := `SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE`
	var currentBalance float64
	err := m.tx.QueryRow(queryLock, userID).Scan(&currentBalance)
	if err != nil {
		return fmt.Errorf("failed to lock wallet for user %s: %w", userID, err)
	}

	// 2. Perform atomic update
	newBalance := currentBalance + amount
	queryUpdate := `UPDATE wallets SET balance = $1, updated_at = NOW() WHERE user_id = $2`
	_, err = m.tx.Exec(queryUpdate, newBalance, userID)
	if err != nil {
		return fmt.Errorf("failed to update wallet balance: %w", err)
	}

	m.logger.Printf("Wallet updated: user=%s, old=%.2f, new=%.2f (+%.2f)", 
		userID, currentBalance, newBalance, amount)

	return nil
}

// DeductPartnerPoints atomically decrements the partner's point balance.
// Uses SELECT ... FOR UPDATE to lock the row.
func (m *SerializableTransactionManager) DeductPartnerPoints(userID, partnerID string, points float64) error {
	if m.tx == nil {
		return errors.New("cannot deduct points: no active transaction")
	}

	// 1. Lock row for update
	queryLock := `SELECT point_balance FROM loyalty_accounts WHERE user_id = $1 AND partner_id = $2 FOR UPDATE`
	var currentPoints float64
	err := m.tx.QueryRow(queryLock, userID, partnerID).Scan(&currentPoints)
	if err != nil {
		return fmt.Errorf("failed to lock loyalty account for user %s / partner %s: %w", userID, partnerID, err)
	}

	if currentPoints < points {
		return fmt.Errorf("insufficient point limit: required %.2f, have %.2f", points, currentPoints)
	}

	// 2. Perform atomic update
	newPoints := currentPoints - points
	queryUpdate := `UPDATE loyalty_accounts SET point_balance = $1, updated_at = NOW() WHERE user_id = $2 AND partner_id = $3`
	_, err = m.tx.Exec(queryUpdate, newPoints, userID, partnerID)
	if err != nil {
		return fmt.Errorf("failed to deduct partner points: %w", err)
	}

	m.logger.Printf("Points deducted: user=%s, partner=%s, old=%.2f, new=%.2f (-%.2f)", 
		userID, partnerID, currentPoints, newPoints, points)

	return nil
}

// =============================================================================
// Inserts
// =============================================================================

// InsertExchangeTransaction persists the exchange_transactions record.
func (m *SerializableTransactionManager) InsertExchangeTransaction(req *ExchangeRequest, result *ExchangeResult) error {
	if m.tx == nil {
		return errors.New("no active transaction")
	}

	query := `
		INSERT INTO exchange_transactions 
			(txn_id, user_id, source_partner_id, source_points, exchange_rate, 
			 gross_value_inr, service_fee, gst_amount, net_value_inr, fraud_score, status)
		VALUES 
			($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := m.tx.Exec(
		query,
		result.TxnID,
		req.UserID,
		req.SourcePartnerID,
		req.SourcePoints,
		req.ExchangeRate,
		result.GrossValueINR,
		result.ServiceFee,
		result.GSTAmount,
		result.NetValueINR,
		req.FraudScore,
		result.Status,
	)
	
	if err != nil {
		return fmt.Errorf("failed to insert exchange transaction: %w", err)
	}

	return nil
}

// InsertJournalEntry persists the journal_entries record.
func (m *SerializableTransactionManager) InsertJournalEntry(entry *models.JournalEntry) error {
	if m.tx == nil {
		return errors.New("no active transaction")
	}

	query := `
		INSERT INTO journal_entries (entry_id, txn_id, entry_type, total_debit, total_credit)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := m.tx.Exec(query, entry.EntryID, entry.TxnID, entry.EntryType, entry.TotalDebit, entry.TotalCredit)
	if err != nil {
		return fmt.Errorf("failed to insert journal entry: %w", err)
	}
	return nil
}

// InsertLedgerLines persists all ledger_lines for a journal entry.
func (m *SerializableTransactionManager) InsertLedgerLines(lines []*models.LedgerLine) error {
	if m.tx == nil {
		return errors.New("no active transaction")
	}

	query := `
		INSERT INTO ledger_lines (line_id, entry_id, account_name, debit_amount, credit_amount)
		VALUES ($1, $2, $3, $4, $5)
	`
	
	for i, line := range lines {
		_, err := m.tx.Exec(query, line.LineID, line.EntryID, line.AccountName, line.Debit, line.Credit)
		if err != nil {
			return fmt.Errorf("failed to insert ledger line %d: %w", i, err)
		}
	}
	return nil
}

// InsertGSTRecord persists a single gst_records entry.
func (m *SerializableTransactionManager) InsertGSTRecord(txnID string, gst *GSTBreakdown) error {
	if m.tx == nil {
		return errors.New("no active transaction")
	}

	// This is a simplified version, usually we insert the breakdown summary
	// and then the individual records. We map it to InsertGSTRecords for consistency.
	return m.InsertGSTRecords(txnID, gst.Records)
}

// InsertGSTRecords persists multiple gst_records entries (INTRA/INTER logic).
func (m *SerializableTransactionManager) InsertGSTRecords(txnID string, records []GSTRecord) error {
	if m.tx == nil {
		return errors.New("no active transaction")
	}

	query := `
		INSERT INTO gst_records (txn_id, gst_type, gst_rate, gst_amount, state_code)
		VALUES ($1, $2, $3, $4, $5)
	`
	
	for i, record := range records {
		_, err := m.tx.Exec(query, txnID, record.GSTType, record.GSTRate, record.GSTAmount, record.StateCode)
		if err != nil {
			return fmt.Errorf("failed to insert gst record %d: %w", i, err)
		}
	}
	return nil
}

// =============================================================================
// Retry Logic Wrapper
// =============================================================================

// ExecuteWithRetry encapsulates a transaction closure within a retry loop,
// handling PostgreSQL serialization failures automatically.
func ExecuteWithRetry(db *sql.DB, fn func(tm TransactionManager) error) error {
	logger := log.New(log.Writer(), "[concurrency-manager] ", log.LstdFlags)
	var err error

	for attempt := 1; attempt <= MaxTxnRetries; attempt++ {
		tm := NewSerializableTransactionManager(db)
		
		if beginErr := tm.Begin(); beginErr != nil {
			return beginErr
		}

		// Execute closure
		err = fn(tm)

		if err == nil {
			// Success, commit and return
			if commitErr := tm.Commit(); commitErr != nil {
				// Commit might fail due to serialization constraints (e.g., SSI checks)
				err = fmt.Errorf("commit failed: %w", commitErr)
				goto HANDLE_ERROR
			}
			return nil
		}

	HANDLE_ERROR:
		// Rollback on failure
		tm.Rollback()

		// Check if it's a serialization failure (error string check as fallback since pgconn might not be directly imported)
		isSerializationFailure := false
		if err != nil {
			errStr := err.Error()
			if errStr == PgErrCodeSerializationFailure || 
			   // Includes common pg error substrings for serialization
			   containsString(errStr, "could not serialize access") || 
			   containsString(errStr, "deadlock detected") {
				isSerializationFailure = true
			}
		}

		if !isSerializationFailure {
			// Not a transient concurrency error, abort immediately
			return err
		}

		if attempt < MaxTxnRetries {
			delay := BaseRetryDelay * time.Duration(1<<(attempt-1)) // Exponential backoff
			logger.Printf("WARN: Serialization failure, retrying (attempt %d/%d) after %s: %v", 
				attempt, MaxTxnRetries, delay, err)
			time.Sleep(delay)
		}
	}

	return fmt.Errorf("transaction failed after %d attempts: %w", MaxTxnRetries, err)
}

// Helper to avoid strings package import duplication
func containsString(s, substr string) bool {
	// Simple lookup
	for i := 0; i < len(s)-len(substr)+1; i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
