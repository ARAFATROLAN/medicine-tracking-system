// src/pages/DoctorDashboard.tsx
import React, { useState, useEffect, useContext } from "react";
import { FaBell } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import AnimatedNumber from "../components/AnimatedNumber";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "create" | "register">("dashboard");
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Calculate stats
  const totalPrescriptions = prescriptions.length;
  const totalPatients = patients.length;
  const lowStockMedicines = medicines.filter(med => med.quantity < 10).length;
  const recentPrescriptions = prescriptions.slice(0, 5);

  // Chart data for prescriptions over time (mock data for now)
  const prescriptionChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Prescriptions",
        data: [12, 19, 15, 25, 22, totalPrescriptions],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
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
          <h1>👨‍⚕️ Doctor Dashboard</h1>
          <p>Welcome Dr. {name}</p>
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
          📊 Dashboard
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "create" ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("create")}
        >
          ➕ Create Prescription
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "register" ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("register")}
        >
          👤 Register Patient
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <>
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>👥 Total Patients</h3>
          <p style={styles.cardValue}><AnimatedNumber value={totalPatients} /></p>
        </div>

        <div style={styles.card}>
          <h3>📋 Total Prescriptions</h3>
          <p style={styles.cardValue}><AnimatedNumber value={totalPrescriptions} /></p>
        </div>

        <div style={styles.card}>
          <h3>💊 Low Stock Medicines</h3>
          <p style={styles.cardValue}><AnimatedNumber value={lowStockMedicines} /></p>
        </div>

        <div style={styles.card}>
          <h3>📅 Recent Activity</h3>
          <p style={styles.cardValue}><AnimatedNumber value={recentPrescriptions.length} /> prescriptions this week</p>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div style={styles.section}>
        <h2>Recent Prescriptions</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Medicines</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPrescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>
                    <strong>#{prescription.patient_id}</strong>
                  </td>
                  <td>{prescription.patient_name}</td>
                  <td>
                    {prescription.medicines?.map((med, idx) => (
                      <span key={idx}>
                        {med.name} ({med.quantity})
                        {idx < prescription.medicines.length - 1 ? ", " : ""}
                      </span>
                    )) || "No medicines"}
                  </td>
                  <td>{new Date(prescription.created_at).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: prescription.status === 'completed' ? '#d4edda' : '#fff3cd',
                      color: prescription.status === 'completed' ? '#155724' : '#856404'
                    }}>
                      {prescription.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Patients */}
      <div style={styles.section}>
        <h2>Recent Patients</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, 5).map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.contact || "N/A"}</td>
                  <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medicine Inventory Alert */}
      <div style={styles.section}>
        <h2>Medicine Inventory Alerts</h2>
        <div style={styles.alertsContainer}>
          {medicines.filter(med => med.quantity < 10).slice(0, 5).map((medicine) => (
            <div key={medicine.id} style={styles.alertCard}>
              <h4>⚠ {medicine.name}</h4>
              <p>Only {medicine.quantity} units remaining</p>
              <small>Expires: {new Date(medicine.expiry_date).toLocaleDateString()}</small>
            </div>
          ))}
          {lowStockMedicines === 0 && (
            <p style={{ textAlign: "center", color: "#666" }}>No low stock alerts at this time.</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div style={styles.section}>
        <h2>Prescription Trends</h2>
        <div style={styles.chartContainer}>
          <Line
            data={prescriptionChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" as const },
                title: { display: true, text: "Monthly Prescription Trends" },
              },
            }}
          />
        </div>
      </div>
        </>
      )}

      {/* Create Prescription Tab */}
      {activeTab === "create" && (
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
      )}

      {/* Register Patient Tab */}
      {activeTab === "register" && (
        <PatientRegistrationForm
          onSuccess={() => {
            // Refresh patients list after registration
            fetchDashboardData(false);
            setTimeout(() => setActiveTab("create"), 2000);
          }}
          onClose={() => setActiveTab("create")}
        />
      )}

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