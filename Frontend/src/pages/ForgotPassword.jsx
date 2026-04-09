import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../axios.jsx";

const getMessage = (payload, fallback) => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return fallback;
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await API.post("/auth/forgot-password", {
        email: email.trim(),
      });
      setSuccess(
        getMessage(
          response?.data,
          "If an account exists for that email, a password reset link has been sent."
        )
      );
    } catch (err) {
      setError(
        getMessage(err?.response?.data, "Unable to process your request right now.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 auth-card">
            <h2 className="text-center mb-4">Forgot Password</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Sending reset link..." : "Send Reset Link"}
              </button>
            </form>

            <div className="text-center mt-3">
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
