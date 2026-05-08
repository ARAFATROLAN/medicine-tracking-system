import React, { useState } from "react";
import api from "../Services/api";
import "./UserRegistrationForm.css";

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
    <div className="mainContent">
      <div className="registerCard">
        <h2 className="title">Register New User</h2>

        {registerError && (
          <div className="errorMessage">{registerError}</div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="fieldGroup">
            <label className="label">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              autoComplete="off"
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="fieldGroup">
            <label className="label">Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="fieldGroup">
            <label className="label">Contact</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={contact}
              autoComplete="off"
              onChange={(e) => setContact(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="fieldGroup">
            <label htmlFor="role" className="label">Role</label>
            <select
              id="role"
              value={specialisation}
              onChange={(e) => setSpecialisation(e.target.value)}
              className="select"
              title="Select your role"
            >
              <option value="Doctor">Doctor</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="fieldGroup">
            <label className="label">Password</label>
            <div className="passwordContainer">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                required
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$"
                title="Password must be alphanumeric and at least 6 characters"
                className="passwordInput"
              />
              <span
                className="eyeButton"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
            <small className="passwordHint">
              Password must be alphanumeric
            </small>
          </div>

          <div className="buttonGroup">
            <button
              type="submit"
              className="submitButton"
              disabled={registering}
            >
              {registering ? "Registering..." : "Register User"}
            </button>
            <button
              type="button"
              className="cancelButton"
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

export default UserRegistrationForm;
