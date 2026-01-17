// =============================================================================
// ILPEP — Indian Loyalty Points Exchange Platform
// Ledger Accounting Service — Transaction Processor
//
// Core business logic for executing point-to-wallet exchanges atomically.
// CommitExchangeTransaction() orchestrates:
//   1. Request validation
//   2. Value calculation (gross, fee, GST, net)
//   3. Double-entry journal creation (debit = credit invariant)
//   4. Ledger line generation via BuildExchangeLines()
//
// Day 5 Enhancement — Detailed GST Record Generation:
//   - GSTRecord struct maps directly to the gst_records DB table
//   - Intra-state: 2 records (CGST 9% + SGST 9%)
//   - Inter-state: 1 record (IGST 18%)
//   - Validation: sum of record amounts == total GST
//   - Used for GSTR-1/GSTR-3B regulatory filing compliance
//
// All operations are designed for ACID compliance. The TransactionManager
// interface abstracts DB transaction boundaries (implementation in Day 7
// with row-level locking and serializable isolation).
//
// Maps to execution plan: Member 1, Days 4-5, Phase 2
// =============================================================================

package services

import (
	"errors"
	"fmt"
	"math"
	"strings"

	"github.com/adityakryadav/project-point-ledger/ledger-accounting-service/models"
)

// =============================================================================
// Constants
// =============================================================================

// ServiceFeeRate is the platform commission on each exchange (2%).
// Configurable via environment in production; hardcoded for Phase 2.
const ServiceFeeRate = 0.02

// GSTRate is the Goods & Services Tax rate on service fees (18%).
// As per SAC 9971 — financial intermediation services.
const GSTRate = 0.18

// CGSTRate and SGSTRate are the split for intra-state transactions.
const (
	CGSTRate = 0.09 // Central GST (9%)
	SGSTRate = 0.09 // State GST (9%)
	IGSTRate = 0.18 // Integrated GST (18%) for inter-state
)

// PlatformStateCode is the state where ILPEP is registered.
// Used to determine intra-state (CGST+SGST) vs inter-state (IGST) GST.
// Delhi = "DL" (registered office).
const PlatformStateCode = "DL"

// =============================================================================
// Errors
// =============================================================================

var (
	ErrInvalidUserID         = errors.New("user_id is required")
	ErrInvalidPartnerID      = errors.New("source_partner_id is required")
	ErrInvalidSourcePoints   = errors.New("source_points must be greater than zero")
	ErrInvalidExchangeRate   = errors.New("exchange_rate must be greater than zero")
	ErrInvalidStateCode      = errors.New("state_code is required (2-letter Indian state code)")
	ErrNegativeGrossValue    = errors.New("calculated gross value must be positive")
	ErrNegativeNetValue      = errors.New("calculated net value must be positive after fees and GST")
	ErrFraudScoreOutOfRange  = errors.New("fraud_score must be between 0.0 and 1.0")
	ErrTransactionBlocked    = errors.New("transaction blocked by fraud detection")
	ErrDoubleEntryViolation  = errors.New("double-entry invariant violated during transaction assembly")
)

// =============================================================================
// Request / Response Structs
// =============================================================================

// ExchangeRequest contains the input parameters for a point-to-wallet exchange.
//
// This is populated by the exchange_handler (Day 6) from the HTTP request,
// after the fraud scoring service (Day 9 integration) has evaluated the
// transaction.
type ExchangeRequest struct {
	// UserID is the UUID of the user initiating the exchange.
	UserID string `json:"user_id"`

	// SourcePartnerID is the UUID of the partner whose points are being exchanged.
	SourcePartnerID string `json:"source_partner_id"`

	// SourcePoints is the number of loyalty points being converted.
	SourcePoints float64 `json:"source_points"`

	// ExchangeRate is the conversion rate (INR per point), set by the DQN pricing agent.
	ExchangeRate float64 `json:"exchange_rate"`

	// StateCode is the 2-letter Indian state code of the user (for GST routing).
	// Examples: "DL" (Delhi), "MH" (Maharashtra), "KA" (Karnataka)
	StateCode string `json:"state_code"`

	// FraudScore is the XGBoost fraud probability (0.0 = safe, 1.0 = fraud).
	// Set by the fraud scoring service before the transaction is committed.
	FraudScore float64 `json:"fraud_score"`
}

