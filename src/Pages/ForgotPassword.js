import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const passwordConditions = [
    { label: "Minimum 8 characters", test: (pw) => pw.length >= 8 },
    { label: "At least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
    { label: "At least one lowercase letter", test: (pw) => /[a-z]/.test(pw) },
    { label: "At least one number", test: (pw) => /\d/.test(pw) },
    { label: "At least one special character (!@#$%^&*)", test: (pw) => /[!@#$%^&*]/.test(pw) }
  ];

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          setMessage("Email not found.");
        } else {
          setMessage(`Error: ${res.status} ${res.statusText}`);
        }
        return;
      }

      const data = await res.json();

      if (data.success && data.questions.length > 0) {
        setQuestions(data.questions);
        setUserId(data.user_id); // Save user ID returned by backend
        setStep(2);
      } else if (data.success && data.questions.length === 0) {
        setMessage("No security questions set for this email.");
      } else {
        setMessage(data.message || "Unknown error occurred.");
      }
    } catch (error) {
      setMessage("Network or server error occurred. Please try again.");
      console.error("Error in handleEmailSubmit:", error);
    }
  };

  const handleAnswerChange = (e, question) => {
    setAnswers({ ...answers, [question]: e.target.value });
  };

  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answers }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("Verification successful! Please reset your password.");
        setStep(3);
      } else {
        setMessage(data.message || "Verification failed.");
      }
    } catch (error) {
      setMessage("Network or server error occurred. Please try again.");
      console.error("Error in handleAnswersSubmit:", error);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage("");

    const allConditionsMet = passwordConditions.every(cond => cond.test(newPassword));
    if (newPassword !== confirmNewPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (!allConditionsMet) {
      setMessage("Password does not meet security requirements.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/pass-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send userId as per updated backend endpoint
        body: JSON.stringify({ user_id: userId, new_password: newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("Password reset successfully! You can now log in.");
        setStep(4); // or redirect to login page
      } else {
        setMessage(data.message || "Password reset failed.");
      }
    } catch (error) {
      setMessage("Network or server error occurred. Please try again.");
      console.error("Error in handlePasswordReset:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-right">
          {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
              <h3 className="create-acc">Forgot your password?</h3>
              <h2 className="create-acc">Enter your Registered Email</h2>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn">Next</button>
              {message && <p className="login-welcome-bold">{message}</p>}
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleAnswersSubmit}>
              <h2 className="create-acc">Answer your security questions</h2>
              {questions.map((q) => (
                <div key={q} className="security-question-group">
                  <label className="security-question-label">{q.replace(/_/g, " ")}</label>
                  <input
                    type="text"
                    placeholder="Your answer"
                    onChange={(e) => handleAnswerChange(e, q)}
                    required
                    className="security-answer-input"
                  />
                </div>
              ))}
              <button type="submit" className="btn">Verify Answers</button>
              {message && <p className="error-message">{message}</p>}
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordReset}>
              <h2 className="create-acc">Reset Password</h2>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: "10px" }}>
                {passwordConditions.map(({ label, test }) => {
                  const satisfied = test(newPassword);
                  return (
                    <li
                      key={label}
                      style={{
                        color: satisfied ? "green" : "red",
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "4px",
                        fontWeight: "bold"
                      }}
                    >
                      {satisfied ? "✔️" : "❌"} <span style={{ marginLeft: "8px" }}>{label}</span>
                    </li>
                  );
                })}
              </ul>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn">Reset Password</button>
              {message && <p className="error-message">{message}</p>}
            </form>
          )}

          {step === 4 && (
            <>
              <p className="create-acc">{message}</p>
              <button className="btn" onClick={() => navigate("/login")}>Go to Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
