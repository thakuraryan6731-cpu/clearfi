const calculateLoan = (loanData) => {
  const {
    loan_amount,
    interest_rate,
    tenure_months,
    processing_fee = 0,
    insurance_cost = 0,
    documentation_fee = 0,
    other_charges = 0,
  } = loanData;

  // Convert values to numbers
  const principal = Number(loan_amount);
  const annualInterestRate = Number(interest_rate);
  const tenure = Number(tenure_months);

  // Monthly interest rate
  const monthlyRate = annualInterestRate / 12 / 100;

  // EMI calculation
  let emi;

  if (monthlyRate === 0) {
    emi = principal / tenure;
  } else {
    emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);
  }

  // Round EMI to 2 decimal places
  emi = Number(emi.toFixed(2));

  // Total amount paid through EMIs
  const totalRepayment = Number((emi * tenure).toFixed(2));

  // Total interest
  const totalInterest = Number(
    (totalRepayment - principal).toFixed(2)
  );

  // Calculate all upfront charges
  const totalUpfrontCharges = Number(
    (
      Number(processing_fee) +
      Number(insurance_cost) +
      Number(documentation_fee) +
      Number(other_charges)
    ).toFixed(2)
  );

  // Actual amount received after deductions
  const actualAmountReceived = Number(
    (principal - totalUpfrontCharges).toFixed(2)
  );

  return {
    emi,
    totalRepayment,
    totalInterest,
    totalUpfrontCharges,
    actualAmountReceived,
  };
};

module.exports = calculateLoan;