// GSTRecord represents a single row in the gst_records database table.
//
// For intra-state transactions, two records are created (CGST + SGST).
// For inter-state transactions, one record is created (IGST).
// Each record is independently auditable for GSTR-1/GSTR-3B filing.
type GSTRecord struct {
	// GSTType is one of: "CGST", "SGST", "IGST".
	GSTType string `json:"gst_type"`

	// GSTRate is the applicable rate (0.09 for CGST/SGST, 0.18 for IGST).
	GSTRate float64 `json:"gst_rate"`

	// GSTAmount is the calculated tax amount for this record.
	GSTAmount float64 `json:"gst_amount"`

	// StateCode is the user's 2-letter state code (for filing jurisdiction).
	StateCode string `json:"state_code"`
}

// GSTBreakdown contains the itemized GST calculation for a transaction.
type GSTBreakdown struct {
	// GSTType is "INTRA" (CGST+SGST) or "INTER" (IGST).
	GSTType string `json:"gst_type"`

	// TotalGST is the total GST amount on the service fee.
	TotalGST float64 `json:"total_gst"`

	// CGST is the Central GST component (9% intra-state, 0 inter-state).
	CGST float64 `json:"cgst"`

	// SGST is the State GST component (9% intra-state, 0 inter-state).
	SGST float64 `json:"sgst"`

	// IGST is the Integrated GST component (0 intra-state, 18% inter-state).
	IGST float64 `json:"igst"`

	// ServiceFeeBase is the amount on which GST is calculated.
	ServiceFeeBase float64 `json:"service_fee_base"`

	// Records contains the individual gst_records rows for DB persistence.
	// Intra-state: 2 records (CGST + SGST), Inter-state: 1 record (IGST).
	Records []GSTRecord `json:"records"`
}

// ExchangeResult contains the complete output of a committed exchange transaction.
type ExchangeResult struct {
	// TxnID is the UUID assigned to this exchange transaction.
	// In production, generated by PostgreSQL; here assigned by the handler.
	TxnID string `json:"txn_id"`

	// GrossValueINR is the total INR value of the exchanged points.
	GrossValueINR float64 `json:"gross_value_inr"`

	// ServiceFee is the platform commission deducted from the gross value.
	ServiceFee float64 `json:"service_fee"`

	// GSTAmount is the total GST on the service fee.
	GSTAmount float64 `json:"gst_amount"`

	// NetValueINR is the amount credited to the user's wallet.
	NetValueINR float64 `json:"net_value_inr"`

	// GST contains the itemized GST breakdown (CGST/SGST or IGST).
	GST GSTBreakdown `json:"gst"`

	// JournalEntry is the double-entry header created for this transaction.
	JournalEntry *models.JournalEntry `json:"journal_entry"`

	// LedgerLines are the individual debit/credit lines in the ledger.
	LedgerLines []*models.LedgerLine `json:"ledger_lines"`

	// Status is the transaction outcome: PENDING, SUCCESS, BLOCKED, FLAGGED.
	Status string `json:"status"`
}

// =============================================================================
// Transaction Manager Interface
// =============================================================================

// TransactionManager abstracts the database transaction lifecycle.
//
// In production (Day 7+), the implementation will use:
//   - BEGIN with SERIALIZABLE isolation level
//   - Row-level locking (SELECT ... FOR UPDATE)
//   - Full rollback on any failure
//
// For Day 4, we define the interface so CommitExchangeTransaction() is
// structured for atomic execution from the start.
type TransactionManager interface {
	// Begin starts a new database transaction with serializable isolation.
	Begin() error

	// Commit finalizes all operations within the transaction.
	Commit() error

	// Rollback aborts all operations within the transaction.
	Rollback() error

	// InsertExchangeTransaction persists the exchange_transactions record.
	InsertExchangeTransaction(req *ExchangeRequest, result *ExchangeResult) error

	// InsertJournalEntry persists the journal_entries record.
	InsertJournalEntry(entry *models.JournalEntry) error

	// InsertLedgerLines persists all ledger_lines for a journal entry.
	InsertLedgerLines(lines []*models.LedgerLine) error

	// InsertGSTRecord persists a single gst_records entry for the transaction.
	InsertGSTRecord(txnID string, gst *GSTBreakdown) error

	// InsertGSTRecords persists multiple gst_records entries for the transaction.
	// Intra-state transactions produce 2 records (CGST + SGST).
	// Inter-state transactions produce 1 record (IGST).
	InsertGSTRecords(txnID string, records []GSTRecord) error

	// UpdateWalletBalance atomically increments the user's wallet balance.
	// Uses SELECT ... FOR UPDATE to prevent concurrent modification.
	UpdateWalletBalance(userID string, amount float64) error

	// DeductPartnerPoints atomically decrements the partner's point balance.
	DeductPartnerPoints(userID, partnerID string, points float64) error
}

