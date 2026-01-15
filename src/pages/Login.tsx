import { useState } from "react";
import { login } from "../api/auth";
import "./Login.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("name", data.user.name);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem(
        "mustChangePassword",
        String(data.user.mustChangePassword)
      );

      if (data.user.mustChangePassword) {
        window.location.href = "/reset-password";
        return;
      }

      window.location.href =
        data.user.role === "ADMIN" ? "/admin" : "/student";
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-eye"
            >
              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>

            </span>
          </div>


          {error && <p className="login-error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Login"}
          </button>

        </form>



        <a href="/forgot-password" className="forgot-link">
          Forgot password?
        </a>

      </div>
    </div>
  );


}

export default Login;
