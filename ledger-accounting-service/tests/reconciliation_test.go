package tests

import (
	"math"
	"testing"

	"github.com/adityakryadav/project-point-ledger/ledger-accounting-service/services"
)

// TestFinancialReconciliation ensures that the financial invariants
// holds true. Specifically:
// 1. Double-Entry rule: Sum of Debits == Sum of Credits
// 2. Gross Value = Net Value + Total GST + Service Fee
func TestFinancialReconciliation(t *testing.T) {
	req := &services.ExchangeRequest{
		UserID:          "reconcile-user",
		SourcePartnerID: "reconcile-partner",
		SourcePoints:    5000,
		ExchangeRate:    0.3, // Gross 1500
		StateCode:       "DL", // Intra-state (CGST + SGST)
		FraudScore:      0.01,
		KYCStatus:       "FULL",
		WalletBalance:   0,
		MonthlyLoad:     0,
		YearlyLoad:      0,
	}

	result, err := services.CommitExchangeTransaction("reconcile-txn-1", req)
	if err != nil {
		t.Fatalf("Failed to commit transaction: %v", err)
	}

	if result == nil || result.JournalEntry == nil {
		t.Fatal("Result or Journal Entry is nil")
	}

	// Invariant 1: Double-Entry Rule
	if !result.JournalEntry.IsBalanced() {
		t.Errorf("Journal Entry is not balanced: TotalDebit=%.2f, TotalCredit=%.2f",
			result.JournalEntry.TotalDebit, result.JournalEntry.TotalCredit)
	}

	// Verify the manual sum of lines
	var manualDebitSum, manualCreditSum float64
	for _, line := range result.LedgerLines {
		if line.IsDebit() {
			manualDebitSum += line.Debit
		} else if line.IsCredit() {
			manualCreditSum += line.Credit
		} else {
			t.Errorf("Unknown line type for account: %s", line.AccountName)
		}
	}

	// Allow extremely small floating point variations
	if math.Abs(manualDebitSum-manualCreditSum) > 0.001 {
		t.Errorf("Line sums do not match: DebitSum=%.4f, CreditSum=%.4f", manualDebitSum, manualCreditSum)
	}
	if math.Abs(manualDebitSum-result.JournalEntry.TotalDebit) > 0.001 {
		t.Errorf("Recorded debit sum %.4f differs from lines sum %.4f", result.JournalEntry.TotalDebit, manualDebitSum)
	}

	// Invariant 2: Gross = Net + Service Fee + Total GST
	calculatedGross := result.NetValueINR + result.ServiceFee + result.GSTAmount
	if math.Abs(calculatedGross-result.GrossValueINR) > 0.001 {
		t.Errorf("Value mismatch! Expected Gross %.4f, calculated %.4f (Net=%.4f, Fee=%.4f, GST=%.4f)",
			result.GrossValueINR, calculatedGross, result.NetValueINR, result.ServiceFee, result.GSTAmount)
	}
	
	// Ensure GST Breakdown components add up
	totalComponentGST := result.GST.CGST + result.GST.SGST + result.GST.IGST
	if math.Abs(totalComponentGST-result.GST.TotalGST) > 0.001 {
		t.Errorf("GST Components sum (%.4f) vs TotalGST (%.4f) mismatch", totalComponentGST, result.GST.TotalGST)
	}
}
