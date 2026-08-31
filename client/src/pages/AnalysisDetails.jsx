import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLoanAnalysisById } from "../services/loanAnalysis";

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const AnalysisDetails = () => {
  const { id } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);

        const response = await getLoanAnalysisById(id);

        setAnalysis(response.data);
      } catch (error) {
        console.error("Failed to load analysis:", error);

        setError(
          error.response?.data?.message ||
          "Failed to load loan analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [id]);

  if (loading) {
    return (
      <main className="analysis-page">
        <div className="analysis-loading">
          <div className="analysis-loading-spinner" />
          <h2>Loading your analysis...</h2>
          <p>Preparing your ClearFi report.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="analysis-page">
        <div className="analysis-error-page">
          <h2>Unable to load analysis</h2>
          <p>{error}</p>
          <Link to="/dashboard" className="analysis-action-button">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!analysis) {
    return (
      <main className="analysis-page">
        <div className="analysis-error-page">
          <h2>Analysis not found</h2>
          <Link to="/dashboard" className="analysis-action-button">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const result = analysis.analysis_results;
  const findings = analysis.findings || [];

  const score = Number(result?.transparency_score || 0);

  const scoreLabel =
    score >= 80
      ? "Good transparency"
      : score >= 60
        ? "Needs attention"
        : "High risk";

  const scoreClass =
    score >= 80
      ? "score-good"
      : score >= 60
        ? "score-warning"
        : "score-danger";

  const loanAmount = Number(analysis.loan_amount || 0);
  const totalInterest = Number(result?.total_interest || 0);
  const totalRepayment = Number(result?.total_repayment || 0);
  const emi = Number(result?.emi || 0);
  const upfrontCharges = Number(
    result?.total_upfront_charges || 0
  );
  const actualReceived = Number(
    result?.actual_amount_received || 0
  );

  const chargePercentage =
    loanAmount > 0
      ? ((upfrontCharges / loanAmount) * 100).toFixed(1)
      : "0";

  return (
    <main className="analysis-page">
      <div className="analysis-container">

        {/* Back */}
        <Link className="back-link" to="/dashboard">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <section className="analysis-header">
          <div className="analysis-title">
            <p className="eyebrow">LOAN ANALYSIS</p>

            <h1>{analysis.lender_name}</h1>

            <p>
              Here's what this loan could cost you.
            </p>
          </div>

          <div className={`score-card ${scoreClass}`}>
            <span>Transparency Score</span>

            <strong>{score}</strong>

            <small>/ 100</small>

            <div className="score-label">
              {scoreLabel}
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="overview-grid">

          <div className="overview-card">
            <span>Loan Amount</span>
            <strong>{formatCurrency(loanAmount)}</strong>
          </div>

          <div className="overview-card">
            <span>Interest Rate</span>
            <strong>{analysis.interest_rate}%</strong>
          </div>

          <div className="overview-card">
            <span>Tenure</span>
            <strong>{analysis.tenure_months} months</strong>
          </div>

          <div className="overview-card primary-overview">
            <span>Monthly EMI</span>
            <strong>{formatCurrency(emi)}</strong>
          </div>

        </section>

        {/* Real Cost */}
        <section className="report-card">

          <div className="section-heading">
            <div>
              <p className="section-eyebrow">
                REAL COST
              </p>

              <h2>What You'll Actually Pay</h2>
            </div>
          </div>

          <div className="cost-breakdown">

            <div className="cost-row">
              <div>
                <span>Principal</span>
                <small>Amount borrowed</small>
              </div>

              <strong>
                {formatCurrency(loanAmount)}
              </strong>
            </div>

            <div className="cost-row">
              <div>
                <span>Total Interest</span>
                <small>Interest over the full tenure</small>
              </div>

              <strong>
                {formatCurrency(totalInterest)}
              </strong>
            </div>

            <div className="cost-row">
              <div>
                <span>Upfront Charges</span>
                <small>Fees deducted before receiving the loan</small>
              </div>

              <strong>
                {formatCurrency(upfrontCharges)}
              </strong>
            </div>

            <div className="cost-total">
              <div>
                <span>Total Repayment</span>
                <small>Principal + interest</small>
              </div>

              <strong>
                {formatCurrency(totalRepayment)}
              </strong>
            </div>

          </div>
        </section>

        {/* Advertised vs Actual */}
        <section className="report-card actual-card">

          <div className="section-heading">
            <div>
              <p className="section-eyebrow">
                MONEY YOU RECEIVE
              </p>

              <h2>Advertised vs. Actual</h2>
            </div>
          </div>

          <div className="actual-comparison">

            <div className="actual-box advertised">
              <span>Advertised Loan</span>

              <strong>
                {formatCurrency(loanAmount)}
              </strong>
            </div>

            <div className="comparison-arrow">
              →
            </div>

            <div className="actual-box received">
              <span>You Actually Receive</span>

              <strong>
                {formatCurrency(actualReceived)}
              </strong>
            </div>

          </div>

          <div className="deduction-message">
            <strong>
              {formatCurrency(upfrontCharges)}
            </strong>{" "}
            is deducted through upfront charges before
            you receive the loan.

            <span>
              That's {chargePercentage}% of the advertised
              loan amount.
            </span>
          </div>

        </section>

        {/* Charges */}
        <section className="report-card">

          <div className="section-heading">
            <div>
              <p className="section-eyebrow">
                FEE BREAKDOWN
              </p>

              <h2>Upfront Charges</h2>
            </div>

            <div className="charge-total-badge">
              {formatCurrency(upfrontCharges)}
            </div>
          </div>

          <div className="charge-grid">

            <div className="charge-card">
              <span>Processing Fee</span>
              <strong>
                {formatCurrency(analysis.processing_fee)}
              </strong>
            </div>

            <div className="charge-card">
              <span>Insurance</span>
              <strong>
                {formatCurrency(analysis.insurance_cost)}
              </strong>
            </div>

            <div className="charge-card">
              <span>Documentation</span>
              <strong>
                {formatCurrency(
                  analysis.documentation_fee
                )}
              </strong>
            </div>

            <div className="charge-card">
              <span>Other Charges</span>
              <strong>
                {formatCurrency(analysis.other_charges)}
              </strong>
            </div>

          </div>

        </section>

        {/* Findings */}
        <section className="report-card">

          <div className="section-heading">
            <div>
              <p className="section-eyebrow">
                RISK CHECK
              </p>

              <h2>Potential Issues</h2>
            </div>

            <span className="finding-count">
              {findings.length} detected
            </span>
          </div>

          {findings.length === 0 ? (
            <div className="no-findings">
              <div className="success-icon">
                ✓
              </div>

              <div>
                <strong>
                  No major issues detected
                </strong>

                <p>
                  ClearFi didn't identify any of the
                  current warning patterns in this loan.
                </p>
              </div>
            </div>
          ) : (
            <div className="findings-list">

              {findings.map((finding) => (
                <article
                  className={`finding ${finding.severity}`}
                  key={finding.id}
                >
                  <div className="finding-icon">
                    ⚠
                  </div>

                  <div className="finding-content">

                    <div className="finding-title-row">
                      <strong>
                        {finding.title}
                      </strong>

                      <span className="finding-severity">
                        {finding.severity.toUpperCase()}
                      </span>
                    </div>

                    <p>
                      {finding.description}
                    </p>

                  </div>
                </article>
              ))}

            </div>
          )}

        </section>

        {/* Meaning */}
        <section className="report-card explanation-card">

          <p className="section-eyebrow">
            CLEARFI EXPLAINED
          </p>

          <h2>What does this mean?</h2>

          <p>
            ClearFi analyzes the loan amount, interest,
            fees, and additional charges to help you
            understand the potential cost of borrowing.
          </p>

          <p>
            This offer received a{" "}
            <strong>{score}/100</strong> transparency
            score based on the warning patterns detected
            in the provided information.
          </p>

          <div className="disclaimer">
            ClearFi provides an informational analysis
            based on the information available in the
            uploaded document. Always review the final
            loan agreement and applicable terms before
            making a financial decision.
          </div>

        </section>

      </div>
    </main>
  );
};

export default AnalysisDetails;
