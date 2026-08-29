const {
  parseFinancialDocument,
} = require("./aiDocumentParser");

const {
  normalizeFinancialDocument,
} = require("./documentNormalizer");

const analyzeDocument = async (documentText) => {
  if (!documentText || !documentText.trim()) {
    throw new Error("Document text is required");
  }

  const aiResult = await parseFinancialDocument(documentText);

  // Remove Markdown code fences if Gemini returns them
  const cleanedResult = aiResult
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsedResult;

  try {
    parsedResult = JSON.parse(cleanedResult);
  } catch (error) {
    console.error("AI returned invalid JSON:", aiResult);
    throw new Error("AI returned invalid financial data");
  }

  const normalizedResult = normalizeFinancialDocument(parsedResult);
  return normalizedResult;
};

module.exports = {
  analyzeDocument,
};
