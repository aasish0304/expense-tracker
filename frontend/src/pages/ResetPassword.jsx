import { useState } from "react";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/api/auth/reset-password/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          confirm_password: confirmPassword,
        }),
      }
    );

    const data = await response.json();
    alert(data.message);
  };

  return (
    <div>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={handleResetPassword}>
        Reset Password
      </button>
    </div>
  );
}

export default ResetPassword;