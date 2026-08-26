import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok && data.success && data.token) {
        onLogin(data.token, data.userId); 
        console.log("Login response data:", data);
 // also pass userId if your handler expects it
        navigate("/home");
      }

 else {
        setError(data.message || "Login request failed. Try again later.");
      }
    } catch (err) {
      setError("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-right">
          <h1 className="login-welcome-bold">Welcome Back!</h1>
          <h2>Login</h2>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Sign in"}
            </button>
          </form>
          <p className="register-text">
            Don't have an account?{" "}
            <span className="link" onClick={() => navigate("/register")}>
              Register for free
            </span>
          </p>
          <p className="forgot-password-text">
            <Link to="/forgotpassword" className="link">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
