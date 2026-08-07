import { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/api/auth/forgot-password/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    alert(data.message);

    window.location.href = "/reset-password";
  };

  return (
    <div>
      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleForgotPassword}>
        Send Reset Link
      </button>
    </div>
  );
}

export default ForgotPassword;