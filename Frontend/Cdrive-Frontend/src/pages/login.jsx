import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios.jsx";
import AppContext from "../Context/Context.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useContext(AppContext);

  const normalizeRole = (value) => {
    const raw = (value ?? "").toString().trim();
    if (!raw) return "";
    const lowered = raw.toLowerCase();
    if (lowered === "undefined" || lowered === "null") return "";
    return lowered.replace(/^role_/, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      const payload = res.data;
      const user =
        payload?.user ??
        payload?.admin ??
        payload?.account ??
        payload?.data ??
        payload;
      const token =
        payload?.token ??
        payload?.accessToken ??
        payload?.jwt ??
        payload?.authToken ??
        user?.token;
      const rawRole =
        user?.role ??
        payload?.role ??
        user?.Role ??
        payload?.Role ??
        user?.userRole ??
        payload?.userRole ??
        "";
      const role = normalizeRole(rawRole);

      if (token) {
        localStorage.setItem("token", token);
      }
      localStorage.setItem("user", JSON.stringify(user));
      if (role) {
        localStorage.setItem("role", role);
      } else {
        localStorage.removeItem("role");
      }
      localStorage.setItem("isLoggedIn", "true");

      setAuth({ user, role });

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Login failed"
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

              <h2 className="text-center mb-4">Login</h2>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
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

                <div className="mb-3">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button className="btn btn-primary w-100" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;
