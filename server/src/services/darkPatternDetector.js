const detectDarkPatterns = (loanData, calculation) => {
  const findings = [];

  const loanAmount = Number(loanData.loan_amount);
  const processingFee = Number(loanData.processing_fee || 0);
  const insuranceCost = Number(loanData.insurance_cost || 0);
  const documentationFee = Number(loanData.documentation_fee || 0);
  const otherCharges = Number(loanData.other_charges || 0);
  const prepaymentCharge = Number(loanData.prepayment_charge || 0);

  const totalCharges =
    processingFee +
    insuranceCost +
    documentationFee +
    otherCharges;

  // Percentage of loan amount deducted as upfront charges
  const upfrontChargePercentage =
    (totalCharges / loanAmount) * 100;

  // 1. High processing fee
  const processingFeePercentage =
    (processingFee / loanAmount) * 100;

  if (processingFeePercentage > 2) {
    findings.push({
      type: "high_processing_fee",
      severity: "high",
      title: "High Processing Fee",
      description: `The processing fee is ${processingFeePercentage.toFixed(
        2
      )}% of the loan amount, which significantly increases the cost of borrowing.`,
    });
  }

  // 2. High insurance deduction
  const insurancePercentage =
    (insuranceCost / loanAmount) * 100;

  if (insurancePercentage > 3) {
    findings.push({
      type: "high_insurance_cost",
      severity: "medium",
      title: "High Insurance Cost",
      description: `Insurance costs account for ${insurancePercentage.toFixed(
        2
      )}% of your loan amount.`,
    });
  }

  // 3. Multiple upfront charges
  const chargeCount = [
    processingFee,
    insuranceCost,
    documentationFee,
    otherCharges,
  ].filter((charge) => charge > 0).length;

  if (chargeCount >= 3) {
    findings.push({
      type: "multiple_upfront_charges",
      severity: "medium",
      title: "Multiple Upfront Charges",
      description: `${chargeCount} different upfront charges were detected.`,
    });
  }

  // 4. Large deduction from actual loan amount
  if (upfrontChargePercentage > 5) {
    findings.push({
      type: "large_upfront_deduction",
      severity: "high",
      title: "Large Amount Deducted Upfront",
      description: `₹${calculation.totalUpfrontCharges.toFixed(
        2
      )} is deducted before you receive the loan.`,
    });
  }

  // 5. High prepayment charge
  if (prepaymentCharge > 0) {
    findings.push({
      type: "prepayment_penalty",
      severity: "low",
      title: "Prepayment Charge Detected",
      description:
        "The lender charges a fee if you decide to repay your loan early.",
    });
  }

  return findings;
};

module.exports = detectDarkPatterns;
