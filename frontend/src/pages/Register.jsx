import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      alert("Password does not meet all requirements.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const userData = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await registerUser(userData);

      alert(response.data.message);

      navigate("/");
    } catch (error) {
      console.error(error);

      if (error.response?.data) {
        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        alert("Registration Failed");
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <p>
          <strong>Password Strength:</strong>{" "}
          {getPasswordStrength()}
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
          required
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={
            !isPasswordValid ||
            formData.password !== formData.confirmPassword
          }
        >
          Register
        </button>
      </form>

      <br />

      <Link to="/">Already have an account? Login</Link>
    </div>
  );
};

export default Register;