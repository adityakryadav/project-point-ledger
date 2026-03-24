// =============================================================================
// ILPEP — Indian Loyalty Points Exchange Platform
// Ledger Accounting Service — Exchange Handler
//
// HTTP handler for the point-to-wallet exchange API. Exposes a RESTful
// endpoint that receives exchange requests, delegates to the transaction
// processor, and returns structured JSON responses.
//
// Endpoint:
//   POST /api/v1/exchange
//
// Flow:
//   1. Parse JSON request body → ExchangeHTTPRequest
//   2. Validate all required fields
//   3. Generate UUID for txn_id (v4, crypto-safe)
//   4. Map HTTP DTO → services.ExchangeRequest
//   5. Call CommitExchangeTransaction()
//   6. Map ExchangeResult → ExchangeHTTPResponse
//   7. Return JSON with appropriate HTTP status code
//
// Error Mapping:
//   - Validation failure          → 400 Bad Request
//   - Fraud blocked               → 403 Forbidden
//   - Double-entry invariant fail → 500 Internal Server Error
//   - Unexpected errors           → 500 Internal Server Error
//
// Maps to execution plan: Member 1, Day 6, Phase 2
// =============================================================================

package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/adityakryadav/project-point-ledger/ledger-accounting-service/services"
)

// =============================================================================
// Request / Response DTOs (HTTP Layer)
// =============================================================================

// ExchangeHTTPRequest is the JSON schema for incoming exchange API requests.
//
// This is the external-facing contract. The handler maps it to the internal
// services.ExchangeRequest struct, which contains the full set of fields
// needed by CommitExchangeTransaction().
//
// Example payload:
//
//	{
//	  "user_id": "550e8400-e29b-41d4-a716-446655440000",
//	  "source_partner_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
//	  "source_points": 1000,
//	  "exchange_rate": 0.75,
//	  "state_code": "MH",
//	  "fraud_score": 0.12
//	}
type ExchangeHTTPRequest struct {
	// UserID is the UUID of the user initiating the exchange.
	UserID string `json:"user_id"`

	// SourcePartnerID is the UUID of the partner whose points are being exchanged.
	SourcePartnerID string `json:"source_partner_id"`

	// SourcePoints is the number of loyalty points being converted.
	// Must be greater than 0.
	SourcePoints float64 `json:"source_points"`

	// ExchangeRate is the INR-per-point conversion rate.
	// In production, this is determined by the DQN pricing agent (Day 7).
	// Must be greater than 0.
	ExchangeRate float64 `json:"exchange_rate"`

	// StateCode is the user's 2-letter Indian state code for GST routing.
	// Examples: "DL" (Delhi), "MH" (Maharashtra), "KA" (Karnataka).
	StateCode string `json:"state_code"`

	// DeviceHash is the SHA-256 hash of the user's device fingerprint.
	// Forwarded to ML service for fraud scoring.
	DeviceHash string `json:"device_hash"`

	// KYCStatus is the user's KYC tier: 'SMALL' or 'FULL'.
	KYCStatus string `json:"kyc_status"`
}

// ExchangeHTTPResponse is the JSON schema for exchange API responses.
//
// Wraps the financial result with HTTP-level metadata (request_id, timestamp)
// for traceability and audit logging.
//
// Example response (200 OK):
//
//	{
//	  "request_id": "txn-a1b2c3d4-...",
//	  "timestamp": "2026-03-21T07:00:00Z",
//	  "status": "SUCCESS",
//	  "data": {
//	    "txn_id": "a1b2c3d4-...",
//	    "gross_value_inr": 750.00,
//	    "service_fee": 15.00,
//	    "gst_amount": 2.70,
//	    "net_value_inr": 732.30,
//	    "gst_breakdown": { ... },
//	    "journal_entry_balanced": true,
//	    "ledger_lines_count": 4
//	  }
//	}
type ExchangeHTTPResponse struct {
	// RequestID is the unique identifier for this API request (same as txn_id).
	RequestID string `json:"request_id"`

	// Timestamp is the server time when the response was generated (ISO 8601).
	Timestamp string `json:"timestamp"`

	// Status is the transaction outcome: SUCCESS, FLAGGED, or BLOCKED.
	Status string `json:"status"`

	// Data contains the financial details of the completed exchange.
	// Nil when the transaction is BLOCKED.
	Data *ExchangeResponseData `json:"data,omitempty"`
}

