package tests

import (
	"errors"
	"fmt"
	"math"
	"sync"
	"testing"
	"time"

	"github.com/adityakryadav/project-point-ledger/ledger-accounting-service/models"
	"github.com/adityakryadav/project-point-ledger/ledger-accounting-service/services"
)

// TestACIDInvariants ensures that CommitExchangeTransaction strictly enforces
// the ACID invariants (Gross = Net + Fee + GST) and refuses invalid states.
func TestACIDInvariants(t *testing.T) {
	req := &services.ExchangeRequest{
		UserID:          "user-1",
		SourcePartnerID: "partner-1",
		SourcePoints:    1000,
		ExchangeRate:    0.25, // 250 INR
		StateCode:       "DL",
		FraudScore:      0.1,
		KYCStatus:       "FULL",
		WalletBalance:   0,
		MonthlyLoad:     0,
		YearlyLoad:      0,
	}

	result, err := services.CommitExchangeTransaction("txn-1", req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Double-entry invariant logic check
	expectedGrossINR := 250.0 // 1000 * 0.25
	if math.Abs(result.GrossValueINR-expectedGrossINR) > 0.01 {
		t.Errorf("Expected gross %.2f, got %.2f", expectedGrossINR, result.GrossValueINR)
	}

	expectedServiceFee := 5.0 // 2% of 250
	if math.Abs(result.ServiceFee-expectedServiceFee) > 0.01 {
		t.Errorf("Expected fee %.2f, got %.2f", expectedServiceFee, result.ServiceFee)
	}

	expectedGST := 0.90 // 18% of 5.0
	if math.Abs(result.GSTAmount-expectedGST) > 0.01 {
		t.Errorf("Expected GST %.2f, got %.2f", expectedGST, result.GSTAmount)
	}

	expectedNet := 244.10 // 250 - 5.0 - 0.9
	if math.Abs(result.NetValueINR-expectedNet) > 0.01 {
		t.Errorf("Expected net %.2f, got %.2f", expectedNet, result.NetValueINR)
	}

	err = models.ValidateLineSet(result.LedgerLines)
	if err != nil {
		t.Errorf("Ledger line double-entry invariant validation failed: %v", err)
	}
}

// TestConcurrentACIDExecution simulates multiple simultaneous transactions to ensure thread safety
// and consistent output logic generation for CommitExchangeTransaction (no global state contamination).
func TestConcurrentACIDExecution(t *testing.T) {
	const concurrentTxnCount = 100
	var wg sync.WaitGroup
	errCh := make(chan error, concurrentTxnCount)

	reqTemplate := &services.ExchangeRequest{
		UserID:          "user-multi",
		SourcePartnerID: "partner-multi",
		SourcePoints:    5000,
		ExchangeRate:    0.3,
		StateCode:       "KA", // Inter-state
		FraudScore:      0.2,
		KYCStatus:       "FULL",
		WalletBalance:   0,
		MonthlyLoad:     0,
		YearlyLoad:      0,
	}

	start := time.Now()
	wg.Add(concurrentTxnCount)
	for i := 0; i < concurrentTxnCount; i++ {
		go func(txnIndex int) {
			defer wg.Done()
			// Each goroutine gets a unique transaction ID
			txnID := fmt.Sprintf("txn-concurrent-%d", txnIndex)
			
			// Copy request to properly simulate thread locality
			req := *reqTemplate
			
			// Execute the exchange
			result, err := services.CommitExchangeTransaction(txnID, &req)
			if err != nil {
				errCh <- fmt.Errorf("Txn %s failed: %w", txnID, err)
				return
			}
			
			if result.Status != "SUCCESS" {
				errCh <- fmt.Errorf("Txn %s expected SUCCESS, got %s", txnID, result.Status)
			}
		}(i)
	}

	wg.Wait()
	close(errCh)

	for err := range errCh {
		if err != nil {
			t.Errorf("Concurrent execution error: %v", err)
		}
	}
	t.Logf("Successfully processed %d concurrent transactions in %v", concurrentTxnCount, time.Since(start))
}

// TestPPILimitEnforcement validates that the system correctly rejects transactions
// that exceed Small PPI and Full KYC wallet limits.
func TestPPILimitEnforcement(t *testing.T) {
	req := &services.ExchangeRequest{
		UserID:          "user-limit-test",
		SourcePartnerID: "partner-1",
		SourcePoints:    100000,
		ExchangeRate:    0.20, // Gross 20000, Net 19528
		StateCode:       "DL",
		FraudScore:      0.1,
	}

	// 1. Small PPI Monthly Limit (10,000)
	req.KYCStatus = "SMALL"
	req.MonthlyLoad = 0
	req.YearlyLoad = 0
	_, err := services.CommitExchangeTransaction("txn-limit-1", req)
	if err == nil || !errors.Is(err, services.ErrPPILimitExceeded) {
		t.Errorf("Expected ErrPPILimitExceeded for Small PPI monthly overload, got: %v", err)
	}

	// 2. Small PPI Yearly Limit (1,20,000)
	req.SourcePoints = 1000 // Gross 200, Net 195.28 (fits monthly)
	req.MonthlyLoad = 0
	req.YearlyLoad = 119900 // 119900 + 195.28 > 120000
	_, err = services.CommitExchangeTransaction("txn-limit-2", req)
	if err == nil || !errors.Is(err, services.ErrPPILimitExceeded) {
		t.Errorf("Expected ErrPPILimitExceeded for Small PPI yearly overload, got: %v", err)
	}

	// 3. Full KYC Balance Limit (2,00,000)
	req.KYCStatus = "FULL"
	req.SourcePoints = 1000 // Net 195.28
	req.WalletBalance = 199900 // 199900 + 195.28 > 200000
	_, err = services.CommitExchangeTransaction("txn-limit-3", req)
	if err == nil || !errors.Is(err, services.ErrPPILimitExceeded) {
		t.Errorf("Expected ErrPPILimitExceeded for Full KYC balance overload, got: %v", err)
	}
	
	// 4. Valid Transaction
	req.WalletBalance = 0
	_, err = services.CommitExchangeTransaction("txn-limit-4", req)
	if err != nil {
		t.Errorf("Expected valid transaction to pass, got error: %v", err)
	}
}

