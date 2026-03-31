// src/pages/PharmacistDashboard.tsx
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../Services/api";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Medicine {
  id: number;
  name: string;
  quantity: number;
  expiry_date: string;
  price?: number;
  description?: string;
}

interface Delivery {
  id: number;
  status: string;
  delivery_date: string;
  notes?: string;
}

const PharmacistDashboard: React.FC = () => {
  const name = localStorage.getItem("name") || "Pharmacist";
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  // Auto-refresh data every 30 seconds
  const { data: dashboardData, loading: refreshing } = useAutoRefresh(
    async () => {
      try {
        const [medicinesData, deliveriesData] = await Promise.all([
          api.fetchMedicines(),
          api.fetchDeliveries(),
        ]);
        return {
          medicines: medicinesData.data || [],
          deliveries: deliveriesData.data || [],
        };
      } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to fetch data");
      }
    },
    { interval: 30000 } // 30 seconds
  );

  useEffect(() => {
    if (dashboardData) {
      setMedicines(dashboardData.medicines);
      setDeliveries(dashboardData.deliveries);
      setLoading(false);
    }
  }, [dashboardData]);

  // Calculate stats
  const totalMedicines = medicines.length;
  const lowStockMedicines = medicines.filter(med => med.quantity < 10).length;
  const expiringSoonMedicines = medicines.filter(med => {
    const expiryDate = new Date(med.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;
  const pendingDeliveries = deliveries.filter(del => del.status === 'pending').length;

  // Chart data
  const stockChartData = {
    labels: medicines.slice(0, 10).map(med => med.name.length > 15 ? med.name.substring(0, 15) + '...' : med.name),
    datasets: [
      {
        label: "Stock Quantity",
        data: medicines.slice(0, 10).map(med => med.quantity),
        backgroundColor: medicines.slice(0, 10).map((_, index) =>
          index < 3 ? "rgba(34, 197, 94, 0.7)" : "rgba(37, 99, 235, 0.7)"
        ),
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
        <h1>💊 Pharmacist Dashboard</h1>
        <p>Welcome {name}</p>
        {refreshing && <small style={{ color: "#666", marginLeft: "10px" }}>Refreshing...</small>}
      </div>

      {/* Stats Cards */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>📦 Total Medicines</h3>
          <p style={styles.cardValue}>{totalMedicines}</p>
        </div>

        <div style={styles.card}>
          <h3>⚠ Low Stock Alerts</h3>
          <p style={styles.cardValue}>{lowStockMedicines}</p>
        </div>

        <div style={styles.card}>
          <h3>⏰ Expiring Soon</h3>
          <p style={styles.cardValue}>{expiringSoonMedicines}</p>
        </div>

        <div style={styles.card}>
          <h3>🚚 Pending Deliveries</h3>
          <p style={styles.cardValue}>{pendingDeliveries}</p>
        </div>
      </div>

      {/* Medicine Inventory Table */}
      <div style={styles.section}>
        <h2>Medicine Inventory</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {medicines.slice(0, 10).map((medicine) => {
                const expiryDate = new Date(medicine.expiry_date);
                const now = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isLowStock = medicine.quantity < 10;
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                const isExpired = daysUntilExpiry <= 0;

                let statusColor = "#22c55e"; // green
                let statusText = "Good";

                if (isExpired) {
                  statusColor = "#ef4444"; // red
                  statusText = "Expired";
                } else if (isExpiringSoon) {
                  statusColor = "#f59e0b"; // yellow
                  statusText = "Expiring Soon";
                } else if (isLowStock) {
                  statusColor = "#f59e0b"; // yellow
                  statusText = "Low Stock";
                }

                return (
                  <tr key={medicine.id}>
                    <td>{medicine.name}</td>
                    <td>{medicine.quantity}</td>
                    <td>{new Date(medicine.expiry_date).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusColor,
                        color: "white"
                      }}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div style={styles.section}>
        <h2>Low Stock Alerts</h2>
        <div style={styles.alertsContainer}>
          {medicines.filter(med => med.quantity < 10).slice(0, 6).map((medicine) => (
            <div key={medicine.id} style={styles.alertCard}>
              <h4>⚠ {medicine.name}</h4>
              <p>Only {medicine.quantity} units remaining</p>
              <small>Reorder recommended</small>
            </div>
          ))}
          {lowStockMedicines === 0 && (
            <p style={{ textAlign: "center", color: "#666", width: "100%" }}>No low stock alerts at this time.</p>
          )}
        </div>
      </div>

      {/* Pending Deliveries */}
      <div style={styles.section}>
        <h2>Pending Deliveries</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Delivery Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.filter(del => del.status === 'pending').slice(0, 5).map((delivery) => (
                <tr key={delivery.id}>
                  <td>#{delivery.id}</td>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: "#f59e0b",
                      color: "white"
                    }}>
                      {delivery.status}
                    </span>
                  </td>
                  <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
                  <td>{delivery.notes || "No notes"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingDeliveries === 0 && (
            <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>No pending deliveries.</p>
          )}
        </div>
      </div>

      {/* Stock Chart */}
      <div style={styles.section}>
        <h2>Stock Levels Overview</h2>
        <div style={styles.chartContainer}>
          <Bar
            data={stockChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" as const },
                title: { display: true, text: "Top 10 Medicines Stock Levels" },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Quantity"
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: 40,
    background: "linear-gradient(135deg, #f0f4f8, #d0e7ff)",
    minHeight: "100vh",
  },
  banner: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
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
    color: "#f5576c",
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