import { useState } from "react";
import { useSearchParams } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const password = formData.password;

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
      case 0:
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

  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      alert("Password does not meet all requirements.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const response = await fetch(
      "http://127.0.0.1:8000/api/auth/reset-password/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          token,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      window.location.href = "/";
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>

      <input
        type="password"
        name="password"
        placeholder="New Password"
        value={formData.password}
        onChange={handleChange}
      />

      <p>
        <strong>Password Strength:</strong> {getPasswordStrength()}
      </p>

      <div style={{ textAlign: "left", display: "inline-block" }}>
        <p>{hasLength ? "✅" : "❌"} Minimum 8 characters</p>
        <p>{hasUpper ? "✅" : "❌"} One uppercase letter</p>
        <p>{hasLower ? "✅" : "❌"} One lowercase letter</p>
        <p>{hasNumber ? "✅" : "❌"} One number</p>
        <p>{hasSpecial ? "✅" : "❌"} One special character</p>
      </div>

      <br />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
      />

      <br />
      <br />

      <button
        onClick={handleResetPassword}
        disabled={
          !isPasswordValid ||
          formData.password !== formData.confirmPassword
        }
      >
        Update Password
      </button>
    </div>
  );
}

export default ResetPassword;