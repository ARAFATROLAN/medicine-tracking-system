import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Services/api";

const Login: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const response = await api.loginUser(email, password);
      const token = response.access_token;
      const user = response.user;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.specialisation);
      localStorage.setItem("name", user.name);

      switch (user.specialisation) {
        case "Doctor":
          navigate("/dashboard/doctor");
          break;
        case "Pharmacist":
          navigate("/dashboard/pharmacist");
          break;
        case "Admin":
          navigate("/dashboard/admin");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.mainContent}>
        <div style={styles.loginCard}>
          <h2 style={styles.title}>Login</h2>

          {loginError && <div style={styles.errorMessage}>{loginError}</div>}

          <form onSubmit={handleLogin} autoComplete="off">
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.passwordInput}
                />
                <span
                  style={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.registerLink}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

// ------------------- Styles -------------------

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    width: "100%",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1585435557343-3b092031a831')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  mainContent: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  loginCard: {
    width: "400px",
    padding: "40px",
    backgroundColor: "#d0e7ff",
    borderRadius: "10px",
    boxShadow: "5px 80px 100px rgba(0,0,0,0.9)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2563eb",
  },
  errorMessage: {
    backgroundColor: "#ffdddd",
    color: "#d8000c",
    border: "1px solid #d8000c",
    borderRadius: "5px",
    padding: "10px",
    marginBottom: "15px",
    textAlign: "center",
    fontSize: "14px",
  },
  fieldGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontWeight: 600,
    fontSize: "14px",
  },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  passwordContainer: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "white",
  },
  passwordInput: {
    flex: 1,
    padding: "12px",
    border: "none",
    outline: "none",
    fontSize: "14px",
  },
  eyeButton: {
    padding: "0 10px",
    cursor: "pointer",
    fontSize: "18px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
  footerText: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
    color: "#333",
  },
  registerLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "bold",
  },
};