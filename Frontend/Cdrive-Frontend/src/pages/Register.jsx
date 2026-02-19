import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios.jsx";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER"); // ✅ DEFAULT USER
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
        role, // ✅ SEND SELECTED ROLE
      });

      navigate("/login");
    } catch (err) {
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Registration failed"
      );
    }
  };

   return (
  <div className="auth-wrapper">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 auth-card">

              <h2 className="text-center mb-4">Register</h2>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
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
                  className="form-control mb-3"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* ✅ ROLE SELECTION */}
                <select
                  className="form-control mb-4"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>

                <button className="btn btn-primary w-100">
                  Register
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
  );
};

export default Register;
