import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(formData);

      alert(response.data.message);

      navigate("/dashboard");
    } catch (error) {
      alert("Invalid Username or Password");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <br />
        <br />

        <Link to="/forgot-password">
          Forgot Password?
        </Link>

        <br />
        <br />

        <button type="submit">Login</button>
      </form>

      <br />

      <Link to="/register">
        Don't have an account? Register
      </Link>
    </div>
  );
};

export default Login;