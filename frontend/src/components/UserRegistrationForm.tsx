import React, { useState } from "react";
import api from "../Services/api";

interface UserRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [specialisation, setSpecialisation] = useState("Doctor");
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registering, setRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError("");

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
      setRegisterError("Password must be alphanumeric and at least 6 characters");
      return;
    }

    setRegistering(true);
    try {
      await api.registerUser(name, email, password, contact, specialisation);

      setName("");
      setEmail("");
      setPassword("");
      setContact("");
      setSpecialisation("Doctor");
      setShowPassword(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors)
          .flat()
          .join(" | ");
        setRegisterError(errors);
      } else {
        setRegisterError(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div style={styles.mainContent}>
      <div style={styles.registerCard}>
        <h2 style={styles.title}>Register New User</h2>

        {registerError && (
          <div style={styles.errorMessage}>{registerError}</div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
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
              placeholder="Enter email"
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
            <label style={styles.label}>Role</label>
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

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={registering}
            >
              {registering ? "Registering..." : "Register User"}
            </button>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={onCancel}
              disabled={registering}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  mainContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  registerCard: {
    width: "400px",
    padding: "40px",
    backgroundColor: "#d0e7ff",
    borderRadius: "10px",
    boxShadow: "5px 80px 100px rgba(0,0,0,0.3)",
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

  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },

  submitButton: {
    flex: 1,
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

  cancelButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
};

export default UserRegistrationForm;