// ExchangeResponseData contains the financial breakdown of a completed exchange.
//
// This is a flattened view of ExchangeResult, designed for API consumers
// who don't need the full internal representation (journal entries, ledger lines).
type ExchangeResponseData struct {
	// TxnID is the UUID assigned to this exchange transaction.
	TxnID string `json:"txn_id"`

	// GrossValueINR is the total INR value of the exchanged points.
	GrossValueINR float64 `json:"gross_value_inr"`

	// ServiceFee is the platform commission (2% of gross value).
	ServiceFee float64 `json:"service_fee"`

	// GSTAmount is the total GST on the service fee (18%).
	GSTAmount float64 `json:"gst_amount"`

	// NetValueINR is the amount credited to the user's wallet.
	NetValueINR float64 `json:"net_value_inr"`

	// GSTBreakdown contains the itemized GST detail (CGST/SGST or IGST).
	GSTBreakdown *GSTBreakdownResponse `json:"gst_breakdown"`

	// JournalEntryBalanced indicates whether the double-entry invariant held.
	JournalEntryBalanced bool `json:"journal_entry_balanced"`

	// LedgerLinesCount is the number of ledger lines created for this transaction.
	LedgerLinesCount int `json:"ledger_lines_count"`
}

// GSTBreakdownResponse is the API-facing GST detail.
type GSTBreakdownResponse struct {
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

	// ServiceFeeBase is the service fee amount on which GST was calculated.
	ServiceFeeBase float64 `json:"service_fee_base"`

	// RecordsCount is the number of gst_records entries (2 for INTRA, 1 for INTER).
	RecordsCount int `json:"records_count"`
}

// ErrorResponse is the standardized error payload for non-2xx responses.
//
// All error responses follow this structure for consistent API behavior.
// Error codes are machine-readable; messages are human-readable.
type ErrorResponse struct {
	// Error is a machine-readable error code (e.g., "VALIDATION_ERROR").
	Error string `json:"error"`

	// Message is a human-readable description of the error.
	Message string `json:"message"`

	// Timestamp is the server time when the error occurred.
	Timestamp string `json:"timestamp"`
}

// =============================================================================
// Error Codes
// =============================================================================

const (
	ErrCodeValidation     = "VALIDATION_ERROR"
	ErrCodeFraudBlocked   = "FRAUD_BLOCKED"
	ErrCodeInternalError  = "INTERNAL_ERROR"
	ErrCodeMethodNotAllowed = "METHOD_NOT_ALLOWED"
	ErrCodeBadRequest     = "BAD_REQUEST"
)

// =============================================================================
// Exchange Handler
// =============================================================================

// ExchangeHandler holds dependencies for the exchange endpoint.
//
// In Day 7+, this will include the TransactionManager for database operations.
// For Day 6, we focus on the HTTP layer and service invocation.
type ExchangeHandler struct {
	// logger is the structured logger for this handler.
	logger *log.Logger
}

// NewExchangeHandler creates a new handler with default dependencies.
func NewExchangeHandler() *ExchangeHandler {
	return &ExchangeHandler{
		logger: log.New(log.Writer(), "[exchange-handler] ", log.LstdFlags|log.Lmicroseconds),
	}
}

