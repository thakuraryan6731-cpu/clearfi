const { extractText } = require("unpdf");

const extractTextFromPdf = async (buffer) => {
  if (!buffer) {
    throw new Error("PDF buffer is required");
  }

  const result = await extractText(
    new Uint8Array(buffer),
    {
      mergePages: true,
    }
  );

  if (!result.text || !result.text.trim()) {
    throw new Error(
      "No readable text found in the PDF. This may be a scanned document."
    );
  }

  return {
    text: result.text.trim(),
    pages: result.totalPages,
  };
};

module.exports = {
  extractTextFromPdf,
};
