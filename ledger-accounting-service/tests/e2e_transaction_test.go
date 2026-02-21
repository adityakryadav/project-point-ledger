package tests

import (
	"bytes"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/adityakryadav/project-point-ledger/ledger-accounting-service/handlers"
)

func TestE2EExchangeTransaction(t *testing.T) {
	// 1. Mock ML Service on port 8001
	l, err := net.Listen("tcp", "127.0.0.1:8001")
	if err != nil {
		// If 8001 is already bound (e.g. by real ML service), just use that instead of skipping,
		// or log it. We'll proceed if it errors and assume another test or service is running.
		t.Logf("Failed to bind 8001: %v. The ML service might be running.", err)
	} else {
		mockML := http.NewServeMux()
		mockML.HandleFunc("/api/v1/pricing/quote", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"quote_id":"q123", "exchange_rate":0.75, "price_multiplier":1.0, "base_rate":0.75, "valid_until":"2026-12-31T23:59:59Z"}`))
		})
		mockML.HandleFunc("/api/v1/fraud/score", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"fraud_score":0.05, "decision":"APPROVE"}`))
		})

		ts := httptest.NewUnstartedServer(mockML)
		ts.Listener.Close()
		ts.Listener = l
		ts.Start()
		defer ts.Close()
	}

	// 2. Start Exchange Handler
	handler := handlers.NewExchangeHandler()

	// 3. Prepare valid HTTP request
	reqBody := []byte(`{
		"user_id": "e2e-user",
		"source_partner_id": "e2e-partner",
		"source_points": 1000,
		"exchange_rate": 0.50,
		"state_code": "DL",
		"device_hash": "e2e-device",
		"kyc_status": "FULL",
		"wallet_balance": 1000,
		"monthly_load": 1000,
		"yearly_load": 1000
	}`)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/exchange", bytes.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	// 4. Perform Request
	handler.HandleExchange(rec, req)

	// 5. Assert Response
	if rec.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp handlers.ExchangeHTTPResponse
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if resp.Status != "SUCCESS" {
		t.Errorf("Expected status SUCCESS, got %s", resp.Status)
	}
	if resp.Data == nil {
		t.Fatal("Response data is nil")
	}

	// Assuming the mock returns 0.75 or the real ML returns something.
	// Since tests can run in either state, we don't strictly assert the exact gross 750,
	// but we assert the basic structural success metrics.
	if resp.Data.TxnID == "" {
		t.Errorf("TxnID should not be empty")
	}
	if resp.Data.JournalEntryBalanced != true {
		t.Errorf("JournalEntryBalanced should be true")
	}
	if resp.Data.LedgerLinesCount != 4 {
		t.Errorf("Expected 4 ledger lines, got %d", resp.Data.LedgerLinesCount)
	}
}
