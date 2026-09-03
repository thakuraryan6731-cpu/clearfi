import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await login(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setGoogleLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Unable to continue with Google.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-logo">
            C
          </div>

          <p className="auth-eyebrow">
            CLEARFI
          </p>

          <h1>Welcome back</h1>

          <p>
            Login to continue analyzing your loans.
          </p>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
        >
          <span className="google-icon">G</span>

          {googleLoading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="auth-form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-primary-button"
            disabled={loading || googleLoading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
