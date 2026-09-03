import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const { data, error } = await signup(
      email,
      password,
      fullName
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage(
        "Account created. Please check your email to verify your account."
      );

      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  const handleGoogleSignup = async () => {
    try {
      setError("");
      setMessage("");
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
      console.error("Google signup error:", error);
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

          <h1>Create your account</h1>

          <p>
            Start understanding your loans before you commit.
          </p>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleSignup}
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
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-primary-button"
            disabled={loading || googleLoading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
