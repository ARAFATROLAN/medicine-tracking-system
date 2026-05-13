// src/pages/PharmacistDashboard.tsx
import React, { useState, useEffect, useContext } from "react";
import { FaBell } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import AnimatedNumber from "../components/AnimatedNumber";
import ReportsSection from "../components/ReportsSection";
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
import { NotificationContext } from "../context/NotificationContext";
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

interface Prescription {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  medicines: Array<{ name: string; quantity: number; dosage: string }>;
  status: string;
  notes?: string;
  created_at: string;
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
  const notification = useContext(NotificationContext);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "register" | "deliveries" | "prescriptions">("inventory");
  const [approvalStatus, setApprovalStatus] = useState<{ [key: number]: string }>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [showMoreLowStock, setShowMoreLowStock] = useState(false);
  const [showAllPrescriptions, setShowAllPrescriptions] = useState(false);
  const [showApprovedPrescriptions, setShowApprovedPrescriptions] = useState(false);
  const [showStockChart, setShowStockChart] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [prescriptionPopup, setPrescriptionPopup] = useState<{
    notificationId: number;
    prescriptionId: number;
    message: string;
  } | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);

  // Fetch function (handles both initial load and refresh)
  const fetchDashboardData = React.useCallback(async (isInitial: boolean = false) => {
    try {
      console.log("PharmacistDashboard: Fetching medicines, deliveries, and notifications...");
      
      const [medicinesData, deliveriesData, prescriptionsData, notificationsData] = await Promise.all([
        api.fetchMedicines(),
        api.fetchDeliveries(),
        api.fetchPrescriptions().catch(() => ({ data: [] })),
        api.fetchNotifications(1).catch(() => ({ data: [] })),
      ]);
      
      console.log("PharmacistDashboard: Received data", {
        medicinesData,
        deliveriesData,
        prescriptionsData,
        notificationsData,
      });

      // Extract data from responses
      const meds = medicinesData?.data || [];
      const dels = deliveriesData?.data || [];
      const prescs = prescriptionsData?.data || [];
      const notifs = notificationsData?.data || [];

      setMedicines(meds);
      setDeliveries(dels);
      setPrescriptions(prescs);
      const unread = notifs.filter((n: any) => !n.read_at).length;
      setUnreadCount(unread);

      const pendingPrescriptionNotification = notifs.find(
        (n: any) => n.type === "prescription" && !n.read_at && n.reference_id
      );
      if (pendingPrescriptionNotification) {
        setPrescriptionPopup({
          notificationId: pendingPrescriptionNotification.id,
          prescriptionId: pendingPrescriptionNotification.reference_id,
          message: pendingPrescriptionNotification.message ||
            "A new prescription requires your approval.",
        });
      } else {
        setPrescriptionPopup(null);
      }

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
  const lowStockItems = medicines.filter(med => med.quantity < 50);
  const lowStockMedicines = lowStockItems.length;
  const expiringSoonMedicines = medicines.filter(med => {
    const expiryDate = new Date(med.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }).length;
  const pendingDeliveries = deliveries.filter(del => del.status === 'pending').length;

  // Chart data
  const inventoryDisplay = showAllInventory ? medicines : medicines.slice(0, 10);
  const stockSearchResults = stockSearch.trim()
    ? medicines.filter(med => med.name.toLowerCase().includes(stockSearch.trim().toLowerCase()))
    : [];

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
      notification?.notify({ type: "error", message: "Failed to approve delivery" });
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
      notification?.notify({ type: "error", message: "Failed to reject delivery" });
    }
  };

  const handleApprovePrescription = async (prescriptionId: number) => {
    setApprovalStatus(prev => ({ ...prev, [prescriptionId]: "pending" }));
    try {
      await api.approvePrescription(prescriptionId);
      notification?.notify({ type: "success", message: "Prescription approved successfully" });
      await fetchDashboardData(false);
      setApprovalStatus(prev => ({ ...prev, [prescriptionId]: "done" }));
    } catch (err) {
      console.error("Error approving prescription:", err);
      const newStatus = { ...approvalStatus };
      delete newStatus[prescriptionId];
      setApprovalStatus(newStatus);
      notification?.notify({ type: "error", message: "Failed to approve prescription" });
    }
  };

  const handleApprovePrescriptionPopup = async () => {
    if (!prescriptionPopup) return;
    setPopupLoading(true);

    try {
      await api.approvePrescription(prescriptionPopup.prescriptionId);
      if (prescriptionPopup.notificationId) {
        await api.markNotificationRead(prescriptionPopup.notificationId);
      }
      notification?.notify({ type: "success", message: "Prescription approved successfully" });
      await fetchDashboardData(false);
      setPrescriptionPopup(null);
    } catch (err) {
      console.error("Error approving prescription from popup:", err);
      notification?.notify({ type: "error", message: "Failed to approve prescription" });
    } finally {
      setPopupLoading(false);
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
      {prescriptionPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Prescription Approval needed</h2>
                <p style={{ margin: "12px 0 0", color: "#334155" }}>{prescriptionPopup.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setPrescriptionPopup(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                }}
                aria-label="Close approval popup"
              >
                
              </button>
            </div>
            <div style={styles.popupActions}>
              <button
                type="button"
                onClick={handleApprovePrescriptionPopup}
                disabled={popupLoading}
                style={styles.popupApproveBtn}
              >
                {popupLoading ? "Approving..." : "Approve Prescription"}
              </button>
              <button
                type="button"
                onClick={() => setPrescriptionPopup(null)}
                style={styles.popupCancelBtn}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={styles.banner}>
        <div>
          <h1>Pharmacist Dashboard</h1>
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
            ...((hoveredTab === "inventory" && activeTab !== "inventory") ? styles.tabButtonHover : {}),
          }}
          onClick={() => setActiveTab("inventory")}
          onMouseEnter={() => setHoveredTab("inventory")}
          onMouseLeave={() => setHoveredTab(null)}
        >
          Inventory
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "register" ? styles.tabButtonActive : styles.tabButtonInactive),
            ...((hoveredTab === "register" && activeTab !== "register") ? styles.tabButtonHover : {}),
          }}
          onClick={() => setActiveTab("register")}
          onMouseEnter={() => setHoveredTab("register")}
          onMouseLeave={() => setHoveredTab(null)}
        >
          Register Medicine
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "deliveries" ? styles.tabButtonActive : styles.tabButtonInactive),
            ...((hoveredTab === "deliveries" && activeTab !== "deliveries") ? styles.tabButtonHover : {}),
          }}
          onClick={() => setActiveTab("deliveries")}
          onMouseEnter={() => setHoveredTab("deliveries")}
          onMouseLeave={() => setHoveredTab(null)}
        >
          Manage Deliveries
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "prescriptions" ? styles.tabButtonActive : styles.tabButtonInactive),
            ...((hoveredTab === "prescriptions" && activeTab !== "prescriptions") ? styles.tabButtonHover : {}),
          }}
          onClick={() => setActiveTab("prescriptions")}
          onMouseEnter={() => setHoveredTab("prescriptions")}
          onMouseLeave={() => setHoveredTab(null)}
        >
          Pending Prescriptions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "inventory" && (
        <>
          {/* Stats Cards */}
          <div style={styles.cards}>
        <div style={styles.card}>
          <h3 style={{ fontWeight: 'bold' }}>Total Medicines</h3>
          <p style={styles.cardValue}><AnimatedNumber value={totalMedicines} /></p>
        </div>

        <div style={styles.card}>
          <h3 style={{ fontWeight: 'bold' }}>Low Stock Alerts</h3>
          <p style={styles.cardValue}><AnimatedNumber value={lowStockMedicines} /></p>
        </div>

        <div style={styles.card}>
          <h3 style={{ fontWeight: 'bold' }}>Expiring Soon</h3>
          <p style={styles.cardValue}><AnimatedNumber value={expiringSoonMedicines} /></p>
        </div>

        <div style={styles.card}>
          <h3 style={{ fontWeight: 'bold' }}>Pending Deliveries</h3>
          <p style={styles.cardValue}><AnimatedNumber value={pendingDeliveries} /></p>
        </div>
      </div>

      {/* Medicine Inventory Table */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontWeight: 'bold', margin: 0 }}>Medicine Inventory</h2>
          {medicines.length > 10 && (
            <button
              type="button"
              onClick={() => setShowAllInventory((prev) => !prev)}
              style={{
                padding: '8px 14px',
                borderRadius: '9999px',
                border: '1px solid #3b82f6',
                background: showAllInventory ? '#eff6ff' : '#3b82f6',
                color: showAllInventory ? '#1d4ed8' : '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {showAllInventory ? 'Show Less' : 'View More'}
            </button>
          )}
        </div>
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
              {inventoryDisplay.map((medicine, index) => {
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
        <h2 style={{ fontWeight: 'bold' }}>Low Stock Alerts</h2>
        <div style={styles.alertsContainer}>
          {(showMoreLowStock ? lowStockItems : lowStockItems.slice(0, 6)).map((medicine) => (
            <div key={medicine.id} style={styles.alertCard}>
              <h4 style={{ fontWeight: 'bold' }}>⚠ {medicine.name}</h4>
              <p>Only {medicine.quantity} units remaining</p>
              <small>Reorder recommended</small>
            </div>
          ))}
          {lowStockMedicines === 0 && (
            <p style={{ textAlign: "center", color: "#666", width: "100%" }}>No low stock alerts at this time.</p>
          )}
        </div>
        {lowStockMedicines > 6 && (
          <div style={{ marginTop: '18px', textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => setShowMoreLowStock(prev => !prev)}
              style={{
                ...styles.actionBtn,
                backgroundColor: showMoreLowStock ? '#6b7280' : '#3b82f6',
                padding: '10px 18px',
              }}
            >
              {showMoreLowStock ? 'Show Less' : 'View More'}
            </button>
          </div>
        )}
      </div>

      {/* Pending Deliveries */}
      <div style={styles.section}>
        <h2 style={{ fontWeight: 'bold' }}>Pending Deliveries</h2>
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
        {pendingDeliveries > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('deliveries')}
              style={{
                padding: '8px 14px',
                borderRadius: '9999px',
                border: '1px solid #3b82f6',
                background: '#3b82f6',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              View More
            </button>
          </div>
        )}
      </div>

      {/* Stock Chart */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ fontWeight: 'bold', margin: 0 }}>Stock Levels Overview</h2>
          <button
            style={{
              ...styles.actionBtn,
              backgroundColor: showStockChart ? '#6b7280' : '#8b5cf6',
              padding: '10px 18px',
            }}
            onClick={() => setShowStockChart(prev => !prev)}
          >
            {showStockChart ? 'Hide Chart' : 'View Chart'}
          </button>
        </div>
        <div style={styles.stockSearchRow}>
          <input
            type="text"
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            placeholder="Search medicine by name..."
            style={styles.stockSearchInput}
          />
          {stockSearch.trim().length > 0 && (
            <div style={styles.stockSearchInfo}>
              {stockSearchResults.length > 0 ? (
                <>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    Stock level for "{stockSearchResults[0].name}": {stockSearchResults[0].quantity} units
                  </p>
                  {stockSearchResults.length > 1 && (
                    <p style={{ margin: '8px 0 0', color: '#64748b' }}>
                      See {stockSearchResults.length} matches below.
                    </p>
                  )}
                </>
              ) : (
                <p style={{ margin: 0, color: '#64748b' }}>
                  No medicine found for "{stockSearch}".
                </p>
              )}
            </div>
          )}
        </div>
        {stockSearch.trim().length > 0 && stockSearchResults.length > 1 && (
          <div style={styles.stockSearchResultList}>
            {stockSearchResults.slice(0, 5).map((medicine) => (
              <div key={medicine.id} style={styles.stockSearchResultItem}>
                <span>{medicine.name}</span>
                <span style={{ fontWeight: 700 }}>{medicine.quantity} units</span>
              </div>
            ))}
          </div>
        )}
        {showStockChart && (
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
        )}
      </div>
        </>
      )}

      {/* Register Medicine Tab */}
      {activeTab === "register" && (
        <div style={styles.section}>
          <h2 style={{ fontWeight: 'bold' }}>Register New Medicine</h2>
          <MedicineRegistrationForm
            onSuccess={(sealNumber) => {
              // Refresh data when medicine is registered successfully
              fetchDashboardData(false);
              notification?.notify({
                type: "success",
                message: `Medicine registered successfully! Seal Number: ${sealNumber}`,
              });
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
              <h3>Total Deliveries</h3>
              <p style={styles.cardValue}>{deliveries.length}</p>
            </div>
            <div style={styles.card}>
              <h3>Pending</h3>
              <p style={styles.cardValue}>{deliveries.filter(d => d.status === 'pending').length}</p>
            </div>
            <div style={styles.card}>
              <h3>Approved</h3>
              <p style={styles.cardValue}>{deliveries.filter(d => d.status === 'approved').length}</p>
            </div>
            <div style={styles.card}>
              <h3>Rejected</h3>
              <p style={styles.cardValue}>{deliveries.filter(d => d.status === 'rejected').length}</p>
            </div>
          </div>

          {/* All Deliveries Table with Actions */}
          <div style={styles.section}>
            <h2 style={{ fontWeight: 'bold' }}>All Deliveries</h2>
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

      {activeTab === "prescriptions" && (
        <>
          {/* Prescriptions Stats */}
          <div style={styles.cards}>
            <div style={styles.card}>
              <h3>Total Prescriptions</h3>
              <p style={styles.cardValue}>{prescriptions.length}</p>
            </div>
            <div style={styles.card}>
              <h3>Pending</h3>
              <p style={styles.cardValue}>{prescriptions.filter(p => p.status === 'pending').length}</p>
            </div>
            <div style={styles.card}>
              <h3>Approved</h3>
              <p style={styles.cardValue}>{prescriptions.filter(p => p.status === 'approved').length}</p>
            </div>
          </div>

          {/* Prescriptions Section */}
          <div style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <h2 style={{ fontWeight: 'bold', margin: 0 }}>
                {showApprovedPrescriptions ? 'Approved Prescriptions' : 'Pending Prescriptions'}
              </h2>
              <button
                style={{
                  ...styles.actionBtn,
                  backgroundColor: showApprovedPrescriptions ? '#6b7280' : '#10b981',
                  padding: '10px 18px',
                }}
                onClick={() => {
                  setShowApprovedPrescriptions(prev => !prev);
                  setShowAllPrescriptions(false);
                }}
              >
                {showApprovedPrescriptions ? 'Back to Pending' : 'Approved Prescriptions'}
              </button>
            </div>
            <div style={styles.tableContainer}>
              {showApprovedPrescriptions ? (
                <>
                  {prescriptions.filter(p => p.status === "approved").length === 0 ? (
                    <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>No approved prescriptions yet.</p>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.tableHeader}>ID</th>
                          <th style={styles.tableHeader}>Patient Name</th>
                          <th style={styles.tableHeader}>Doctor Name</th>
                          <th style={styles.tableHeader}>Medicines</th>
                          <th style={styles.tableHeader}>Date</th>
                          <th style={styles.tableHeader}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptions.filter(p => p.status === "approved").map((prescription, index) => (
                          <tr key={prescription.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                            <td style={styles.tableCell}>#{prescription.id}</td>
                            <td style={styles.tableCell}>{prescription.patient_name}</td>
                            <td style={styles.tableCell}>{prescription.doctor_name}</td>
                            <td style={styles.tableCell}>
                              {prescription.medicines?.map((med, idx) => (
                                <div key={idx}>
                                  {med.name}: {med.quantity} {med.quantity > 1 ? 'boxes' : 'box'}
                                </div>
                              ))}
                            </td>
                            <td style={styles.tableCell}>{new Date(prescription.created_at).toLocaleDateString()}</td>
                            <td style={styles.tableCell}>
                              <span style={{
                                ...styles.statusBadge,
                                backgroundColor: '#22c55e',
                                color: 'white'
                              }}>
                                Approved
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                (() => {
                  const pendingPrescriptions = prescriptions.filter(p => p.status === "pending");
                  const displayedPrescriptions = showAllPrescriptions ? pendingPrescriptions : pendingPrescriptions.slice(0, 5);
                  return (
                    <>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.tableHeader}>ID</th>
                            <th style={styles.tableHeader}>Patient Name</th>
                            <th style={styles.tableHeader}>Doctor Name</th>
                            <th style={styles.tableHeader}>Medicines</th>
                            <th style={styles.tableHeader}>Date</th>
                            <th style={styles.tableHeader}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedPrescriptions.map((prescription, index) => (
                            <tr key={prescription.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                              <td style={styles.tableCell}>#{prescription.id}</td>
                              <td style={styles.tableCell}>{prescription.patient_name}</td>
                              <td style={styles.tableCell}>{prescription.doctor_name}</td>
                              <td style={styles.tableCell}>
                                {prescription.medicines?.map((med, idx) => (
                                  <div key={idx}>
                                    {med.name}: {med.quantity} {med.quantity > 1 ? 'boxes' : 'box'}
                                  </div>
                                ))}
                              </td>
                              <td style={styles.tableCell}>{new Date(prescription.created_at).toLocaleDateString()}</td>
                              <td style={styles.tableCell}>
                                <button
                                  style={{ ...styles.actionBtn, backgroundColor: "#22c55e" }}
                                  onClick={() => handleApprovePrescription(prescription.id)}
                                  disabled={approvalStatus[prescription.id] === "pending"}
                                >
                                  {approvalStatus[prescription.id] === "pending" ? "..." : "Approve"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {pendingPrescriptions.length === 0 && (
                        <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>No pending prescriptions.</p>
                      )}
                      {pendingPrescriptions.length > 5 && !showAllPrescriptions && (
                        <div style={{ textAlign: "center", marginTop: "15px", paddingBottom: "10px" }}>
                          <button
                            style={{
                              ...styles.actionBtn,
                              backgroundColor: "#3b82f6",
                              padding: "8px 20px",
                              fontSize: "0.9rem"
                            }}
                            onClick={() => setShowAllPrescriptions(true)}
                          >
                            View More ({pendingPrescriptions.length - 5} more)
                          </button>
                        </div>
                      )}
                      {showAllPrescriptions && pendingPrescriptions.length > 5 && (
                        <div style={{ textAlign: "center", marginTop: "15px", paddingBottom: "10px" }}>
                          <button
                            style={{
                              ...styles.actionBtn,
                              backgroundColor: "#6b7280",
                              padding: "8px 20px",
                              fontSize: "0.9rem"
                            }}
                            onClick={() => setShowAllPrescriptions(false)}
                          >
                            Show Less
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>
          </div>
        </>
      )}

      {/* Reports Section */}
      <ReportsSection userRole="pharmacist" />
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
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
    borderBottom: "2px solid #e2e8f0",
    flexWrap: "wrap",
  },
  tabButton: {
    padding: "12px 24px",
    fontSize: "1.1rem",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px 8px 0 0",
    transition: "all 0.2s ease",
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
  tabButtonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 14px rgba(15, 23, 42, 0.12)",
    backgroundColor: "#f8fafe",
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
  stockSearchRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "12px",
    marginTop: "20px",
  },
  stockSearchInput: {
    flex: "1 1 320px",
    minWidth: "220px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "0.95rem",
  },
  stockSearchInfo: {
    flex: "1 1 280px",
    minWidth: "220px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
  },
  stockSearchResultList: {
    marginTop: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: "14px",
  },
  stockSearchResultItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
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
  popupOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  popupCard: {
    width: "min(560px, 100%)",
    background: "white",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 28px 60px rgba(15, 23, 42, 0.18)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  },
  popupActions: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },
  popupApproveBtn: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "9999px",
    fontWeight: 700,
    cursor: "pointer",
  },
  popupCancelBtn: {
    background: "#f8fafc",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "12px 22px",
    borderRadius: "9999px",
    fontWeight: 600,
    cursor: "pointer",
  },
};