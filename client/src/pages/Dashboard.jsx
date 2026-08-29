import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLoanAnalyses, deleteLoanAnalysis } from "../services/loanAnalysis";

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
      console.error(error);
      setError("Failed to load your loan analyses.");
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
      console.error(error);
      setError("Failed to delete the analysis.");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <header>
        <h1>ClearFi</h1>

        <div>
          <span>{user?.email}</span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <section>
          <h2>Understand your loan before you pay.</h2>

          <p>
            Analyze loan costs, uncover hidden charges,
            and understand how transparent your offer really is.
          </p>

          <Link to="/new-analysis">
            Analyze a New Loan
          </Link>
        </section>

        <section>
          <h2>Your Loan Analyses</h2>

          {loading && <p>Loading analyses...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && analyses.length === 0 && (
            <p>
              You haven't analyzed any loans yet.
            </p>
          )}

          {!loading &&
            analyses.map((analysis) => {
              const result = analysis.analysis_results;

              return (
                <article key={analysis.id}>
                  <h3>{analysis.lender_name}</h3>

                  <p>
                    Loan Amount: ₹
                    {Number(analysis.loan_amount).toLocaleString("en-IN")}
                  </p>

                  <p>
                    Interest Rate: {analysis.interest_rate}%
                  </p>

                  <p>
                    EMI: ₹
                    {Number(result?.emi || 0).toLocaleString("en-IN")}
                  </p>

                  <p>
                    Transparency Score:{" "}
                    {result?.transparency_score ?? "N/A"}/100
                  </p>

                  <Link to={`/analysis/${analysis.id}`}>
                    View Details
                  </Link>

                  <button
                    onClick={() => handleDelete(analysis.id)}
                  >
                    Delete
                  </button>
                </article>
              );
            })}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