// HandleExchange processes POST /api/v1/exchange requests.
//
// This is the main entry point for the exchange API. It validates the
// incoming request, generates a transaction ID, calls the transaction
// processor, and returns the result as a structured JSON response.
//
// HTTP Status Codes:
//   200 OK          — Transaction completed (SUCCESS or FLAGGED)
//   400 Bad Request — Invalid request body or validation failure
//   403 Forbidden   — Transaction blocked by fraud detection
//   405 Not Allowed — Non-POST method used
//   500 Internal    — Unexpected error during processing
func (h *ExchangeHandler) HandleExchange(w http.ResponseWriter, r *http.Request) {

	// =========================================================================
	// Step 1: Enforce POST method
	// =========================================================================
	if r.Method != http.MethodPost {
		h.writeError(w, http.StatusMethodNotAllowed, ErrCodeMethodNotAllowed,
			fmt.Sprintf("Method %s not allowed. Use POST.", r.Method))
		return
	}

	// =========================================================================
	// Step 2: Parse JSON request body
	// =========================================================================
	var httpReq ExchangeHTTPRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields() // Strict parsing — reject unknown fields
	if err := decoder.Decode(&httpReq); err != nil {
		h.writeError(w, http.StatusBadRequest, ErrCodeBadRequest,
			fmt.Sprintf("Invalid JSON request body: %s", err.Error()))
		return
	}

	// =========================================================================
	// Step 3: Validate request fields
	// =========================================================================
	if validationErr := validateHTTPRequest(&httpReq); validationErr != "" {
		h.writeError(w, http.StatusBadRequest, ErrCodeValidation, validationErr)
		return
	}

	// =========================================================================
	// Step 4: Generate transaction ID (UUID v4, crypto-safe)
	// =========================================================================
	txnID, err := generateTxnID()
	if err != nil {
		h.logger.Printf("ERROR: Failed to generate txn_id: %v", err)
		h.writeError(w, http.StatusInternalServerError, ErrCodeInternalError,
			"Failed to generate transaction ID")
		return
	}

	h.logger.Printf("Processing exchange: txn_id=%s, user=%s, partner=%s, points=%.2f, rate=%.4f, state=%s",
		txnID, httpReq.UserID, httpReq.SourcePartnerID,
		httpReq.SourcePoints, httpReq.ExchangeRate,
		httpReq.StateCode)

	// =========================================================================
	// Step 4.5: Call ML Service for Fraud Score
	// =========================================================================
	amountINR := httpReq.SourcePoints * httpReq.ExchangeRate
	fraudScore, err := h.getFraudScore(httpReq.UserID, httpReq.DeviceHash, amountINR, httpReq.KYCStatus)
	if err != nil {
		h.logger.Printf("ERROR: Fraud scoring failed: %v", err)
		// Fallback mechanism: treat as BLOCKED for safety
		h.handleTransactionError(w, txnID, nil, services.ErrTransactionBlocked)
		return
	}

	h.logger.Printf("Fraud score retrieved: txn_id=%s, score=%.4f", txnID, fraudScore)

	// =========================================================================
	// Step 5: Map HTTP DTO → internal ExchangeRequest
	// =========================================================================
	serviceReq := &services.ExchangeRequest{
		UserID:          httpReq.UserID,
		SourcePartnerID: httpReq.SourcePartnerID,
		SourcePoints:    httpReq.SourcePoints,
		ExchangeRate:    httpReq.ExchangeRate,
		StateCode:       strings.ToUpper(httpReq.StateCode),
		FraudScore:      fraudScore,
	}

	// =========================================================================
	// Step 6: Execute transaction via CommitExchangeTransaction
	// =========================================================================
	result, err := services.CommitExchangeTransaction(txnID, serviceReq)

	// =========================================================================
	// Step 7: Handle result and errors
	// =========================================================================
	if err != nil {
		h.handleTransactionError(w, txnID, result, err)
		return
	}

	// =========================================================================
	// Step 8: Build success response
	// =========================================================================
	response := h.buildSuccessResponse(result)

	h.logger.Printf("Exchange complete: txn_id=%s, status=%s, gross=%.2f, net=%.2f, gst=%.2f",
		result.TxnID, result.Status, result.GrossValueINR, result.NetValueINR, result.GSTAmount)

	h.writeJSON(w, http.StatusOK, response)
}

