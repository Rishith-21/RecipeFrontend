import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Register({ onRegister }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    security_question_1: "",
    security_answer_1: "",
    security_question_2: "",
    security_answer_2: ""
  });

  // Gmail validation regex & error state
  const gmailRegex = /^[a-zA-Z](\.?[a-zA-Z]){1,29}@gmail\.com$/;
  const [emailError, setEmailError] = useState("");

  // Password policy
  const passwordConditions = [
    { label: "Minimum 8 characters", test: (pw) => pw.length >= 8 },
    { label: "At least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
    { label: "At least one lowercase letter", test: (pw) => /[a-z]/.test(pw) },
    { label: "At least one special character (!@#$%^&*)", test: (pw) => /[!@#$%^&*]/.test(pw) }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Email validation on every change
    if (name === "email") {
      if (value === "") {
        setEmailError("");
      } else if (!value.includes("@")) {
        setEmailError("Email must include '@'");
      } else if (!value.includes("gmail")) {
        setEmailError("Email must include 'gmail' domain");
      } else if (!value.endsWith(".com")) {
        setEmailError("Email must end with '.com'");
      } else if (!value.endsWith("@gmail.com")) {
        setEmailError("Email must be in the format 'username@gmail.com'");
      } else if (!gmailRegex.test(value)) {
        setEmailError("Invalid Gmail address format");
      } else {
        setEmailError("");
      }
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (
      formData.first_name &&
      formData.last_name &&
      formData.email &&
      formData.password &&
      formData.confirm_password
    ) {
      if (emailError) {
        alert(emailError);
        return;
      }
      if (formData.password !== formData.confirm_password) {
        alert("Passwords do not match");
        return;
      }
      const allConditionsMet = passwordConditions.every(cond => cond.test(formData.password));
      if (!allConditionsMet) {
        alert("Please ensure your password meets all conditions.");
        return;
      }
      setStep(2);
    } else {
      alert("Please fill all fields");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.security_question_1 &&
      formData.security_answer_1 &&
      formData.security_question_2 &&
      formData.security_answer_2
    ) {
      // Bundle security questions for backend!
      const registrationPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        security_questions: [
          {
            question: formData.security_question_1,
            answer: formData.security_answer_1
          },
          {
            question: formData.security_question_2,
            answer: formData.security_answer_2
          }
        ]
      };

      try {
        const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registrationPayload),
          credentials: "include"
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (onRegister) onRegister();
          navigate("/login");
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (error) {
        alert("An error occurred: " + error.message);
      }
    } else {
      alert("Please answer all security questions");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left"></div>
        <div className="login-right">
          <h2
            className="create-acc"
            style={{ color: "orange", fontSize: "35px", marginBottom: "40px" }}
          >
            Create an Account
          </h2>
          <form onSubmit={step === 1 ? handleContinue : handleSubmit}>
            {step === 1 && (
              <>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
                <div style={{ position: "relative", width: "100%"  }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{width:"100%"}}
                  />
                  {emailError && (
                    <span
                      style={{
                        position: "absolute",
                        left: "0",
                        top: "110%",
                        background: "#fff7e6",
                        color: "#c94a16",
                        border: "1px solid #ffa726",
                        padding: "5px 8px",
                        borderRadius: "4px",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        marginTop: "4px",
                        zIndex: 1000,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                      }}
                    >
                      {emailError}
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: "10px" }}>
                  {passwordConditions.map(({ label, test }) => {
                    const satisfied = test(formData.password);
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
                  name="confirm_password"
                  placeholder="Confirm Password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
              </>
            )}

            {step === 2 && (
              <>
                <select
                  name="security_question_1"
                  value={formData.security_question_1}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Security Question 1</option>
                  <option value="mother_maiden">What is your mother's maiden name?</option>
                  <option value="first_pet">What was the name of your first pet?</option>
                  <option value="birth_city">In what city were you born?</option>
                </select>
                <input
                  type="text"
                  name="security_answer_1"
                  placeholder="Answer"
                  value={formData.security_answer_1}
                  onChange={handleChange}
                  required
                />
                <select
                  name="security_question_2"
                  value={formData.security_question_2}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Security Question 2</option>
                  <option value="fav_teacher">Who was your favorite teacher?</option>
                  <option value="first_car">What was your first car?</option>
                  <option value="best_friend">What is your best friend's name?</option>
                </select>
                <input
                  type="text"
                  name="security_answer_2"
                  placeholder="Answer"
                  value={formData.security_answer_2}
                  onChange={handleChange}
                  required
                />
              </>
            )}
            <button type="submit" className="btn">
              {step === 1 ? "Continue" : "Sign up"}
            </button>
          </form>
          <p>
            Already have an account?{" "}
            <span className="link" onClick={() => navigate("/login")}>
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
