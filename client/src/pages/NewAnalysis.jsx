import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLoanAnalysis } from "../services/loanAnalysis";
import { uploadDocument } from "../services/document";

const NewAnalysis = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    lender_name: "",
    loan_amount: "",
    interest_rate: "",
    tenure_months: "",
    processing_fee: "",
    insurance_cost: "",
    documentation_fee: "",
    other_charges: "",
    prepayment_charge: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("PDF must be smaller than 10 MB.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await uploadDocument(file);

      const analysisId = response?.data?.loanAnalysis?.id;

      if (!analysisId) {
        throw new Error(
          "Analysis was created but no analysis ID was returned."
        );
      }

      navigate(`/analysis/${analysisId}`);
    } catch (error) {
      console.error("PDF upload error:", error);

      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to analyze the PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await createLoanAnalysis({
        lender_name: form.lender_name,
        loan_amount: Number(form.loan_amount),
        interest_rate: Number(form.interest_rate),
        tenure_months: Number(form.tenure_months),
        processing_fee: Number(form.processing_fee || 0),
        insurance_cost: Number(form.insurance_cost || 0),
        documentation_fee: Number(form.documentation_fee || 0),
        other_charges: Number(form.other_charges || 0),
        prepayment_charge: Number(form.prepayment_charge || 0),
      });

      navigate(`/analysis/${response.data.loanAnalysis.id}`);
    } catch (error) {
      console.error("Manual analysis error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to analyze the loan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="new-analysis-page">
      <div className="new-analysis-container">

        {/* Header */}
        <header className="new-analysis-header">
          <div className="eyebrow">CLEARFI ANALYSIS</div>

          <h1>Analyze Your Loan</h1>

          <p>
            Upload your loan offer and let ClearFi uncover
            the real cost, hidden charges, and potential
            risks before you commit.
          </p>
        </header>

        {/* PDF Upload */}
        <section className="analysis-section">
          <h2>Upload Loan Offer</h2>

          <p className="section-description">
            The fastest way to analyze your loan.
            ClearFi will automatically extract the
            financial details from your PDF.
          </p>

          <form onSubmit={handlePdfUpload}>
            <div
              className={`upload-zone ${file ? "has-file" : ""
                }`}
            >
              <div className="upload-icon">
                📄
              </div>

              {!file ? (
                <>
                  <h3>Upload your loan PDF</h3>

                  <p>
                    PDF files only · Maximum size 10 MB
                  </p>

                  <label
                    htmlFor="loan-pdf"
                    className="choose-file-button"
                  >
                    Choose PDF
                  </label>
                </>
              ) : (
                <>
                  <h3>PDF ready for analysis</h3>

                  <p>
                    Your document has been selected.
                  </p>

                  <label
                    htmlFor="loan-pdf"
                    className="choose-file-button"
                  >
                    Choose Another PDF
                  </label>

                  <div className="file-info">
                    <div>
                      <div className="file-name">
                        📄 {file.name}
                      </div>

                      <div className="file-size">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                </>
              )}

              <input
                id="loan-pdf"
                className="file-input"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading || !file}
            >
              {loading ? (
                <span className="analyzing-state">
                  <span className="loading-spinner" />
                  Analyzing your loan...
                </span>
              ) : (
                "Analyze PDF"
              )}
            </button>
          </form>
        </section>

        {/* Divider */}
        <div className="analysis-divider">
          <span>or enter manually</span>
        </div>

        {/* Manual Analysis */}
        <section className="analysis-section">
          <h2>Enter Loan Details</h2>

          <p className="section-description">
            Prefer to enter the numbers yourself?
            You can analyze a loan manually.
          </p>

          <form
            className="manual-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="lender_name">
                Lender Name
              </label>

              <input
                id="lender_name"
                name="lender_name"
                placeholder="e.g. Sample Finance Bank"
                value={form.lender_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="loan_amount">
                Loan Amount
              </label>

              <input
                id="loan_amount"
                name="loan_amount"
                type="number"
                min="1"
                placeholder="e.g. 500000"
                value={form.loan_amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="interest_rate">
                Interest Rate (%)
              </label>

              <input
                id="interest_rate"
                name="interest_rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 10.5"
                value={form.interest_rate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tenure_months">
                Tenure (Months)
              </label>

              <input
                id="tenure_months"
                name="tenure_months"
                type="number"
                min="1"
                placeholder="e.g. 60"
                value={form.tenure_months}
                onChange={handleChange}
                required
              />
            </div>

            <h3 className="charges-title">
              Additional Charges
            </h3>

            <div className="form-group">
              <label htmlFor="processing_fee">
                Processing Fee
              </label>

              <input
                id="processing_fee"
                name="processing_fee"
                type="number"
                min="0"
                placeholder="0"
                value={form.processing_fee}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="insurance_cost">
                Insurance Cost
              </label>

              <input
                id="insurance_cost"
                name="insurance_cost"
                type="number"
                min="0"
                placeholder="0"
                value={form.insurance_cost}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="documentation_fee">
                Documentation Fee
              </label>

              <input
                id="documentation_fee"
                name="documentation_fee"
                type="number"
                min="0"
                placeholder="0"
                value={form.documentation_fee}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="other_charges">
                Other Charges
              </label>

              <input
                id="other_charges"
                name="other_charges"
                type="number"
                min="0"
                placeholder="0"
                value={form.other_charges}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prepayment_charge">
                Prepayment Charge
              </label>

              <input
                id="prepayment_charge"
                name="prepayment_charge"
                type="number"
                min="0"
                placeholder="0"
                value={form.prepayment_charge}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? (
                <span className="analyzing-state">
                  <span className="loading-spinner" />
                  Analyzing...
                </span>
              ) : (
                "Analyze Loan"
              )}
            </button>
          </form>
        </section>

        {/* Error */}
        {error && (
          <div className="analysis-error">
            {error}
          </div>
        )}
      </div>
    </main>
  );
};

export default NewAnalysis;