// =============================================================================
// Error Handling
// =============================================================================

// handleTransactionError maps transaction processor errors to HTTP responses.
//
// Error mapping strategy:
//   - ErrTransactionBlocked → 403 Forbidden (fraud detection)
//   - Validation errors     → 400 Bad Request
//   - All other errors      → 500 Internal Server Error
func (h *ExchangeHandler) handleTransactionError(
	w http.ResponseWriter,
	txnID string,
	result *services.ExchangeResult,
	err error,
) {
	// Check for fraud-blocked transaction
	if errors.Is(err, services.ErrTransactionBlocked) {
		h.logger.Printf("BLOCKED: txn_id=%s blocked by fraud detection", txnID)

		response := &ExchangeHTTPResponse{
			RequestID: txnID,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Status:    "BLOCKED",
		}
		h.writeJSON(w, http.StatusForbidden, response)
		return
	}

	// Check for validation errors (known error types from transaction_processor)
	if errors.Is(err, services.ErrInvalidUserID) ||
		errors.Is(err, services.ErrInvalidPartnerID) ||
		errors.Is(err, services.ErrInvalidSourcePoints) ||
		errors.Is(err, services.ErrInvalidExchangeRate) ||
		errors.Is(err, services.ErrInvalidStateCode) {

		h.writeError(w, http.StatusBadRequest, ErrCodeValidation, err.Error())
		return
	}

	// Check for negative value errors (edge case with very small amounts)
	if errors.Is(err, services.ErrNegativeNetValue) ||
		errors.Is(err, services.ErrNegativeGrossValue) {

		h.writeError(w, http.StatusBadRequest, ErrCodeValidation,
			fmt.Sprintf("Transaction amounts invalid: %s", err.Error()))
		return
	}

	// All other errors are internal
	h.logger.Printf("ERROR: txn_id=%s failed: %v", txnID, err)
	h.writeError(w, http.StatusInternalServerError, ErrCodeInternalError,
		"An internal error occurred while processing the exchange")
}

// =============================================================================
// Response Builders
// =============================================================================

// buildSuccessResponse maps an ExchangeResult to the HTTP response DTO.
func (h *ExchangeHandler) buildSuccessResponse(result *services.ExchangeResult) *ExchangeHTTPResponse {
	// Build GST breakdown response
	gstResponse := &GSTBreakdownResponse{
		GSTType:        result.GST.GSTType,
		TotalGST:       result.GST.TotalGST,
		CGST:           result.GST.CGST,
		SGST:           result.GST.SGST,
		IGST:           result.GST.IGST,
		ServiceFeeBase: result.GST.ServiceFeeBase,
		RecordsCount:   len(result.GST.Records),
	}

	// Check journal entry balance (should always be true if we got here)
	journalBalanced := false
	if result.JournalEntry != nil {
		journalBalanced = result.JournalEntry.IsBalanced()
	}

	return &ExchangeHTTPResponse{
		RequestID: result.TxnID,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Status:    result.Status,
		Data: &ExchangeResponseData{
			TxnID:                result.TxnID,
			GrossValueINR:        result.GrossValueINR,
			ServiceFee:           result.ServiceFee,
			GSTAmount:            result.GSTAmount,
			NetValueINR:          result.NetValueINR,
			GSTBreakdown:         gstResponse,
			JournalEntryBalanced: journalBalanced,
			LedgerLinesCount:     len(result.LedgerLines),
		},
	}
}

// =============================================================================
// HTTP Utilities
// =============================================================================

// writeJSON serializes a value to JSON and writes it to the response.
func (h *ExchangeHandler) writeJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		h.logger.Printf("ERROR: Failed to encode JSON response: %v", err)
	}
}

