import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLoanAnalysisById } from "../services/loanAnalysis";

const AnalysisDetails = () => {
  const { id } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const response = await getLoanAnalysisById(id);
        setAnalysis(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load loan analysis.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [id]);

  if (loading) {
    return <main className="analysis-page">Loading analysis...</main>;
  }

  if (error) {
    return <main className="analysis-page">{error}</main>;
  }

  if (!analysis) {
    return <main className="analysis-page">Analysis not found.</main>;
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

  const totalCharges = Number(
    result?.total_upfront_charges || 0
  );

  const actualReceived = Number(
    result?.actual_amount_received || 0
  );

  const loanAmount = Number(analysis.loan_amount || 0);

  const interest = Number(
    result?.total_interest || 0
  );

  return (
    <main className="analysis-page">
      <Link className="back-link" to="/dashboard">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <section className="analysis-header">
        <div>
          <p className="eyebrow">LOAN ANALYSIS</p>

          <h1>{analysis.lender_name}</h1>

          <p>
            Here's what this loan actually costs you.
          </p>
        </div>

        <div className={`score-card ${scoreClass}`}>
          <span>Transparency Score</span>

          <strong>{score}/100</strong>

          <small>{scoreLabel}</small>
        </div>
      </section>

      {/* Loan overview */}
      <section className="report-card">
        <h2>Loan Overview</h2>

        <div className="stats-grid">
          <div>
            <span>Loan Amount</span>
            <strong>
              ₹{loanAmount.toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Interest Rate</span>
            <strong>{analysis.interest_rate}%</strong>
          </div>

          <div>
            <span>Tenure</span>
            <strong>{analysis.tenure_months} months</strong>
          </div>

          <div>
            <span>Monthly EMI</span>
            <strong>
              ₹{Number(result?.emi || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </section>

      {/* True cost */}
      <section className="report-card">
        <h2>What You'll Actually Pay</h2>

        <div className="cost-list">
          <div>
            <span>Principal</span>
            <strong>
              ₹{loanAmount.toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Total Interest</span>
            <strong>
              ₹{interest.toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Total Repayment</span>
            <strong>
              ₹{Number(result?.total_repayment || 0).toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* Advertised vs actual */}
      <section className="report-card highlight-card">
        <h2>Advertised vs. Actual</h2>

        <div className="comparison">
          <div>
            <span>Loan Amount</span>
            <strong>
              ₹{loanAmount.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="arrow">→</div>

          <div>
            <span>You Actually Receive</span>
            <strong>
              ₹{actualReceived.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <p>
          ₹{totalCharges.toLocaleString("en-IN")} is deducted
          through upfront charges before you receive the loan.
        </p>
      </section>

      {/* Charges */}
      <section className="report-card">
        <h2>Upfront Charges</h2>

        <div className="charge-list">
          <div>
            <span>Processing Fee</span>
            <strong>
              ₹{Number(analysis.processing_fee || 0).toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>Insurance</span>
            <strong>
              ₹{Number(analysis.insurance_cost || 0).toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>Documentation</span>
            <strong>
              ₹{Number(
                analysis.documentation_fee || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Other Charges</span>
            <strong>
              ₹{Number(analysis.other_charges || 0).toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="total-row">
            <span>Total Upfront Charges</span>
            <strong>
              ₹{totalCharges.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </section>

      {/* Findings */}
      <section className="report-card">
        <h2>Potential Issues</h2>

        {findings.length === 0 ? (
          <div className="no-findings">
            <strong>No major issues detected</strong>
            <p>
              ClearFi didn't identify any of the current
              warning patterns in this loan.
            </p>
          </div>
        ) : (
          <div className="findings-list">
            {findings.map((finding) => (
              <article
                className={`finding ${finding.severity}`}
                key={finding.id}
              >
                <div className="finding-icon">⚠️</div>

                <div>
                  <strong>{finding.title}</strong>

                  <span className="finding-severity">
                    {finding.severity.toUpperCase()}
                  </span>

                  <p>{finding.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Explanation */}
      <section className="report-card explanation-card">
        <h2>What does this mean?</h2>

        <p>
          ClearFi analyzes the advertised loan amount,
          interest, fees, and additional charges to show
          you the real cost of borrowing.
        </p>

        <p>
          A transparency score of <strong>{score}/100</strong>{" "}
          reflects the potential cost and warning patterns
          detected in this loan offer.
        </p>
      </section>
    </main>
  );
};

export default AnalysisDetails;