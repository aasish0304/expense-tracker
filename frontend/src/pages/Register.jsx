import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

import { registerUser } from "../services/authService";
import "../styles/auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ================================
     PASSWORD REQUIREMENTS
  ================================= */

  const hasLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

  const score =
    Number(hasLength) +
    Number(hasUpper) +
    Number(hasLower) +
    Number(hasNumber) +
    Number(hasSpecial);

  const isPasswordValid =
    hasLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial;

  const getPasswordStrength = () => {
    switch (score) {
      case 1:
        return "Very Weak";

      case 2:
        return "Weak";

      case 3:
        return "Moderate";

      case 4:
        return "Strong";

      case 5:
        return "Very Strong";

      default:
        return "";
    }
  };

  /* ================================
     HANDLE INPUT
  ================================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrorMessage("");
    setSuccessMessage("");
  };

  /* ================================
     REGISTER
  ================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    /* Password validation */

    if (!isPasswordValid) {
      setErrorMessage(
        "Password must contain 8+ characters, uppercase, lowercase, a number, and a symbol."
      );

      return;
    }

    /* Confirm password */

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");

      return;
    }

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
      };

      const response = await registerUser(userData);

      /* Show success message */

      setSuccessMessage(
        "Account created successfully! Redirecting to login..."
      );

      /* Redirect after message */

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data
      );

      if (error.response?.data?.email) {
        setErrorMessage(
          Array.isArray(error.response.data.email)
            ? error.response.data.email[0]
            : error.response.data.email
        );

      } else if (error.response?.data?.password) {
        setErrorMessage(
          Array.isArray(error.response.data.password)
            ? error.response.data.password[0]
            : error.response.data.password
        );

      } else {
        setErrorMessage(
          "Registration failed. Please try again."
        );
      }
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* ========================================
            LEFT - WAKU BRANDING
        ======================================== */}

        <div className="auth-brand">

          <div>

            <div className="waku-logo">
              waku<span>.</span>
            </div>

            <div className="brand-tagline">
              Every Rupee has a Story.
            </div>

          </div>


          <div className="brand-content">

            <h1>
              Start your
              <br />
              <span>money story.</span>
            </h1>

            <p>
              Create your Waku account, understand
              your spending, and make every rupee count.
            </p>

          </div>


          <div className="brand-footer">
            © 2026 Waku. Your money, your story.
          </div>

        </div>


        {/* ========================================
            RIGHT - REGISTER
        ======================================== */}

        <div className="auth-content">

          <div className="auth-card">

            {/* BACK BUTTON */}

            <Link
              to="/"
              className="back-button"
              aria-label="Back to login"
            >
              <ArrowLeft
                size={20}
                strokeWidth={2}
              />
            </Link>


            {/* HEADING */}

            <h2>
              Create your account
            </h2>

            <p className="auth-subtitle">
              Start your journey with Waku today.
            </p>


            {/* FORM */}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {/* ====================================
                  EMAIL
              ==================================== */}

              <div className="input-group">

                <label>
                  Email
                </label>

                <div className="input-icon-wrapper">

                  <UserRound
                    className="input-icon"
                    size={18}
                    strokeWidth={1.8}
                  />

                  <input
                    className="auth-input with-icon"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* ====================================
                  PASSWORD
              ==================================== */}

              <div className="input-group">

                <label>
                  Password
                </label>

                <div className="input-icon-wrapper">

                  <LockKeyhole
                    className="input-icon"
                    size={18}
                    strokeWidth={1.8}
                  />

                  <input
                    className="auth-input with-icon password-input"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff
                        size={18}
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Eye
                        size={18}
                        strokeWidth={1.8}
                      />
                    )}

                  </button>

                </div>

              </div>


              {/* ====================================
                  PASSWORD STRENGTH
              ==================================== */}

              {formData.password.length > 0 && (

                <div className="password-strength">

                  <div className="strength-header">

                    <span>
                      Password strength
                    </span>

                    <span className="strength-label">
                      {getPasswordStrength()}
                    </span>

                  </div>


                  <div className="strength-bars">

                    {[1, 2, 3, 4, 5].map((bar) => (

                      <div
                        key={bar}
                        className={`strength-bar ${
                          score >= bar
                            ? "active"
                            : ""
                        }`}
                      />

                    ))}

                  </div>

                </div>

              )}


              {/* ====================================
                  PASSWORD REQUIREMENTS
              ==================================== */}

              <div className="password-rules">

                <div
                  className={`password-rule ${
                    hasLength ? "valid" : ""
                  }`}
                >
                  {hasLength ? "✓" : "○"} 8+ characters
                </div>


                <div
                  className={`password-rule ${
                    hasUpper ? "valid" : ""
                  }`}
                >
                  {hasUpper ? "✓" : "○"} Uppercase letter
                </div>


                <div
                  className={`password-rule ${
                    hasLower ? "valid" : ""
                  }`}
                >
                  {hasLower ? "✓" : "○"} Lowercase letter
                </div>


                <div
                  className={`password-rule ${
                    hasNumber ? "valid" : ""
                  }`}
                >
                  {hasNumber ? "✓" : "○"} Number
                </div>


                <div
                  className={`password-rule ${
                    hasSpecial ? "valid" : ""
                  }`}
                >
                  {hasSpecial ? "✓" : "○"} Special character
                </div>

              </div>


              {/* ====================================
                  CONFIRM PASSWORD
              ==================================== */}

              <div className="input-group">

                <label>
                  Confirm Password
                </label>

                <div className="input-icon-wrapper">

                  <LockKeyhole
                    className="input-icon"
                    size={18}
                    strokeWidth={1.8}
                  />

                  <input
                    className="auth-input with-icon password-input"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showConfirmPassword ? (
                      <EyeOff
                        size={18}
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Eye
                        size={18}
                        strokeWidth={1.8}
                      />
                    )}

                  </button>

                </div>

              </div>


              {/* ====================================
                  ERROR MESSAGE
              ==================================== */}

              {errorMessage && (

                <div className="auth-error">
                  {errorMessage}
                </div>

              )}


              {/* ====================================
                  SUCCESS MESSAGE
              ==================================== */}

              {successMessage && (

                <div className="auth-success">
                  {successMessage}
                </div>

              )}


              {/* ====================================
                  REGISTER BUTTON
              ==================================== */}

              <button
                className="auth-button primary"
                type="submit"
                disabled={
                  !isPasswordValid ||
                  formData.password !==
                    formData.confirmPassword ||
                  successMessage !== ""
                }
              >
                Create account →
              </button>

            </form>


            {/* ====================================
                LOGIN LINK
            ==================================== */}

            <div className="auth-footer">

              Already have an account?{" "}

              <Link
                className="auth-link"
                to="/"
              >
                Sign in
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;