package tests

import (
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
	}

	start := time.Now()
	wg.Add(concurrentTxnCount)
	for i := 0; i < concurrentTxnCount; i++ {
		go func(txnIndex int) {
			defer wg.Done()
			txnID := fmt.Sprintf("txn-%d", txnIndex)
			
			// Copy request to properly simulate thread locality
			req := *reqTemplate

			result, err := services.CommitExchangeTransaction(txnID, &req)
			if err != nil {
				errCh <- fmt.Errorf("Txn %s failed: %w", txnID, err)
				return
			}
			
			// Validate ACID guarantees
			gross := 1500.0
			fee := 30.0
			gst := 5.4
			net := 1464.6

			if result.GrossValueINR != gross || result.ServiceFee != fee || result.GSTAmount != gst || result.NetValueINR != net {
				errCh <- fmt.Errorf("Txn %s produced inconsistent values: %+v", txnID, result)
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
