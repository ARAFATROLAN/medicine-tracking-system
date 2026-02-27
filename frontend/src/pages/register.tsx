import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api"; // use configured axios instance

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // use service instance, baseURL is already set to /api/v1
      const res = await api.post("/register", {
        name,
        email,
        password,
      });

      alert(res.data.message || "Account registered successfully!");
      navigate("/"); // go to login page
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert(
        "Registration failed: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div
      style={{
        padding: "60px",
        fontFamily: "Segoe UI, sans-serif",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Register</h1>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "20px", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "20px", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "20px", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;