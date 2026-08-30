



const convertDocumentToLoan = (analysis) => {
  if (!analysis) {
    throw new Error("Document analysis is required");
  }

  if (analysis.documentType !== "loan") {
    throw new Error("Document is not a loan document");
  }

  if (
    !analysis.lender ||
    analysis.loanAmount === null ||
    analysis.interestRate === null ||
    analysis.tenureMonths === null
  ) {
    throw new Error(
      "Required loan information is missing from the document"
    );
  }

  return {
    lender_name: analysis.lender,
    loan_amount: analysis.loanAmount,
    interest_rate: analysis.interestRate,
    tenure_months: analysis.tenureMonths,

    processing_fee: analysis.fees?.processing || 0,
    insurance_cost: analysis.fees?.insurance || 0,
    documentation_fee: analysis.fees?.documentation || 0,
    other_charges: analysis.fees?.other || 0,

    prepayment_charge: analysis.prepaymentCharge
      ? parseFloat(analysis.prepaymentCharge)
      : 0,
  };
};

module.exports = {
  convertDocumentToLoan,
};
