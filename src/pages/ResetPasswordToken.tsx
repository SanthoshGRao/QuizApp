import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

function ResetPasswordToken() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setError("Reset session expired. Please request a new link.");
      setTimeout(() => {
        window.location.href = "/forgot-password";
      }, 2000);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password-token", {
        token,
        newPassword: password,
      });

      setSuccess("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Password reset failed";

      if (
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("invalid")
      ) {
        setError("Your reset link has expired. Please request a new one.");

        // ⏳ auto redirect after showing message
        setTimeout(() => {
          window.location.href = "/forgot-password";
        }, 2500);
      } else {
        setError(msg);
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter a new password for your account</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {error && (
          <p className="login-error">
            {error}
            {error.includes("expired") && (
              <span style={{ display: "block", marginTop: 8 }}>
                Redirecting to reset page...
              </span>
            )}
          </p>
        )}

        {success && <p style={{ color: "#86efac", marginTop: 12 }}>{success}</p>}
      </div>
    </div>
  );
}

export default ResetPasswordToken;
