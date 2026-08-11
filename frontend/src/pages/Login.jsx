import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import { loginUser } from "../services/authService";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await loginUser(formData);

      setSuccessMessage(
        "Login successful!"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);

    } catch (error) {
      console.error("Login Error:", error.response?.data);

      if (error.response?.status === 404) {
        setErrorMessage(
          "Email not found. Please sign up for a Waku account."
        );
      } else if (error.response?.status === 401) {
        setErrorMessage(
          "Incorrect password. Please try again."
        );
      } else {
        setErrorMessage(
          "Something went wrong. Please try again."
        );
      }
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
              Your money.
              <br />
              <span>Your way.</span>
            </h1>

            <p>
              Understand where your money goes,
              stay in control, and make every rupee count.
            </p>

          </div>

          <div className="brand-footer">
            © 2026 Waku. Your money, your story.
          </div>

        </div>


        {/* RIGHT - LOGIN */}

        <div className="auth-content">

          <div className="auth-card">

            <h2>
              Welcome back 👋
            </h2>

            <p className="auth-subtitle">
              Sign in to continue your Waku journey.
            </p>


            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}

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


              {/* PASSWORD */}

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
                    placeholder="Enter your password"
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


              {/* ERROR */}

              {errorMessage && (

                <div className="auth-error">

                  <span>
                    {errorMessage}
                  </span>

                  {errorMessage.includes("sign up") && (

                    <Link
                      to="/register"
                      className="error-signup-link"
                    >
                      Sign up
                    </Link>

                  )}

                </div>

              )}


              {/* SUCCESS */}

              {successMessage && (

                <div className="auth-success">
                  {successMessage}
                </div>

              )}


              {/* FORGOT PASSWORD */}

              <div className="forgot-link">

                <Link
                  className="auth-link"
                  to="/forgot-password"
                >
                  Forgot password?
                </Link>

              </div>


              {/* LOGIN */}

              <button
                className="auth-button primary"
                type="submit"
                disabled={successMessage !== ""}
              >
                Sign in →
              </button>

            </form>


            {/* REGISTER */}

            <div className="auth-footer">

              Don't have an account?{" "}

              <Link
                className="auth-link"
                to="/register"
              >
                Create one
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;