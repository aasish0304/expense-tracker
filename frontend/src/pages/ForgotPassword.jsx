import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
} from "lucide-react";

import "../styles/auth.css";

function ForgotPassword() {

  const [email, setEmail] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const handleForgotPassword = async (e) => {

    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/forgot-password/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 404) {

        setErrorMessage(
          "Email not found. Please sign up for a Waku account."
        );

        return;
      }

      if (!response.ok) {

        setErrorMessage(
          data.message ||
          "Something went wrong. Please try again."
        );

        return;
      }

      setSuccessMessage(
        "Password reset email sent successfully. Check your inbox."
      );

    } catch (error) {

      console.error(
        "Forgot Password Error:",
        error
      );

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
              Every Rupee has a Story.
            </div>

          </div>

          <div className="brand-content">

            <h1>
              Your money.
              <br />
              <span>Your way.</span>
            </h1>

            <p>
              Stay in control of your money,
              even when you forget your password.
            </p>

          </div>

          <div className="brand-footer">
            © 2026 Waku. Your money, your story.
          </div>

        </div>


        {/* RIGHT - FORGOT PASSWORD */}

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


            <h2>
              Forgot your password?
            </h2>

            <p className="auth-subtitle">
              No worries. Enter your email and we'll
              send you a secure link to reset your password.
            </p>


            <form
              className="auth-form"
              onSubmit={handleForgotPassword}
            >

              {/* EMAIL */}

              <div className="input-group">

                <label>
                  Email
                </label>

                <div className="input-icon-wrapper">

                  <Mail
                    className="input-icon"
                    size={18}
                    strokeWidth={1.8}
                  />

                  <input
                    className="auth-input with-icon"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    required
                  />

                </div>

              </div>


              {/* ERROR */}

              {errorMessage && (

                <div className="auth-error">

                  <span>
                    {errorMessage}
                  </span>

                  <Link
                    to="/register"
                    className="error-signup-link"
                  >
                    Sign up
                  </Link>

                </div>

              )}


              {/* SUCCESS */}

              {successMessage && (

                <div className="auth-success">
                  {successMessage}
                </div>

              )}


              {/* BUTTON */}

              <button
                className="auth-button primary"
                type="submit"
              >
                Send reset link →
              </button>

            </form>


            {/* INFO */}

            <div className="info-box">

              Check your inbox after submitting.
              The password reset page will open when
              you click the link in the email.

            </div>


            {/* FOOTER */}

            <div className="auth-footer">

              Remember your password?{" "}

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
}

export default ForgotPassword;