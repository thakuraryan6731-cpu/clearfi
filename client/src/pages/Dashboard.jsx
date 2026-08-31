import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getLoanAnalyses,
  deleteLoanAnalysis,
} from "../services/loanAnalysis";

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getScoreClass = (score) => {
  if (score >= 80) return "dashboard-score-good";
  if (score >= 60) return "dashboard-score-warning";
  return "dashboard-score-danger";
};

const getScoreLabel = (score) => {
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs attention";
  return "High risk";
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLoanAnalyses();

      setAnalyses(response.data || []);
    } catch (error) {
      console.error("Failed to load analyses:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load your loan analyses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this analysis?"
    );

    if (!confirmed) return;

    try {
      await deleteLoanAnalysis(id);

      setAnalyses((current) =>
        current.filter((analysis) => analysis.id !== id)
      );
    } catch (error) {
      console.error("Delete analysis error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to delete the analysis."
      );
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Dashboard statistics
  const totalAnalyses = analyses.length;

  const averageScore =
    totalAnalyses > 0
      ? Math.round(
        analyses.reduce(
          (total, analysis) =>
            total +
            Number(
              analysis.analysis_results?.transparency_score || 0
            ),
          0
        ) / totalAnalyses
      )
      : 0;

  const averageEmi =
    totalAnalyses > 0
      ? analyses.reduce(
        (total, analysis) =>
          total +
          Number(analysis.analysis_results?.emi || 0),
        0
      ) / totalAnalyses
      : 0;

  const totalLoansValue = analyses.reduce(
    (total, analysis) =>
      total + Number(analysis.loan_amount || 0),
    0
  );

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <header className="dashboard-navbar">

        <Link to="/dashboard" className="dashboard-logo">
          <span className="dashboard-logo-mark">
            C
          </span>

          <span>ClearFi</span>
        </Link>

        <div className="dashboard-user">

          <span className="dashboard-email">
            {user?.email}
          </span>

          <button
            className="dashboard-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="dashboard-container">

        {/* Hero */}
        <section className="dashboard-hero">

          <div className="dashboard-hero-content">

            <p className="dashboard-eyebrow">
              YOUR FINANCIAL OVERVIEW
            </p>

            <h1>
              Understand your loans
              <br />
              <span>before you commit.</span>
            </h1>

            <p className="dashboard-description">
              Analyze loan costs, uncover hidden charges,
              and understand how transparent your offer
              really is.
            </p>

            <Link
              to="/new-analysis"
              className="dashboard-primary-button"
            >
              <span>+</span>
              Analyze a New Loan
            </Link>

          </div>

          <div className="dashboard-hero-card">

            <div className="hero-card-icon">
              ✓
            </div>

            <strong>
              Make informed decisions.
            </strong>

            <p>
              ClearFi turns complex loan documents
              into simple, understandable insights.
            </p>

          </div>

        </section>

        {/* Stats */}
        <section className="dashboard-stats">

          <div className="dashboard-stat-card">

            <span>Loans Analyzed</span>

            <strong>
              {totalAnalyses}
            </strong>

            <small>
              {totalAnalyses === 1
                ? "1 analysis completed"
                : `${totalAnalyses} analyses completed`}
            </small>

          </div>

          <div className="dashboard-stat-card">

            <span>Average Transparency</span>

            <strong>
              {totalAnalyses > 0
                ? `${averageScore}/100`
                : "—"}
            </strong>

            <small>
              {totalAnalyses > 0
                ? getScoreLabel(averageScore)
                : "No data yet"}
            </small>

          </div>

          <div className="dashboard-stat-card">

            <span>Average EMI</span>

            <strong>
              {totalAnalyses > 0
                ? formatCurrency(averageEmi)
                : "—"}
            </strong>

            <small>
              Across analyzed loans
            </small>

          </div>

          <div className="dashboard-stat-card">

            <span>Total Loan Value</span>

            <strong>
              {totalAnalyses > 0
                ? formatCurrency(totalLoansValue)
                : "—"}
            </strong>

            <small>
              Loans you've analyzed
            </small>

          </div>

        </section>

        {/* Analyses */}
        <section className="dashboard-analyses">

          <div className="dashboard-section-header">

            <div>
              <p className="dashboard-eyebrow">
                YOUR HISTORY
              </p>

              <h2>
                Recent Loan Analyses
              </h2>
            </div>

            {analyses.length > 0 && (
              <span className="analysis-count">
                {analyses.length}{" "}
                {analyses.length === 1
                  ? "analysis"
                  : "analyses"}
              </span>
            )}

          </div>

          {loading && (
            <div className="dashboard-loading">

              <div className="dashboard-spinner" />

              <p>
                Loading your analyses...
              </p>

            </div>
          )}

          {error && !loading && (
            <div className="dashboard-error">

              <strong>
                Something went wrong
              </strong>

              <p>{error}</p>

              <button onClick={loadAnalyses}>
                Try Again
              </button>

            </div>
          )}

          {!loading &&
            !error &&
            analyses.length === 0 && (
              <div className="dashboard-empty">

                <div className="empty-icon">
                  +
                </div>

                <h3>
                  No loan analyses yet
                </h3>

                <p>
                  Upload a loan offer and let ClearFi
                  uncover its real cost.
                </p>

                <Link
                  to="/new-analysis"
                  className="dashboard-primary-button"
                >
                  Analyze Your First Loan
                </Link>

              </div>
            )}

          {!loading &&
            !error &&
            analyses.length > 0 && (
              <div className="analysis-list">

                {analyses.map((analysis) => {

                  const result =
                    analysis.analysis_results;

                  const score = Number(
                    result?.transparency_score || 0
                  );

                  const findings =
                    analysis.findings || [];

                  return (
                    <article
                      className="analysis-item"
                      key={analysis.id}
                    >

                      <div className="analysis-main">

                        <div className="analysis-lender-icon">
                          {analysis.lender_name
                            ?.charAt(0)
                            ?.toUpperCase() || "L"}
                        </div>

                        <div className="analysis-info">

                          <h3>
                            {analysis.lender_name}
                          </h3>

                          <p>
                            {formatCurrency(
                              analysis.loan_amount
                            )}

                            <span>•</span>

                            {analysis.interest_rate}%

                            <span>•</span>

                            {analysis.tenure_months} months
                          </p>

                        </div>

                      </div>

                      <div className="analysis-metrics">

                        <div>
                          <span>EMI</span>

                          <strong>
                            {formatCurrency(
                              result?.emi
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Issues</span>

                          <strong>
                            {findings.length}
                          </strong>
                        </div>

                        <div
                          className={`dashboard-score ${getScoreClass(
                            score
                          )}`}
                        >
                          <span>Score</span>

                          <strong>
                            {score}/100
                          </strong>

                          <small>
                            {getScoreLabel(score)}
                          </small>
                        </div>

                      </div>

                      <div className="analysis-actions">

                        <Link
                          to={`/analysis/${analysis.id}`}
                          className="view-analysis-button"
                        >
                          View Details
                          <span>→</span>
                        </Link>

                        <button
                          className="delete-analysis-button"
                          onClick={() =>
                            handleDelete(
                              analysis.id
                            )
                          }
                          title="Delete analysis"
                        >
                          ×
                        </button>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

        </section>

      </main>

    </div>
  );
};

export default Dashboard;
