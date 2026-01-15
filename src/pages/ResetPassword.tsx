import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // 👈 VERY IMPORTANT

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }

  try {
    if (token) {
      // 🔁 FORGOT PASSWORD FLOW (EMAIL TOKEN)
      await api.post("/auth/reset-password-token", {
        token,
        newPassword: password,
      });
    } else {
      // 🔐 FIRST LOGIN FLOW (JWT)
      await api.put("/auth/reset-password", {
        newPassword: password,
      });
    }

    setSuccess("Password updated successfully. Redirecting to login...");

    localStorage.clear();

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  } catch (err: any) {
    setError(err.response?.data?.message || "Password reset failed");
  }
};


  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter a new password</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Update Password</button>
        </form>

        {error && <p className="login-error">{error}</p>}
        {success && <p style={{ color: "#86efac" }}>{success}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;