// =============================================================================
// Core Transaction Logic
// =============================================================================

// CommitExchangeTransaction orchestrates an atomic point-to-wallet exchange.
//
// This is the central function of the Ledger Accounting Service. It:
//   1. Validates the exchange request
//   2. Calculates all financial values (gross, fee, GST, net)
//   3. Determines GST routing (CGST+SGST vs IGST) based on state_code
//   4. Checks fraud score against thresholds
//   5. Assembles the double-entry journal (JournalEntry + LedgerLines)
//   6. Validates the double-entry invariant (total_debit == total_credit)
//   7. Returns the complete ExchangeResult
//
// In production (with TransactionManager), steps 5-6 are wrapped in a
// serializable DB transaction. For Day 4, we focus on the computation
// and validation logic.
//
// Double-entry breakdown:
//
//	DEBIT  USER_POINTS_LIABILITY   grossValue   (points consumed)
//	CREDIT REVENUE                 serviceFee   (platform revenue)
//	CREDIT GST_PAYABLE             gstAmount    (tax liability)
//	CREDIT USER_WALLET             netValue     (user receives)
//
// Invariant: grossValue == serviceFee + gstAmount + netValue
func CommitExchangeTransaction(txnID string, req *ExchangeRequest) (*ExchangeResult, error) {

	// =========================================================================
	// Step 1: Validate request
	// =========================================================================
	if err := validateExchangeRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// =========================================================================
	// Step 2: Check fraud score
	// =========================================================================
	status := determineTxnStatus(req.FraudScore)
	if status == "BLOCKED" {
		return &ExchangeResult{
			TxnID:  txnID,
			Status: "BLOCKED",
		}, ErrTransactionBlocked
	}

	// =========================================================================
	// Step 3: Calculate financial values
	// =========================================================================

	// Gross value = points × exchange rate
	grossValue := roundToTwo(req.SourcePoints * req.ExchangeRate)

	// Service fee = 2% of gross value
	serviceFee := roundToTwo(grossValue * ServiceFeeRate)

	// GST = 18% of service fee (applied on the fee, not the gross value)
	gstBreakdown := calculateGST(serviceFee, req.StateCode)

	// Net value to user = gross - fee - total GST
	netValue := roundToTwo(grossValue - serviceFee - gstBreakdown.TotalGST)

	// Sanity check: net value must be positive
	if netValue <= 0 {
		return nil, fmt.Errorf(
			"%w: gross=%.2f, fee=%.2f, gst=%.2f, net=%.2f",
			ErrNegativeNetValue, grossValue, serviceFee, gstBreakdown.TotalGST, netValue,
		)
	}

	// =========================================================================
	// Step 4: Verify invariant — gross = fee + gst + net
	// =========================================================================
	expectedGross := serviceFee + gstBreakdown.TotalGST + netValue
	if !almostEqual(grossValue, expectedGross) {
		return nil, fmt.Errorf(
			"financial invariant violated: gross(%.2f) != fee(%.2f) + gst(%.2f) + net(%.2f) = %.2f",
			grossValue, serviceFee, gstBreakdown.TotalGST, netValue, expectedGross,
		)
	}

	// =========================================================================
	// Step 5: Create double-entry journal
	// =========================================================================

	// 5a. Create journal entry header (debit == credit == grossValue)
	journalEntry, err := models.NewJournalEntry(
		txnID,
		models.EntryTypeExchange,
		grossValue, // total_debit
		grossValue, // total_credit (must equal debit)
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create journal entry: %w", err)
	}

	// 5b. Build ledger lines using the Day 3 helper
	// EntryID is empty here (assigned by PostgreSQL on INSERT), but we use
	// txnID as a temporary reference for the in-memory assembly.
	ledgerLines, err := models.BuildExchangeLines(
		txnID, // placeholder entryID — replaced by DB-generated UUID on insert
		grossValue,
		serviceFee,
		gstBreakdown.TotalGST,
		netValue,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to build ledger lines: %w", err)
	}

	// =========================================================================
	// Step 6: Validate double-entry invariant on assembled lines
	// =========================================================================
	if err := models.ValidateLineSet(ledgerLines); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrDoubleEntryViolation, err.Error())
	}

	// =========================================================================
	// Step 7: Assemble result
	// =========================================================================
	result := &ExchangeResult{
		TxnID:         txnID,
		GrossValueINR: grossValue,
		ServiceFee:    serviceFee,
		GSTAmount:     gstBreakdown.TotalGST,
		NetValueINR:   netValue,
		GST:           gstBreakdown,
		JournalEntry:  journalEntry,
		LedgerLines:   ledgerLines,
		Status:        status,
	}

	return result, nil
}

