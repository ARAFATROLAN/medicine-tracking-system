// src/pages/DoctorDashboard.tsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
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
import { useAutoRefresh } from "../hooks/useAutoRefresh";

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
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  // Auto-refresh data every 30 seconds
  const { data: dashboardData, loading: refreshing } = useAutoRefresh(
    async () => {
      try {
        const [prescriptionsData, patientsData, medicinesData] = await Promise.all([
          api.fetchPrescriptions(),
          api.fetchPatients(),
          api.fetchMedicines(),
        ]);
        return {
          prescriptions: prescriptionsData.data || [],
          patients: patientsData.data || [],
          medicines: medicinesData.data || [],
        };
      } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to fetch data");
      }
    },
    { interval: 30000 } // 30 seconds
  );

  useEffect(() => {
    if (dashboardData) {
      setPrescriptions(dashboardData.prescriptions);
      setPatients(dashboardData.patients);
      setMedicines(dashboardData.medicines);
      setLoading(false);
    }
  }, [dashboardData]);

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
        <h1>👨‍⚕️ Doctor Dashboard</h1>
        <p>Welcome Dr. {name}</p>
        {refreshing && <small style={{ color: "#666", marginLeft: "10px" }}>Refreshing...</small>}
      </div>

      {/* Stats Cards */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>👥 Total Patients</h3>
          <p style={styles.cardValue}>{totalPatients}</p>
        </div>

        <div style={styles.card}>
          <h3>📋 Total Prescriptions</h3>
          <p style={styles.cardValue}>{totalPrescriptions}</p>
        </div>

        <div style={styles.card}>
          <h3>💊 Low Stock Medicines</h3>
          <p style={styles.cardValue}>{lowStockMedicines}</p>
        </div>

        <div style={styles.card}>
          <h3>📅 Recent Activity</h3>
          <p style={styles.cardValue}>{recentPrescriptions.length} prescriptions this week</p>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div style={styles.section}>
        <h2>Recent Prescriptions</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Medicines</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPrescriptions.map((prescription) => (
                <tr key={prescription.id}>
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
    </div>
  );
};

export default DoctorDashboard;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: 40,
    background: "linear-gradient(135deg, #f0f4f8, #d0e7ff)",
    minHeight: "100vh",
  },
  banner: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "30px",
    borderRadius: "15px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    textAlign: "center",
    transition: "transform 0.2s",
  },
  cardValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#2563eb",
    margin: "10px 0",
  },
  section: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    marginBottom: "30px",
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
    background: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "8px",
    padding: "15px",
    color: "#856404",
  },
  chartContainer: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "15px",
  },
};