// writeError writes a standardized error response.
func (h *ExchangeHandler) writeError(w http.ResponseWriter, statusCode int, errorCode, message string) {
	errResp := &ErrorResponse{
		Error:     errorCode,
		Message:   message,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
	h.writeJSON(w, statusCode, errResp)
}

// =============================================================================
// Validation
// =============================================================================

// validateHTTPRequest performs HTTP-layer validation on the incoming request.
//
// This is a first-pass validation at the API boundary. The transaction
// processor performs its own deeper validation (e.g., fraud score range
// checks, state code format). We catch obvious issues here to provide
// better error messages to API consumers.
//
// Returns an empty string if valid, or an error message if invalid.
func validateHTTPRequest(req *ExchangeHTTPRequest) string {
	if req.UserID == "" {
		return "user_id is required"
	}
	if req.SourcePartnerID == "" {
		return "source_partner_id is required"
	}
	if req.SourcePoints <= 0 {
		return "source_points must be greater than zero"
	}
	if req.ExchangeRate <= 0 {
		return "exchange_rate must be greater than zero"
	}
	if len(req.StateCode) != 2 {
		return fmt.Sprintf("state_code must be a 2-letter Indian state code, got '%s'", req.StateCode)
	}
	return ""
}

// =============================================================================
// UUID Generation
// =============================================================================

// generateTxnID creates a cryptographically secure UUID v4 string.
//
// Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
// where x is a random hex digit and y is one of [8, 9, a, b].
//
// Uses crypto/rand for security-grade randomness — no external UUID
// packages needed. This is suitable for financial transaction IDs
// where predictability could be a security concern.
func generateTxnID() (string, error) {
	uuid := make([]byte, 16)
	if _, err := rand.Read(uuid); err != nil {
		return "", fmt.Errorf("crypto/rand failed: %w", err)
	}

	// Set version (4) and variant (RFC 4122) bits
	uuid[6] = (uuid[6] & 0x0f) | 0x40 // Version 4
	uuid[8] = (uuid[8] & 0x3f) | 0x80 // Variant is 10

	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		uuid[0:4],
		uuid[4:6],
		uuid[6:8],
		uuid[8:10],
		uuid[10:16],
	), nil
}

// =============================================================================
// Router Registration
// =============================================================================

// RegisterRoutes registers the exchange API endpoint with an HTTP mux.
//
// Call this from the main server setup:
//
//	mux := http.NewServeMux()
//	handler := handlers.NewExchangeHandler()
//	handler.RegisterRoutes(mux)
//	http.ListenAndServe(":8080", mux)
func (h *ExchangeHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/v1/exchange", h.HandleExchange)

	h.logger.Println("Registered: POST /api/v1/exchange")
}

// =============================================================================
// ML Service Integration
// =============================================================================

type fraudScoreRequestJSON struct {
	UserID     string  `json:"user_id"`
	DeviceHash string  `json:"device_hash"`
	Amount     float64 `json:"amount"`
	KYCStatus  string  `json:"kyc_status"`
}

type fraudScoreResponseJSON struct {
	FraudScore float64 `json:"fraud_score"`
	Decision   string  `json:"decision"`
}

func (h *ExchangeHandler) getFraudScore(userID, deviceHash string, amount float64, kycStatus string) (float64, error) {
	if deviceHash == "" {
		deviceHash = "unknown_device"
	}
	if kycStatus == "" {
		kycStatus = "SMALL"
	}

	reqPayload := fraudScoreRequestJSON{
		UserID:     userID,
		DeviceHash: deviceHash,
		Amount:     amount,
		KYCStatus:  kycStatus,
	}

	reqBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return 0, fmt.Errorf("marshal fail: %w", err)
	}

	client := &http.Client{Timeout: 200 * time.Millisecond}
	resp, err := client.Post("http://localhost:8001/api/v1/fraud/score", "application/json", bytes.NewReader(reqBytes))
	if err != nil {
		return 0, fmt.Errorf("post fail: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("non-200 status: %d", resp.StatusCode)
	}

	var resPayload fraudScoreResponseJSON
	if err := json.NewDecoder(resp.Body).Decode(&resPayload); err != nil {
		return 0, fmt.Errorf("decode fail: %w", err)
	}

	return resPayload.FraudScore, nil
}