// =============================================================================
// GST Calculation
// =============================================================================

// calculateGST computes the GST breakdown on a service fee amount.
//
// GST routing rules (as per GST Act):
//   - If user's state_code == platform's state_code (Delhi "DL"):
//     Intra-state → CGST (9%) + SGST (9%) = 18%
//   - If user's state_code != platform's state_code:
//     Inter-state → IGST (18%)
//
// Both paths result in the same total GST (18%), but the split matters
// for regulatory compliance and GST filing (GSTR-1, GSTR-3B).
//
// Day 5: Now also generates GSTRecord entries for gst_records table
// persistence. Each record maps to one DB row with type, rate, amount,
// and state_code — enabling per-component tax reporting.
func calculateGST(serviceFee float64, userStateCode string) GSTBreakdown {
	totalGST := roundToTwo(serviceFee * GSTRate)

	if strings.EqualFold(userStateCode, PlatformStateCode) {
		// Intra-state: CGST + SGST
		cgst := roundToTwo(serviceFee * CGSTRate)
		sgst := roundToTwo(serviceFee * SGSTRate)

		// Handle rounding: ensure CGST + SGST == totalGST
		sgst = roundToTwo(totalGST - cgst)

		// Generate per-record entries for gst_records table (2 rows)
		records := []GSTRecord{
			{
				GSTType:   "CGST",
				GSTRate:   CGSTRate,
				GSTAmount: cgst,
				StateCode: userStateCode,
			},
			{
				GSTType:   "SGST",
				GSTRate:   SGSTRate,
				GSTAmount: sgst,
				StateCode: userStateCode,
			},
		}

		return GSTBreakdown{
			GSTType:        "INTRA",
			TotalGST:       totalGST,
			CGST:           cgst,
			SGST:           sgst,
			IGST:           0,
			ServiceFeeBase: serviceFee,
			Records:        records,
		}
	}

	// Inter-state: IGST — single record
	records := []GSTRecord{
		{
			GSTType:   "IGST",
			GSTRate:   IGSTRate,
			GSTAmount: totalGST,
			StateCode: userStateCode,
		},
	}

	return GSTBreakdown{
		GSTType:        "INTER",
		TotalGST:       totalGST,
		CGST:           0,
		SGST:           0,
		IGST:           totalGST,
		ServiceFeeBase: serviceFee,
		Records:        records,
	}
}

// GenerateGSTRecords is a convenience function that extracts the GST records
// from a breakdown for batch database insertion via TransactionManager.
//
// It also validates that the sum of individual record amounts equals the
// total GST — a critical integrity check before persistence.
func GenerateGSTRecords(breakdown *GSTBreakdown) ([]GSTRecord, error) {
	if len(breakdown.Records) == 0 {
		return nil, fmt.Errorf("GST breakdown contains no records")
	}

	// Validate sum of records == total GST
	var recordSum float64
	for _, r := range breakdown.Records {
		recordSum += r.GSTAmount
	}
	recordSum = roundToTwo(recordSum)

	if !almostEqual(recordSum, breakdown.TotalGST) {
		return nil, fmt.Errorf(
			"GST record sum (%.2f) does not match total GST (%.2f)",
			recordSum, breakdown.TotalGST,
		)
	}

	// Validate each record has valid type
	for i, r := range breakdown.Records {
		if r.GSTType != "CGST" && r.GSTType != "SGST" && r.GSTType != "IGST" {
			return nil, fmt.Errorf(
				"invalid GST type in record %d: '%s' (expected CGST, SGST, or IGST)",
				i, r.GSTType,
			)
		}
		if r.GSTAmount <= 0 {
			return nil, fmt.Errorf(
				"GST record %d (%s) has non-positive amount: %.2f",
				i, r.GSTType, r.GSTAmount,
			)
		}
		if len(r.StateCode) != 2 {
			return nil, fmt.Errorf(
				"GST record %d (%s) has invalid state_code: '%s'",
				i, r.GSTType, r.StateCode,
			)
		}
	}

	return breakdown.Records, nil
}

