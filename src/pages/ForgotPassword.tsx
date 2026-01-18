import { useState } from "react";
import api from "../api/axios";
import "./Login.css"; // SAME THEME

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.message);
      setSuccess(true); // ✅ trigger animation
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Forgot Password</h2>
        <p className="subtitle">We’ll send you a reset link</p>

        {success ? (
          <div className="success-box">
            <div className="checkmark">✓</div>
            <p className="success-text">
              Reset link sent!
              <br />
              Check your email
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Send reset link"}
            </button>
          </form>
        )}

        {msg && (
          <p className="login-success">
            If the email exists, you’ll receive a reset link shortly.
            <br />
            Please check your inbox and spam folder.
          </p>
        )}



      </div>
    </div>
  );
}
