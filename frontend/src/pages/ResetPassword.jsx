import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

import "../styles/auth.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score =
    Number(hasLength) +
    Number(hasUpper) +
    Number(hasLower) +
    Number(hasNumber) +
    Number(hasSpecial);

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

  const isPasswordValid =
    hasLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial;

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!isPasswordValid) {
      setErrorMessage(
        "Password must contain 8+ characters, uppercase, lowercase, a number, and a symbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        "/api/auth/reset-password/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid,
            token,
            password,
            confirm_password: confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message || "Unable to update password."
        );
        return;
      }

      // Show success message
      setSuccessMessage(
        "Password updated successfully! Redirecting to login..."
      );

      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (error) {
      console.error("Reset Password Error:", error);

      setErrorMessage(
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* LEFT - WAKU BRANDING */}

        <div className="auth-brand">

          <div>

            <div className="waku-logo">
              waku<span>.</span>
            </div>

            <div className="brand-tagline">
              Every Rupee Has a Story.
            </div>

          </div>

          <div className="brand-content">

            <h1>
              Keep your
              <br />
              <span>money safe.</span>
            </h1>

            <p>
              Create a strong new password and
              get back to managing your money
              with confidence.
            </p>

          </div>

          <div className="brand-footer">
            © 2026 Waku. Your money, your story.
          </div>

        </div>


        {/* RIGHT - RESET PASSWORD */}

        <div className="auth-content">

          <div className="auth-card">

            {/* BACK BUTTON */}

            <button
              type="button"
              className="back-button"
              onClick={() => {
                window.location.href = "/";
              }}
              aria-label="Back to login"
            >
              <ArrowLeft
                size={20}
                strokeWidth={2}
              />
            </button>


            <h2>
              Create a new password
            </h2>

            <p className="auth-subtitle">
              Choose a strong password to keep your
              Waku account secure.
            </p>


            <form
              className="auth-form"
              onSubmit={handleResetPassword}
            >

              {/* NEW PASSWORD */}

              <div className="input-group">

                <label>
                  New Password
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
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
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


              {/* PASSWORD STRENGTH */}

              {password.length > 0 && (

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


              {/* PASSWORD REQUIREMENTS */}

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


              {/* CONFIRM PASSWORD */}

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
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
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


              {/* ERROR */}

              {errorMessage && (
                <div className="auth-error">
                  {errorMessage}
                </div>
              )}


              {/* SUCCESS */}

              {successMessage && (
                <div className="auth-success">
                  {successMessage}
                </div>
              )}


              {/* UPDATE PASSWORD */}

              <button
                className="auth-button primary"
                type="submit"
                disabled={
                  !isPasswordValid ||
                  password !== confirmPassword ||
                  successMessage !== ""
                }
              >
                Update Password →
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;