const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const cleaned = String(value)
    .replace(/[₹$€£n]/gi, "")
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();

  if (!cleaned) {
    return null;
  }

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
};

const parsePercentage = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const match = String(value).match(/[\d.]+/);

  if (!match) {
    return null;
  }

  const number = Number(match[0]);

  return Number.isFinite(number) ? number : null;
};

const normalizeFinancialDocument = (analysis) => {
  if (!analysis) {
    throw new Error("AI analysis is required");
  }

  return {
    documentType: analysis.documentType || "unknown",

    lender: analysis.lender || null,

    loanAmount: parseNumber(analysis.loanAmount),

    interestRate: parsePercentage(analysis.interestRate),

    tenureMonths: parseNumber(analysis.tenureMonths),

    emi: parseNumber(analysis.emi),

    fees: {
      processing: parseNumber(analysis.fees?.processing),
      insurance: parseNumber(analysis.fees?.insurance),
      documentation: parseNumber(analysis.fees?.documentation),
      other: parseNumber(analysis.fees?.other),
    },

    prepaymentCharge: analysis.prepaymentCharge || null,

    importantClauses: Array.isArray(analysis.importantClauses)
      ? analysis.importantClauses
      : [],

    riskFlags: Array.isArray(analysis.riskFlags)
      ? analysis.riskFlags
      : [],
  };
};

module.exports = {
  normalizeFinancialDocument,
};
