const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const parseFinancialDocument = async (documentText) => {
  if (!documentText || !documentText.trim()) {
    throw new Error("Document text is required");
  }

  const prompt = `
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
`;

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `Gemini attempt ${attempt}/${maxAttempts}`
      );

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      console.log("Gemini analysis successful");

      return response.text;
    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error?.message || error
      );

      const status =
        error?.status ||
        error?.code ||
        error?.error?.code;

      const isRetryable =
        status === 503 ||
        status === "503" ||
        status === 429 ||
        status === "429";

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt - 1);

      console.log(
        `Retrying Gemini in ${delay}ms...`
      );

      await sleep(delay);
    }
  }
};

module.exports = {
  parseFinancialDocument,
};
