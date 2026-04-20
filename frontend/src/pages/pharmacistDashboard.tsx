// src/pages/PharmacistDashboard.tsx
import React, { useState, useEffect, useContext } from "react";
import { FaBell } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import AnimatedNumber from "../components/AnimatedNumber";
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
import { MessagePanelContext } from "../layout/DashboardLayout";
import MedicineRegistrationForm from "../components/MedicineRegistrationForm";

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

const notificationButtonStyle: React.CSSProperties = {
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
};

const PharmacistDashboard: React.FC = () => {
  const name = localStorage.getItem("name") || "Pharmacist";
  const panelContext = useContext(MessagePanelContext);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "register" | "deliveries">("inventory");
  const [approvalStatus, setApprovalStatus] = useState<{ [key: number]: string }>({});
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch function (handles both initial load and refresh)
  const fetchDashboardData = React.useCallback(async (isInitial: boolean = false) => {
    try {
      console.log("PharmacistDashboard: Fetching medicines, deliveries, and notifications...");
      
      const [medicinesData, deliveriesData, notificationsData] = await Promise.all([
        api.fetchMedicines(),
        api.fetchDeliveries(),
        api.fetchNotifications(1).catch(() => ({ data: [] })),
      ]);
      
      console.log("PharmacistDashboard: Received data", {
        medicinesData,
        deliveriesData,
        notificationsData,
      });

      // Extract data from responses
      const meds = medicinesData?.data || [];
      const dels = deliveriesData?.data || [];
      const notifs = notificationsData?.data || [];

      setMedicines(meds);
      setDeliveries(dels);
      const unread = notifs.filter((n: any) => !n.read_at).length;
      setUnreadCount(unread);
      setError(null);
      
      // Only set loading to false on initial fetch
      if (isInitial) {
        setLoading(false);
        setIsInitialFetch(false);
      }
    } catch (err: any) {
      console.error("PharmacistDashboard: Fetch error", err);
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
  const totalMedicines = medicines.length;
  const lowStockMedicines = medicines.filter(med => med.quantity < 50).length;
  const expiringSoonMedicines = medicines.filter(med => {
    const expiryDate = new Date(med.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
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

  // Handler functions
  const handleApproveDelivery = async (deliveryId: number) => {
    setApprovalStatus(prev => ({ ...prev, [deliveryId]: "pending" }));
    try {
      await api.updateDeliveryStatus(deliveryId, "approved");
      await fetchDashboardData(false);
      setApprovalStatus(prev => ({ ...prev, [deliveryId]: "done" }));
    } catch (err) {
      console.error("Error approving delivery:", err);
      const newStatus = { ...approvalStatus };
      delete newStatus[deliveryId];
      setApprovalStatus(newStatus);
      alert("Failed to approve delivery");
    }
  };

  const handleRejectDelivery = async (deliveryId: number) => {
    setApprovalStatus(prev => ({ ...prev, [deliveryId]: "pending" }));
    try {
      await api.updateDeliveryStatus(deliveryId, "rejected");
      await fetchDashboardData(false);
      setApprovalStatus(prev => ({ ...prev, [deliveryId]: "done" }));
    } catch (err) {
      console.error("Error rejecting delivery:", err);
      const newStatus = { ...approvalStatus };
      delete newStatus[deliveryId];
      setApprovalStatus(newStatus);
      alert("Failed to reject delivery");
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
          <h1>💊 Pharmacist Dashboard</h1>
          <p>Welcome {name}</p>
        </div>
        <button
          type="button"
          onClick={() => panelContext?.toggleMessagePanel()}
          style={notificationButtonStyle}
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
            ...(activeTab === "inventory" ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("inventory")}
        >
          📦 View Inventory
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "register" ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("register")}
        >
          ➕ Register Medicine
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "deliveries" ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("deliveries")}
        >
          🚚 Manage Deliveries
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "inventory" && (
        <>
          {/* Stats Cards */}
          <div style={styles.cards}>
        <div style={styles.card}>
          <h3>📦 Total Medicines</h3>
          <p style={styles.cardValue}><AnimatedNumber value={totalMedicines} /></p>
        </div>

        <div style={styles.card}>
          <h3>⚠ Low Stock Alerts</h3>
          <p style={styles.cardValue}><AnimatedNumber value={lowStockMedicines} /></p>
        </div>

        <div style={styles.card}>
          <h3>⏰ Expiring Soon</h3>
          <p style={styles.cardValue}><AnimatedNumber value={expiringSoonMedicines} /></p>
        </div>

        <div style={styles.card}>
          <h3>🚚 Pending Deliveries</h3>
          <p style={styles.cardValue}><AnimatedNumber value={pendingDeliveries} /></p>
        </div>
      </div>

      {/* Medicine Inventory Table */}
      <div style={styles.section}>
        <h2>Medicine Inventory</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Quantity</th>
                <th style={styles.tableHeader}>Expiry Date</th>
                <th style={styles.tableHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {medicines.slice(0, 10).map((medicine, index) => {
                const expiryDate = new Date(medicine.expiry_date);
                const now = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                const isExpired = daysUntilExpiry <= 0;

                let statusColor = "#22c55e";
                let statusText = "Good";

                if (isExpired) {
                  statusColor = "#ef4444";
                  statusText = "Expired";
                } else if (isExpiringSoon) {
                  statusColor = "#f59e0b";
                  statusText = "Expiring Soon";
                }

                return (
                  <tr
                    key={medicine.id}
                    style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  >
                    <td style={styles.tableCell}>{medicine.name}</td>
                    <td style={styles.tableCell}>{medicine.quantity}</td>
                    <td style={styles.tableCell}>{new Date(medicine.expiry_date).toLocaleDateString()}</td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: statusColor,
                          color: "white",
                        }}
                      >
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
          {medicines.filter(med => med.quantity < 50).slice(0, 6).map((medicine) => (
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
        </>
      )}

      {/* Register Medicine Tab */}
      {activeTab === "register" && (
        <div style={styles.section}>
          <h2>Register New Medicine</h2>
          <MedicineRegistrationForm
            onSuccess={(sealNumber) => {
              // Refresh data when medicine is registered successfully
              fetchDashboardData(false);
              alert(`Medicine registered successfully! Seal Number: ${sealNumber}`);
              // Optionally switch back to inventory tab
              setTimeout(() => setActiveTab("inventory"), 2000);
            }}
            onClose={() => setActiveTab("inventory")}
          />
        </div>
      )}

      {/* Manage Deliveries Tab */}
      {activeTab === "deliveries" && (
        <>
          {/* Deliveries Stats */}
          <div style={styles.cards}>
            <div style={styles.card}>
              <h3>📋 Total Deliveries</h3>
              <p style={styles.cardValue}>{deliveries.length}</p>
            </div>
            <div style={styles.card}>
              <h3>⏳ Pending</h3>
              <p style={styles.cardValue}>{deliveries.filter(d => d.status === 'pending').length}</p>
            </div>
            <div style={styles.card}>
              <h3>✅ Approved</h3>
              <p style={styles.cardValue}>{deliveries.filter(d => d.status === 'approved').length}</p>
            </div>
            <div style={styles.card}>
              <h3>❌ Rejected</h3>
              <p style={styles.cardValue}>{deliveries.filter(d => d.status === 'rejected').length}</p>
            </div>
          </div>

          {/* All Deliveries Table with Actions */}
          <div style={styles.section}>
            <h2>All Deliveries</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Delivery Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td>#{delivery.id}</td>
                      <td>{(delivery as any).Delivered_By || "N/A"}</td>
                      <td>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: delivery.status === "pending" ? "#f59e0b" : 
                                           delivery.status === "approved" ? "#22c55e" : 
                                           "#ef4444",
                          color: "white"
                        }}>
                          {delivery.status}
                        </span>
                      </td>
                      <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
                      <td>{delivery.notes || "—"}</td>
                      <td>
                        {delivery.status === "pending" && (
                          <div style={styles.actionButtons}>
                            <button
                              style={{ ...styles.actionBtn, backgroundColor: "#22c55e" }}
                              onClick={() => handleApproveDelivery(delivery.id)}
                              disabled={approvalStatus[delivery.id] === "pending"}
                            >
                              {approvalStatus[delivery.id] === "pending" ? "..." : "Approve"}
                            </button>
                            <button
                              style={{ ...styles.actionBtn, backgroundColor: "#ef4444" }}
                              onClick={() => handleRejectDelivery(delivery.id)}
                              disabled={approvalStatus[delivery.id] === "pending"}
                            >
                              {approvalStatus[delivery.id] === "pending" ? "..." : "Reject"}
                            </button>
                          </div>
                        )}
                        {delivery.status !== "pending" && (
                          <span style={{ color: "#666" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deliveries.length === 0 && (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>No deliveries.</p>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default PharmacistDashboard;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: 40,
    background: "#f5f7fa",
    minHeight: "100vh",
  },
  banner: {
    background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    color: "white",
    padding: "30px",
    borderRadius: "15px",
    marginBottom: "30px",    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
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
    background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    color: "white",
    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.2)",
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
    color: "#8b5cf6",
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
    borderCollapse: "separate",
    borderSpacing: 0,
    marginTop: "15px",
    minWidth: "650px",
  },
  tableHeader: {
    padding: "14px 16px",
    textAlign: "left",
    backgroundColor: "#8b5cf6",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 700,
    borderBottom: "2px solid #7c3aed",
  },
  tableCell: {
    padding: "14px 16px",
    borderBottom: "1px solid #e5e7eb",
    color: "#334155",
    verticalAlign: "middle",
  },
  tableRow: {
    backgroundColor: "#ffffff",
    transition: "background-color 0.2s ease",
  },
  tableRowAlt: {
    backgroundColor: "#f8f9fb",
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
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  actionBtn: {
    padding: "6px 12px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "bold",
    transition: "opacity 0.2s",
  },
};