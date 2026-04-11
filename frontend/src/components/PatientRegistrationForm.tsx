import React, { useState } from "react";
import api from "../Services/api";

interface PatientRegistrationFormProps {
  onSuccess?: (patientId: number, patientName: string) => void;
  onClose?: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "",
    health_status: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate form
    if (!formData.name.trim()) {
      setError("Please enter patient name");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter patient email");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Please enter patient phone");
      return;
    }
    if (!formData.address.trim()) {
      setError("Please enter patient address");
      return;
    }
    if (!formData.date_of_birth) {
      setError("Please select date of birth");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await api.createPatient(formData);

      if (response.status) {
        setSuccess(true);
        setGeneratedId(response.data.id);
        setTimeout(() => {
          onSuccess?.(response.data.id, formData.name);
        }, 1500);
      } else {
        setError(response.message || "Failed to register patient");
      }
    } catch (err: any) {
      console.error("Error registering patient:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to register patient"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3>👤 Register New Patient</h3>

      {error && (
        <div style={styles.errorMessage}>
          <span>❌ {error}</span>
        </div>
      )}

      {success && (
        <div style={styles.successMessage}>
          <span>✅ Patient registered successfully! ID: {generatedId}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Full Name <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter patient full name"
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Email <span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter patient email"
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* Phone */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Phone <span style={styles.required}>*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter patient phone number"
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* Address */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Address <span style={styles.required}>*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter patient address"
            style={styles.textarea}
            rows={2}
            disabled={loading}
          />
        </div>

        {/* Date of Birth */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Date of Birth <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* Health Status */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Health Status / Medical History</label>
          <textarea
            name="health_status"
            value={formData.health_status}
            onChange={handleChange}
            placeholder="Enter any relevant health information..."
            style={styles.textarea}
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          <button
            type="submit"
            style={{ ...styles.button, backgroundColor: "#10b981" }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Patient"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, backgroundColor: "#6b7280" }}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationForm;

const styles: { [key: string]: React.CSSProperties } = {
  formContainer: {
    background: "#f9fafb",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "0.95rem",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontFamily: "Arial, sans-serif",
    color: "#374151",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontFamily: "Arial, sans-serif",
    color: "#374151",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  button: {
    flex: 1,
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "opacity 0.2s",
  },
  errorMessage: {
    background: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "15px",
    fontSize: "0.95rem",
  },
  successMessage: {
    background: "#dcfce7",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "15px",
    fontSize: "0.95rem",
  },
};
