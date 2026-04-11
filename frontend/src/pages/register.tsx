// src/pages/Register.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [specialisation, setSpecialisation] = useState("Doctor");
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registering, setRegistering] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
      setRegisterError("Password must be alphanumeric and at least 6 characters");
      return;
    }

    console.log({
      name,
      email,
      password,
      contact,
      specialisation
    });

    setRegistering(true);
    try {

      // FIX: send parameters correctly
      const response = await api.registerUser(name, email, password, contact, specialisation);

      setRegisterError("");
      
      // Store auth data
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("role", response.user.specialisation);
      localStorage.setItem("roles", JSON.stringify(response.user.roles || []));
      localStorage.setItem("name", response.user.name);

      setName("");
      setEmail("");
      setPassword("");
      setContact("");
      setSpecialisation("Doctor");
      setShowPassword(false);

      navigate("/");

    } catch (err: any) {

      console.log("FULL ERROR:", err.response);

      if (err.response?.data?.errors) {

        const errors = Object.values(err.response.data.errors)
          .flat()
          .join(" | ");

        setRegisterError(errors);

      } else {

        setRegisterError(
          err.response?.data?.message || "Registration failed"
        );

      }

    } finally {
      setRegistering(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.mainContent}>
        <div style={styles.registerCard}>
          <h2 style={styles.title}>Create an Account</h2>

          {registerError && (
            <div style={styles.errorMessage}>{registerError}</div>
          )}

          <form onSubmit={handleRegister} autoComplete="off">

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                autoComplete="off"
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Contact</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={contact}
                autoComplete="off"
                onChange={(e) => setContact(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Specialisation</label>
              <select
                value={specialisation}
                onChange={(e) => setSpecialisation(e.target.value)}
                style={styles.select}
              >
                <option value="Doctor">Doctor</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>

              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$"
                  title="Password must be alphanumeric and at least 6 characters"
                  style={styles.passwordInput}
                />

                <span
                  style={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>

              <small style={styles.passwordHint}>
                Password must be alphanumeric
              </small>
            </div>

            <button 
              type="submit" 
              style={styles.button}
              disabled={registering}
            >
              {registering ? "Registering..." : "Register"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

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

  registerCard: {
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

  select: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    backgroundColor: "white",
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

  passwordHint: {
    color: "#555",
    fontSize: "12px",
    marginTop: "4px",
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
};