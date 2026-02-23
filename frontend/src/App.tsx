import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    alert("Test login clicked");
  };

  const handleRegister = () => {
    alert("Redirect to Doctor Registration Page");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        backgroundColor: "#f0f4f8",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "#ffffff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          width: "360px",
          maxWidth: "90%",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "15px", color: "#2563eb" }}>
          Medicine Tracking System
        </h1>
        <p style={{ marginBottom: "20px", color: "#555", fontSize: "14px" }}>
          Please login to your account
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
          required
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            marginBottom: "15px",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#1e40af")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563eb")
          }
        >
          Login
        </button>

        <button
          type="button"
          onClick={handleRegister}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            marginBottom: "10px",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#059669")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#10b981")
          }
        >
          EMAXON ROLAN BILLS
        </button>

        <p style={{ marginTop: "15px", fontSize: "12px", color: "#888" }}>
          © 2026 Medicine Tracking System
        </p>
      </form>
    </div>
  );
}

export default App;