// ValidateGSTConsistency performs cross-validation between the GST breakdown
// summary fields and the individual records. This is a defense-in-depth check
// to catch any inconsistency before data hits the database.
//
// Checks:
//   1. Record count matches expected (INTRA=2, INTER=1)
//   2. Record types match GST type (INTRA→CGST+SGST, INTER→IGST)
//   3. Record amounts sum to TotalGST
//   4. Individual amounts match breakdown fields (CGST, SGST, IGST)
func ValidateGSTConsistency(b *GSTBreakdown) error {
	switch b.GSTType {
	case "INTRA":
		if len(b.Records) != 2 {
			return fmt.Errorf(
				"INTRA GST expects 2 records (CGST+SGST), got %d",
				len(b.Records),
			)
		}
		// Verify CGST record
		if b.Records[0].GSTType != "CGST" || !almostEqual(b.Records[0].GSTAmount, b.CGST) {
			return fmt.Errorf(
				"CGST record mismatch: record=(type=%s, amount=%.2f), expected=(CGST, %.2f)",
				b.Records[0].GSTType, b.Records[0].GSTAmount, b.CGST,
			)
		}
		// Verify SGST record
		if b.Records[1].GSTType != "SGST" || !almostEqual(b.Records[1].GSTAmount, b.SGST) {
			return fmt.Errorf(
				"SGST record mismatch: record=(type=%s, amount=%.2f), expected=(SGST, %.2f)",
				b.Records[1].GSTType, b.Records[1].GSTAmount, b.SGST,
			)
		}

	case "INTER":
		if len(b.Records) != 1 {
			return fmt.Errorf(
				"INTER GST expects 1 record (IGST), got %d",
				len(b.Records),
			)
		}
		if b.Records[0].GSTType != "IGST" || !almostEqual(b.Records[0].GSTAmount, b.IGST) {
			return fmt.Errorf(
				"IGST record mismatch: record=(type=%s, amount=%.2f), expected=(IGST, %.2f)",
				b.Records[0].GSTType, b.Records[0].GSTAmount, b.IGST,
			)
		}

	default:
		return fmt.Errorf("unknown GST type: '%s'", b.GSTType)
	}

	return nil
}

// =============================================================================
// Fraud Score Evaluation
// =============================================================================

// Fraud thresholds (matching config.py in intelligence-ml-service)
const (
	FraudThresholdBlock = 0.80 // Score >= 0.80 → BLOCKED
	FraudThresholdFlag  = 0.50 // Score >= 0.50 → FLAGGED
)

// determineTxnStatus maps a fraud score to a transaction status.
//
// Decision matrix:
//
//	fraud_score >= 0.80 → BLOCKED  (auto-reject, alert compliance)
//	fraud_score >= 0.50 → FLAGGED  (allow but flag for manual review)
//	fraud_score <  0.50 → SUCCESS  (auto-approve)
func determineTxnStatus(fraudScore float64) string {
	if fraudScore >= FraudThresholdBlock {
		return "BLOCKED"
	}
	if fraudScore >= FraudThresholdFlag {
		return "FLAGGED"
	}
	return "SUCCESS"
}

// =============================================================================
// Validation Helpers
// =============================================================================

// validateExchangeRequest checks all required fields on an ExchangeRequest.
func validateExchangeRequest(req *ExchangeRequest) error {
	if req.UserID == "" {
		return ErrInvalidUserID
	}
	if req.SourcePartnerID == "" {
		return ErrInvalidPartnerID
	}
	if req.SourcePoints <= 0 {
		return ErrInvalidSourcePoints
	}
	if req.ExchangeRate <= 0 {
		return ErrInvalidExchangeRate
	}
	if len(req.StateCode) != 2 {
		return fmt.Errorf("%w: got '%s'", ErrInvalidStateCode, req.StateCode)
	}
	if req.FraudScore < 0 || req.FraudScore > 1.0 {
		return fmt.Errorf("%w: got %.4f", ErrFraudScoreOutOfRange, req.FraudScore)
	}
	return nil
}

// =============================================================================
// Math Helpers
// =============================================================================

// roundToTwo rounds a float to 2 decimal places (standard for INR currency).
// Uses "round half up" to align with financial rounding conventions.
func roundToTwo(val float64) float64 {
	return math.Round(val*100) / 100
}

// almostEqual checks if two float64 values are equal within a small epsilon.
// Used for financial invariant checks where floating-point arithmetic
// may introduce tiny errors.
func almostEqual(a, b float64) bool {
	const epsilon = 0.01 // 1 paisa tolerance for INR
	return math.Abs(a-b) <= epsilon
}
