import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getRegisterErrorMessage = (err) => {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (data?.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors).find(
      (value) => typeof value === "string" && value.trim()
    );
    if (firstError) {
      return firstError;
    }
  }

  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error;
  }

  return "Registration failed";
};

const validateRegisterForm = ({ name, email, password }) => {
  if (!name.trim()) {
    return "Name is required";
  }

  if (name.trim().length > 100) {
    return "Name must be at most 100 characters";
  }

  if (!email.trim()) {
    return "Email is required";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Enter a valid email address";
  }

  if (!password) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  if (password.length > 100) {
    return "Password must be at most 100 characters";
  }

  return "";
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const validationMessage = validateRegisterForm({
      name: normalizedName,
      email: normalizedEmail,
      password,
    });

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    const endpoint = role === "ADMIN" ? "/admin/signup" : "/auth/signup";

    try {
      await API.post(endpoint, {
        name: normalizedName,
        email: normalizedEmail,
        password,
      });

      navigate("/login");
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 auth-card">
            <h2 className="text-center mb-4">Register</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <input
                className="form-control mb-3"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                className="form-control mb-3"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                className="form-control mb-2"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              <div className="form-text mb-3">
                Password must be at least 6 characters.
              </div>

              <select
                className="form-control mb-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>

              <div className="form-text mb-4">
                Choose Admin only if you are creating a dashboard account for staff use.
              </div>

              <div className="form-text mb-4">
                Successful signup triggers the backend welcome-email flow through RabbitMQ. Real delivery is enabled when Brevo SMTP is configured on the server.
              </div>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading
                  ? "Creating account..."
                  : role === "ADMIN"
                    ? "Register as Admin"
                    : "Register as User"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
