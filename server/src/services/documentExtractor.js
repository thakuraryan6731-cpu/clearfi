const { PDFParse } = require("pdf-parse");

const extractTextFromPdf = async (buffer) => {
  if (!buffer) {
    throw new Error("PDF buffer is required");
  }

  const parser = new PDFParse({ data: buffer });

  const result = await parser.getText();

  await parser.destroy();

  if (!result.text || !result.text.trim()) {
    throw new Error(
      "No readable text found in the PDF. This may be a scanned document."
    );
  }

  return {
    text: result.text.trim(),
    pages: result.total,
  };
};

module.exports = {
  extractTextFromPdf,
};
