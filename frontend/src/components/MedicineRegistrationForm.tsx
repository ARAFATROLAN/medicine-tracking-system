import React, { useState } from "react";
import api from "../Services/api";

interface MedicineRegistrationFormProps {
  onSuccess?: (medicineData: any) => void;
  onClose?: () => void;
}

const MedicineRegistrationForm: React.FC<MedicineRegistrationFormProps> = ({
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    batch_number: "",
    category: "",
    expiry_date: "",
    quantity: "",
    brand: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = [
    "Antibiotic",
    "Analgesic",
    "Antipyretic",
    "Anti-inflammatory",
    "Antacid",
    "Vitamin",
    "Supplement",
    "Other",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
    setSuccess(null);
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.batch_number ||
        !formData.category ||
        !formData.expiry_date ||
        !formData.quantity
      ) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const response = await api.registerMedicine({
        name: formData.name,
        batch_number: formData.batch_number,
        category: formData.category,
        expiry_date: formData.expiry_date,
        quantity: parseInt(formData.quantity),
        brand: formData.brand,
        description: formData.description,
      });

      if (response.status) {
        setSuccess(
          `Medicine registered successfully! Seal #: ${response.data.seal_number}`
        );
        setFormData({
          name: "",
          batch_number: "",
          category: "",
          expiry_date: "",
          quantity: "",
          brand: "",
          description: "",
        });

        if (onSuccess) {
          onSuccess(response.data);
        }

        // Reset form after 2 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Failed to register medicine");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "24px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "24px",
      color: "#333",
    },
    formGroup: {
      marginBottom: "16px",
      display: "flex",
      flexDirection: "column" as const,
    },
    label: {
      fontWeight: "600",
      marginBottom: "6px",
      color: "#555",
      fontSize: "14px",
    },
    required: {
      color: "#e74c3c",
    },
    input: {
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
      fontFamily: "inherit",
      transition: "border-color 0.3s",
    },
    select: {
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
      fontFamily: "inherit",
      backgroundColor: "#fff",
    },
    textarea: {
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
      fontFamily: "inherit",
      minHeight: "80px",
      resize: "vertical" as const,
    },
    note: {
      marginTop: "8px",
      color: "#475569",
      fontSize: "13px",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },
    errorMessage: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "12px",
      borderRadius: "4px",
      marginBottom: "16px",
      fontSize: "14px",
      border: "1px solid #f5c6cb",
    },
    successMessage: {
      backgroundColor: "#d4edda",
      color: "#155724",
      padding: "12px",
      borderRadius: "4px",
      marginBottom: "16px",
      fontSize: "14px",
      border: "1px solid #c3e6cb",
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
      marginTop: "24px",
      justifyContent: "flex-end",
    },
    button: {
      padding: "10px 20px",
      borderRadius: "4px",
      border: "none",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s",
    },
    submitButton: {
      backgroundColor: "#2ecc71",
      color: "#fff",
    },
    cancelButton: {
      backgroundColor: "#95a5a6",
      color: "#fff",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register Medicine</h2>

      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Medicine Name and Batch Number Row */}
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Medicine Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Paracetamol"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Batch Number <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="batch_number"
              value={formData.batch_number}
              onChange={handleChange}
              placeholder="e.g., BATCH-2024-00123"
              style={styles.input}
              required
            />
          </div>
        </div>

        {/* Category and Brand Row */}
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Category <span style={styles.required}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Panadol"
              style={styles.input}
            />
          </div>
        </div>

        {/* Expiry Date and Quantity Row */}
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Expiry Date <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Quantity <span style={styles.required}>*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 100"
              min="1"
              style={styles.input}
              required
            />
            <small style={styles.note}>
              Quantities under 50 can still be registered; they will be flagged as low stock.
            </small>
          </div>
        </div>

        {/* Description */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter medicine description..."
            style={styles.textarea}
          />
        </div>

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, ...styles.cancelButton }}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            style={{ ...styles.button, ...styles.submitButton }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Medicine"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicineRegistrationForm;
