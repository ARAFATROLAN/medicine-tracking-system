// src/pages/DoctorDashboard.tsx
import React, { useState, useEffect, useContext } from "react";
import { FaBell } from "react-icons/fa";
import AnimatedNumber from "../components/AnimatedNumber";
import ReportsSection from "../components/ReportsSection";
import {
  Chart as ChartJS,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../Services/api";
import { MessagePanelContext } from "../layout/DashboardLayout";
import PrescriptionForm from "../components/PrescriptionForm";
import PatientRegistrationForm from "../components/PatientRegistrationForm";

ChartJS.register(
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

interface Prescription {
  id: number;
  patient_id: number;
  patient_name: string;
  medicines: Array<{ name: string; quantity: number }>;
  created_at: string;
  status: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  contact: string;
  created_at: string;
}

interface Medicine {
  id: number;
  name: string;
  quantity: number;
  expiry_date: string;
}

const DoctorDashboard: React.FC = () => {
  const name = localStorage.getItem("name") || "Doctor";
  const panelContext = useContext(MessagePanelContext);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "create" | "register" | "prescriptions">("dashboard");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAllPrescriptions, setShowAllPrescriptions] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [editingMedicines, setEditingMedicines] = useState<Array<{ name: string; quantity: number }>>([]);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [patientModalQueue, setPatientModalQueue] = useState<Array<{ patient: Patient; prescription: Prescription | null }>>([]);

  // Inject CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(400px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -45%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch function (handles both initial load and refresh)
  const fetchDashboardData = React.useCallback(async (isInitial: boolean = false) => {
    try {
      console.log("DoctorDashboard: Fetching prescriptions, patients, medicines, and notifications...");
      
      const [prescriptionsData, patientsData, medicinesData, notificationsData] = await Promise.all([
        api.fetchPrescriptions(),
        api.fetchPatients(),
        api.fetchMedicines(),
        api.fetchNotifications(1).catch(() => ({ data: [] })),
      ]);
      
      console.log("DoctorDashboard: Received data", {
        prescriptionsData,
        patientsData,
        medicinesData,
        notificationsData,
      });

      // Extract data from responses
      const prescs = prescriptionsData?.data || [];
      const pats = patientsData?.data || [];
      const meds = medicinesData?.data || [];
      const notifs = notificationsData?.data || [];

      setPrescriptions(prescs);
      setPatients(pats);
      setMedicines(meds);
      const unread = notifs.filter((n: any) => !n.read_at).length;
      setUnreadCount(unread);
      setError(null);
      
      // Only set loading to false on initial fetch
      if (isInitial) {
        setLoading(false);
        setIsInitialFetch(false);
      }
    } catch (err: any) {
      console.error("DoctorDashboard: Fetch error", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch data";
      setError(errorMsg);
      
      // Only set loading to false on initial fetch
      if (isInitial) {
        setLoading(false);
        setIsInitialFetch(false);
      }
    } finally {
      // Silent refresh, no state changes needed
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds (after initial fetch completes)
  useEffect(() => {
    if (isInitialFetch) return; // Don't start interval until initial fetch is done
    
    const interval = setInterval(() => {
      fetchDashboardData(false); // false = not initial fetch, so it won't touch loading state
    }, 30000);

    return () => clearInterval(interval);
  }, [isInitialFetch, fetchDashboardData]);

  // Search patients by name or email
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query)
    );

    setSearchResults(results);
  }, [searchQuery, patients]);

  // Handle patient selection from search
  const handleSelectPatient = (patient: Patient) => {
    setSearchQuery(""); // Clear search after selection
    setSearchResults([]);

    // Find the most recent prescription for this patient
    const patientPrescriptions = prescriptions.filter(
      (p) => p.patient_id === patient.id
    );
    const lastPrescription = patientPrescriptions.length > 0 ? patientPrescriptions[0] : null;
    
    // Add to modal queue
    setPatientModalQueue([...patientModalQueue, { patient, prescription: lastPrescription }]);
  };

  // Close patient modal
  const closePatientModal = () => {
    setPatientModalQueue((prev) => prev.slice(1));
  };

  // Calculate stats
  const totalPrescriptions = prescriptions.length;
  const totalPatients = patients.length;
  const displayedPrescriptions = showAllPrescriptions ? prescriptions : prescriptions.slice(0, 5);

  // Handle edit prescription
  const handleEditPrescription = (prescription: Prescription) => {
    if (prescription.status === "approved") {
      return;
    }

    setEditingPrescription(prescription);
    setEditingMedicines(prescription.medicines);
    setEditingPatientId(prescription.patient_id);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingPrescription(null);
    setEditingMedicines([]);
    setEditingPatientId(null);
  };

  // Handle update prescription
  const handleUpdatePrescription = async () => {
    if (!editingPrescription) return;
    
    try {
      await api.updatePrescription(editingPrescription.id, {
        patient_id: editingPatientId,
        medicines: editingMedicines,
      });
      
      // Refresh data
      fetchDashboardData(false);
      handleCancelEdit();
      alert("Prescription updated successfully!");
    } catch (err: any) {
      alert("Failed to update prescription: " + (err?.response?.data?.message || err?.message));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h2>Error loading dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.banner}>
        <div>
          <h1>Doctor Dashboard</h1>
          <p>Welcome Dr. {name}</p>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <input
              type="text"
              placeholder="Search patient by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.18)',
                color: 'white',
                outline: 'none',
                fontSize: '14px',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.12)',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            />
            
            {/* Search Results Dropdown */}
            {searchQuery && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
                background: '#ffffff',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}>
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{patient.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{patient.email}</div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: '#ffffff',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#666',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}>
                No patients found.
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => panelContext?.toggleMessagePanel()}
          style={{
            background: "#dbeafe",
            color: "#0c4a6e",
            border: "none",
            borderRadius: "9999px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            height: "fit-content",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#bfdbfe")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#dbeafe")}
        >
          <FaBell />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="notification-badge" style={{
              background: '#dc2626',
              color: 'white',
              borderRadius: '9999px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "dashboard" ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "prescriptions" ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("prescriptions")}
        >
          Prescriptions
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "create" ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("create")}
        >
          Create Prescription
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "register" ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("register")}
        >
          Register Patient
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div>
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3 style={{ fontWeight: 'bold' }}>Patients</h3>
          <p style={styles.cardValue}><AnimatedNumber value={totalPatients} /></p>
        </div>

        <div style={styles.card}>
          <h3 style={{ fontWeight: 'bold' }}>Prescriptions</h3>
          <p style={styles.cardValue}><AnimatedNumber value={totalPrescriptions} /></p>
        </div>
      </div>
        </div>
      )}

      {/* Create Prescription Tab */}
      {activeTab === "create" && (
        <div style={styles.formContainer}>
          <PrescriptionForm
            patients={patients}
            medicines={medicines}
            onSuccess={() => {
              // Refresh data and switch back to dashboard
              fetchDashboardData(false);
              setTimeout(() => setActiveTab("dashboard"), 2000);
            }}
            onClose={() => setActiveTab("dashboard")}
            onCreatePatient={() => setActiveTab("register")}
          />
        </div>
      )}

      {/* Register Patient Tab */}
      {activeTab === "register" && (
        <div style={styles.formContainer}>
          <PatientRegistrationForm
            onSuccess={() => {
              // Refresh patients list after registration
              fetchDashboardData(false);
              setTimeout(() => setActiveTab("create"), 2000);
            }}
            onClose={() => setActiveTab("create")}
          />
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === "prescriptions" && (
        <div>
          {editingPrescription ? (
            // Edit Mode
              <div style={{ ...styles.section, maxWidth: '920px', margin: '0 auto' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontWeight: "bold" }}>Edit Prescription</h2>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    background: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>Patient</label>
                <select
                  value={editingPatientId || ""}
                  onChange={(e) => setEditingPatientId(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: "12px" }}>Medicines</label>
                {editingMedicines.map((med, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "10px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={med.name}
                      onChange={(e) => {
                        const newMeds = [...editingMedicines];
                        newMeds[idx].name = e.target.value;
                        setEditingMedicines(newMeds);
                      }}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={med.quantity}
                      onChange={(e) => {
                        const newMeds = [...editingMedicines];
                        newMeds[idx].quantity = parseInt(e.target.value) || 0;
                        setEditingMedicines(newMeds);
                      }}
                      style={{
                        width: "100px",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                      }}
                    />
                    <button
                      onClick={() => {
                        const newMeds = editingMedicines.filter((_, i) => i !== idx);
                        setEditingMedicines(newMeds);
                      }}
                      style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setEditingMedicines([...editingMedicines, { name: "", quantity: 1 }]);
                  }}
                  style={{
                    background: "#dbeafe",
                    color: "#0c4a6e",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    marginTop: "10px",
                  }}
                >
                  + Add Medicine
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleUpdatePrescription}
                  style={{
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    background: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Discard
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <>
              <div style={styles.section}>
                <h2 style={{ fontWeight: "bold", marginBottom: "20px" }}>All Prescriptions</h2>
                {prescriptions.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#666" }}>No prescriptions found.</p>
                ) : (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.tableHeader}>ID</th>
                          <th style={styles.tableHeader}>Patient Name</th>
                          <th style={styles.tableHeader}>Medicines</th>
                          <th style={styles.tableHeader}>Date</th>
                          <th style={styles.tableHeader}>Status</th>
                          <th style={styles.tableHeader}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedPrescriptions.map((prescription) => (
                          <tr key={prescription.id} style={styles.tableRow}>
                            <td style={styles.tableCell}>
                              <strong>#{prescription.id}</strong>
                            </td>
                            <td style={styles.tableCell}>{prescription.patient_name}</td>
                            <td style={styles.tableCell}>
                              {prescription.medicines?.map((med, idx) => (
                                <span key={idx}>
                                  {med.name || "Medicine"}: {med.quantity} unit{med.quantity !== 1 ? 's' : ''}
                                  {idx < prescription.medicines.length - 1 ? ", " : ""}
                                </span>
                              )) || "No medicines"}
                            </td>
                            <td style={styles.tableCell}>{new Date(prescription.created_at).toLocaleDateString()}</td>
                            <td style={styles.tableCell}>
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  backgroundColor:
                                    prescription.status === "approved"
                                      ? "#dcfce7"
                                      : prescription.status === "pending"
                                      ? "#fef3c7"
                                      : "#fee2e2",
                                  color:
                                    prescription.status === "approved"
                                      ? "#166534"
                                      : prescription.status === "pending"
                                      ? "#92400e"
                                      : "#991b1b",
                                }}
                              >
                                {prescription.status === "approved"
                                  ? "Approved"
                                  : prescription.status === "pending"
                                  ? "Pending"
                                  : "Rejected"}
                              </span>
                            </td>
                            <td>
                              {prescription.status === "approved" ? (
                                <span style={{ color: "#64748b", fontSize: "12px", fontWeight: 600 }}>
                                  Locked
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleEditPrescription(prescription)}
                                  style={{
                                    background: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                  }}
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {prescriptions.length > 5 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAllPrescriptions((prev) => !prev)}
                      style={{
                        background: showAllPrescriptions ? '#6b7280' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {showAllPrescriptions ? 'Show Less' : 'View More'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Patient Details Modal Popups with Backdrop */}
      {patientModalQueue.length > 0 && (
        <>
          {/* Backdrop */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            animation: 'fadeIn 0.3s ease',
          }} />

          {/* Centered Modal */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            width: '100%',
            maxWidth: '500px',
            padding: '20px',
          }}>
            {patientModalQueue.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  border: '2px solid #3b82f6',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                  animation: 'slideUp 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ fontWeight: 'bold', margin: 0, color: '#0c4a6e', fontSize: '20px' }}>
                    {item.patient.name}
                  </h3>
                  <button
                    onClick={closePatientModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '0',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>
                  <p style={{ margin: '8px 0' }}><strong>Email:</strong> {item.patient.email}</p>
                  <p style={{ margin: '8px 0' }}><strong>Contact:</strong> {item.patient.contact || 'N/A'}</p>
                  <p style={{ margin: '8px 0' }}><strong>Registered:</strong> {new Date(item.patient.created_at).toLocaleDateString()}</p>
                </div>

                <div style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '16px',
                  fontSize: '14px',
                }}>
                  <h4 style={{ fontWeight: 'bold', margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Last Prescription</h4>
                  {item.prescription ? (
                    <div>
                      <p style={{ margin: '6px 0' }}>
                        <strong>ID:</strong> #{item.prescription.id}
                      </p>
                      <p style={{ margin: '6px 0' }}>
                        <strong>Date:</strong> {new Date(item.prescription.created_at).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '6px 0' }}>
                        <strong>Status:</strong> <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          backgroundColor: item.prescription.status === 'approved' ? '#dcfce7' : 
                                           item.prescription.status === 'pending' ? '#fef3c7' :
                                           '#fee2e2',
                          color: item.prescription.status === 'approved' ? '#166534' : 
                                 item.prescription.status === 'pending' ? '#92400e' :
                                 '#991b1b'
                        }}>
                          {item.prescription.status === 'approved' ? 'Approved' : 
                           item.prescription.status === 'pending' ? 'Pending' : 
                           'Rejected'}
                        </span>
                      </p>
                      {item.prescription.medicines && item.prescription.medicines.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <strong style={{ fontSize: '14px' }}>Medicines:</strong>
                          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
                            {item.prescription.medicines.map((med, i) => (
                              <li key={i} style={{ marginBottom: '4px' }}>
                                {med.name || 'Unknown'}: {med.quantity} unit{med.quantity !== 1 ? 's' : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: '#999', fontSize: '14px' }}>No prescriptions found.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reports Section */}
      <ReportsSection userRole="doctor" />
    </div>
  );
};

export default DoctorDashboard;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: 40,
    background: "#f5f7fa",
    minHeight: "100vh",
  },
  banner: {
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "white",
    padding: "30px",
    borderRadius: "15px",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
  },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
    borderBottom: "2px solid #e2e8f0",
    flexWrap: "wrap",
  },
  tabButton: {
    padding: "12px 24px",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px 8px 0 0",
    transition: "all 0.3s",
    fontWeight: "600",
  },
  tabButtonActive: {
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "white",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
  },
  tabButtonInactive: {
    background: "#ffffff",
    color: "#64748b",
    border: "1px solid #e2e8f0",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
    transition: "transform 0.2s",
    color: "#1e293b",
    border: "1px solid #e2e8f0",
  },
  cardValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#2563eb",
    margin: "10px 0",
  },
  section: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    marginBottom: "30px",
    color: "#1e293b",
    border: "1px solid #e2e8f0",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },
  tableHeader: {
    textAlign: "left",
    padding: "14px 12px",
    borderBottom: "2px solid #e2e8f0",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "0.95rem",
  },
  tableCell: {
    padding: "14px 12px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    verticalAlign: "top",
    fontSize: "0.95rem",
  },
  tableRow: {
    transition: "background 0.2s ease",
  },
  formContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e2e8f0",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  alertsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "15px",
  },
  alertCard: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "15px",
    color: "#92400e",
  },
  chartContainer: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "15px",
  },
};