const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const parseFinancialDocument = async (documentText) => {
  if (!documentText || !documentText.trim()) {
    throw new Error("Document text is required");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `
You are ClearFi's financial document extraction assistant.

Analyze the financial document below.

Your job is ONLY to extract information that is explicitly present.
Do not invent missing information.

Return ONLY valid JSON using this structure:

{
  "documentType": "loan | insurance | unknown",
  "lender": null,
  "loanAmount": null,
  "interestRate": null,
  "tenureMonths": null,
  "emi": null,
  "fees": {
    "processing": null,
    "insurance": null,
    "documentation": null,
    "other": null
  },
  "prepaymentCharge": null,
  "importantClauses": [],
  "riskFlags": []
}

For missing information, use null.

For importantClauses, include important conditions or restrictions.

For riskFlags, include potential concerns such as:
- hidden charges
- multiple fees
- prepayment penalties
- variable interest conditions
- mandatory insurance
- unusual restrictions

DOCUMENT:

${documentText}
`,
  });

  return response.text;
};

module.exports = {
  parseFinancialDocument,
};
