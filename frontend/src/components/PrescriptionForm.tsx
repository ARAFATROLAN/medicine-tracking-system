import React, { useState } from "react";
import api from "../Services/api";

interface Patient {
  id: number;
  name: string;
  email: string;
}

interface Medicine {
  id: number;
  name: string;
  quantity: number;
}

interface PrescriptionFormProps {
  patients: Patient[];
  medicines: Medicine[];
  onSuccess?: (prescriptionId: number) => void;
  onClose?: () => void;
  onCreatePatient?: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  patients,
  medicines,
  onSuccess,
  onClose,
  onCreatePatient,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<number | "">("");
  const [patientSearchText, setPatientSearchText] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<
    Array<{ id: number; quantity: number; dosage: string }>
  >([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePatientSearch = (searchValue: string) => {
    setPatientSearchText(searchValue);
    setSelectedPatient("");

    if (searchValue.trim().length === 0) {
      setFilteredPatients([]);
      setShowPatientList(false);
      return;
    }

    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredPatients(filtered);
    setShowPatientList(true);
  };

  const handlePatientSelect = (patientId: number, patientName: string) => {
    setSelectedPatient(patientId);
    setPatientSearchText(patientName);
    setShowPatientList(false);
  };

  const handleAddMedicine = () => {
    setSelectedMedicines([
      ...selectedMedicines,
      { id: 0, quantity: 1, dosage: "" },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setSelectedMedicines(
      selectedMedicines.filter((_, i) => i !== index)
    );
  };

  const handleMedicineChange = (
    index: number,
    field: "id" | "quantity" | "dosage",
    value: any
  ) => {
    const updated = [...selectedMedicines];
    if (field === "quantity") {
      updated[index].quantity = parseInt(value) || 1;
    } else if (field === "id") {
      updated[index].id = value;
    } else if (field === "dosage") {
      updated[index].dosage = value;
    }
    setSelectedMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate form
    if (!selectedPatient) {
      setError("Please select a patient");
      return;
    }

    if (selectedMedicines.length === 0) {
      setError("Please add at least one medicine");
      return;
    }

    for (let med of selectedMedicines) {
      if (med.id === 0) {
        setError("Please select medicine for all rows");
        return;
      }
      if (!med.dosage.trim()) {
        setError("Please enter dosage for all medicines");
        return;
      }
      if (med.quantity < 1) {
        setError("Quantity must be at least 1");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        patient_id: selectedPatient,
        medicines: selectedMedicines.map((med) => ({
          id: med.id,
          quantity: med.quantity,
          dosage: med.dosage,
        })),
        notes: notes || null,
      };

      console.log("Sending prescription payload:", JSON.stringify(payload, null, 2));

      const response = await api.createPrescription(payload);

      console.log("Prescription API response:", response);

      if (response.status) {
        setSuccess(true);
        setSelectedPatient("");
        setSelectedMedicines([]);
        setNotes("");

        setTimeout(() => {
          onSuccess?.(response.data.id);
        }, 1500);
      } else {
        setError(response.message || "Failed to create prescription");
      }
    } catch (err: any) {
      console.error("Error creating prescription:", err);
      console.error("Full error response:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      
      // Try to get detailed error message
      let errorMsg = "Failed to create prescription";
      if (err?.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3>📋 Create New Prescription</h3>

      {error && (
        <div style={styles.errorMessage}>
          <span>❌ {error}</span>
        </div>
      )}

      {success && (
        <div style={styles.successMessage}>
          <span>✅ Prescription created successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Patient Selection */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Patient <span style={styles.required}>*</span>
            <span style={styles.registerLink} onClick={onCreatePatient}>
              {onCreatePatient ? " (or register new)" : ""}
            </span>
          </label>
          <div style={styles.searchContainer}>
            <input
              type="text"
              value={patientSearchText}
              onChange={(e) => handlePatientSearch(e.target.value)}
              placeholder="Search patient by name or email..."
              style={styles.searchInput}
              disabled={loading}
              onFocus={() => patientSearchText && setShowPatientList(true)}
            />
            {showPatientList && filteredPatients.length > 0 && (
              <div style={styles.patientDropdown}>
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    style={styles.patientOption}
                    onClick={() => handlePatientSelect(patient.id, patient.name)}
                  >
                    <strong>ID: {patient.id}</strong> - {patient.name}
                    <br />
                    <small>{patient.email}</small>
                  </div>
                ))}
              </div>
            )}
            {showPatientList && filteredPatients.length === 0 && (
              <div style={styles.noResults}>
                <p>No patients found</p>
                {onCreatePatient && (
                  <button
                    type="button"
                    onClick={onCreatePatient}
                    style={styles.createPatientBtn}
                  >
                    + Create New Patient
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Medicines Section */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Medicines <span style={styles.required}>*</span>
          </label>
          <div style={styles.medicinesContainer}>
            {selectedMedicines.length === 0 ? (
              <p style={{ color: "#999" }}>No medicines added yet</p>
            ) : (
              <table style={styles.medicinesTable}>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Dosage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMedicines.map((med, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          value={med.id}
                          onChange={(e) =>
                            handleMedicineChange(index, "id", parseInt(e.target.value))
                          }
                          style={styles.tableSelect}
                          disabled={loading}
                        >
                          <option value={0}>-- Select --</option>
                          {medicines.map((medicine) => (
                            <option key={medicine.id} value={medicine.id}>
                              {medicine.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={med.quantity}
                          onChange={(e) =>
                            handleMedicineChange(index, "quantity", e.target.value)
                          }
                          style={styles.tableInput}
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="e.g., 2 tablets per day"
                          value={med.dosage}
                          onChange={(e) =>
                            handleMedicineChange(index, "dosage", e.target.value)
                          }
                          style={styles.tableInput}
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(index)}
                          style={styles.removeBtn}
                          disabled={loading}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              type="button"
              onClick={handleAddMedicine}
              style={styles.addMedicineBtn}
              disabled={loading}
            >
              + Add Medicine
            </button>
          </div>
        </div>

        {/* Notes */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any additional instructions or notes..."
            style={styles.textarea}
            rows={4}
            disabled={loading}
          />
        </div>

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          <button
            type="submit"
            style={{ ...styles.button, backgroundColor: "#3b82f6" }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Prescription"}
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

export default PrescriptionForm;

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
  registerLink: {
    color: "#3b82f6",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "normal",
    marginLeft: "5px",
  },
  searchContainer: {
    position: "relative",
  },
  searchInput: {
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
  patientDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "white",
    border: "1px solid #d1d5db",
    borderTop: "none",
    borderRadius: "0 0 6px 6px",
    maxHeight: "250px",
    overflowY: "auto" as const,
    zIndex: 10,
  },
  patientOption: {
    padding: "12px",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  noResults: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "white",
    border: "1px solid #d1d5db",
    borderTop: "none",
    borderRadius: "0 0 6px 6px",
    padding: "15px",
    textAlign: "center" as const,
    color: "#666",
  },
  createPatientBtn: {
    marginTop: "10px",
    padding: "8px 15px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontFamily: "Arial, sans-serif",
    color: "#374151",
    backgroundColor: "white",
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
  medicinesContainer: {
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  medicinesTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "15px",
  },
  tableSelect: {
    width: "100%",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.9rem",
  },
  tableInput: {
    width: "100%",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.9rem",
    boxSizing: "border-box",
  },
  removeBtn: {
    padding: "6px 12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
  addMedicineBtn: {
    padding: "10px 15px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
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
