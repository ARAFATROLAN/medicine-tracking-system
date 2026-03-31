import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import "./AdminDashboard.css";

// ============ TYPES ============
interface DashboardStats {
  total_users: number;
  total_medicines: number;
  total_prescriptions: number;
  pending_deliveries: number;
  low_stock_medicines: number;
  expired_medicines: number;
  recent_activities: any[];
  today_prescriptions: number;
  total_hospitals: number;
}

interface SystemHealth {
  database_status: string;
  api_status: string;
  disk_usage: number;
  memory_usage: number;
  recent_errors: any[];
}

interface Management {
  activeTab: "overview" | "users" | "medicines" | "deliveries" | "inventory";
}

// ============ MAIN COMPONENT ============
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [management, setManagement] = useState<Management>({
    activeTab: "overview",
  });
  const [error, setError] = useState<string | null>(null);

  // ============ FETCH DATA ============
  const fetchData = useCallback(async () => {
    try {
      const [statsData, healthData] = await Promise.all([
        api.fetchDashboardStats(),
        api.fetchSystemHealth(),
      ]);
      
      setStats(statsData);
      setHealth(healthData);
      setError(null);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      if (err.response?.status === 401) {
        navigate("/");
      } else {
        setError("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ============ AUTO-REFRESH DATA ============
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  // ============ HANDLE LOGOUT ============
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchData} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* ============ SIDEBAR ============ */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>⚙️ Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${management.activeTab === "overview" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "overview" })}
          >
            📊 Overview
          </button>
          <button
            className={`nav-btn ${management.activeTab === "users" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "users" })}
          >
            👥 Users
          </button>
          <button
            className={`nav-btn ${management.activeTab === "medicines" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "medicines" })}
          >
            💊 Medicines
          </button>
          <button
            className={`nav-btn ${management.activeTab === "deliveries" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "deliveries" })}
          >
            🚚 Deliveries
          </button>
          <button
            className={`nav-btn ${management.activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "inventory" })}
          >
            📦 Inventory
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="header-left">
            <h1>Hospital Control Center</h1>
            <p className="subtitle">System Management & Monitoring</p>
          </div>
          <div className="header-right">
            <span className={`status ${health?.database_status === "healthy" ? "healthy" : "unhealthy"}`}>
              🔌 {health?.database_status || "Checking..."}
            </span>
          </div>
        </header>

        {/* ============ OVERVIEW TAB ============ */}
        {management.activeTab === "overview" && (
          <div className="tab-content">
            {/* KEY METRICS */}
            <section className="metrics-grid">
              <MetricCard
                title="Total Users"
                value={stats?.total_users || 0}
                icon="👥"
                color="#3b82f6"
              />
              <MetricCard
                title="Medicines"
                value={stats?.total_medicines || 0}
                icon="💊"
                color="#10b981"
              />
              <MetricCard
                title="Prescriptions"
                value={stats?.total_prescriptions || 0}
                icon="📋"
                color="#f59e0b"
              />
              <MetricCard
                title="Pending Deliveries"
                value={stats?.pending_deliveries || 0}
                icon="🚚"
                color="#ef4444"
                highlight={stats?.pending_deliveries! > 0}
              />
              <MetricCard
                title="Low Stock Items"
                value={stats?.low_stock_medicines || 0}
                icon="⚠️"
                color="#f97316"
                highlight={stats?.low_stock_medicines! > 0}
              />
              <MetricCard
                title="Expired Medicines"
                value={stats?.expired_medicines || 0}
                icon="🚫"
                color="#dc2626"
                highlight={stats?.expired_medicines! > 0}
              />
            </section>

            {/* ALERTS SECTION */}
            <section className="alerts-section">
              <h3>🚨 Critical Alerts</h3>
              <div className="alerts-grid">
                {stats?.low_stock_medicines! > 0 && (
                  <div className="alert alert-warning">
                    <strong>Low Stock Warning:</strong> {stats?.low_stock_medicines} medicines below 10 units
                  </div>
                )}
                {stats?.expired_medicines! > 0 && (
                  <div className="alert alert-danger">
                    <strong>Expired Medicines:</strong> {stats?.expired_medicines} medicines have expired
                  </div>
                )}
                {stats?.pending_deliveries! > 0 && (
                  <div className="alert alert-info">
                    <strong>Pending Approvals:</strong> {stats?.pending_deliveries} transfers awaiting approval
                  </div>
                )}
              </div>
            </section>

            {/* SYSTEM HEALTH */}
            <section className="system-health">
              <h3>⚕️ System Health</h3>
              <div className="health-grid">
                <HealthCard
                  title="Database"
                  status={health?.database_status || "unknown"}
                  icon="🗄️"
                />
                <HealthCard
                  title="API"
                  status={health?.api_status || "unknown"}
                  icon="🔌"
                />
                <ProgressCard
                  title="Disk Usage"
                  value={health?.disk_usage || 0}
                  icon="💾"
                />
                <ProgressCard
                  title="Memory Usage"
                  value={health?.memory_usage || 0}
                  icon="🧠"
                />
              </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section className="recent-activity">
              <h3>📝 Recent Activity (Last 10)</h3>
              <div className="activity-list">
                {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                  stats.recent_activities.map((activity, idx) => (
                    <div key={idx} className="activity-item">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-time">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No recent activities</p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ============ USERS TAB ============ */}
        {management.activeTab === "users" && (
          <div className="tab-content">
            <UsersManagement />
          </div>
        )}

        {/* ============ MEDICINES TAB ============ */}
        {management.activeTab === "medicines" && (
          <div className="tab-content">
            <MedicinesManagement />
          </div>
        )}

        {/* ============ DELIVERIES TAB ============ */}
        {management.activeTab === "deliveries" && (
          <div className="tab-content">
            <DeliveriesManagement />
          </div>
        )}

        {/* ============ INVENTORY TAB ============ */}
        {management.activeTab === "inventory" && (
          <div className="tab-content">
            <InventoryManagement />
          </div>
        )}
      </main>
    </div>
  );
};

// ============ METRIC CARD COMPONENT ============
const MetricCard: React.FC<{
  title: string;
  value: number;
  icon: string;
  color?: string;
  highlight?: boolean;
}> = ({ title, value, icon, color = "#6366f1", highlight = false }) => (
  <div className={`metric-card ${highlight ? "highlight" : ""}`} style={{ borderLeftColor: color }}>
    <div className="metric-icon">{icon}</div>
    <div className="metric-info">
      <p className="metric-title">{title}</p>
      <p className="metric-value">{value}</p>
    </div>
  </div>
);

// ============ HEALTH CARD COMPONENT ============
const HealthCard: React.FC<{
  title: string;
  status: string;
  icon: string;
}> = ({ title, status, icon }) => (
  <div className={`health-card status-${status}`}>
    <div className="health-icon">{icon}</div>
    <p className="health-title">{title}</p>
    <p className="health-status">{status.toUpperCase()}</p>
  </div>
);

// ============ PROGRESS CARD COMPONENT ============
const ProgressCard: React.FC<{
  title: string;
  value: number;
  icon: string;
}> = ({ title, value, icon }) => (
  <div className="progress-card">
    <div className="progress-header">
      <span className="progress-icon">{icon}</span>
      <span className="progress-title">{title}</span>
      <span className={`progress-value ${value > 80 ? "critical" : ""}`}>{value.toFixed(1)}%</span>
    </div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

// ============ USERS MANAGEMENT COMPONENT ============
const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, _setPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.fetchUsers(page);
        setUsers(data.data || data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
        alert("User deleted successfully");
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  return (
    <div className="management-section">
      <h3>👥 User Management</h3>
      {loading ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <div className="table-responsive">
          <table className="management-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.contact || "N/A"}</td>
                  <td>{user.specialisation || "User"}</td>
                  <td>
                    <button className="btn-edit">✏️ Edit</button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No users found</p>
      )}
    </div>
  );
};

// ============ MEDICINES MANAGEMENT COMPONENT ============
const MedicinesManagement: React.FC = () => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, _setPage] = useState(1);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const data = await api.fetchMedicines(page);
        setMedicines(data.data || data);
      } catch (err) {
        console.error("Failed to fetch medicines:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeds();
  }, [page]);

  const getStockStatus = (inventories: any[]) => {
    const total = inventories?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0;
    if (total < 10) return "critical";
    if (total < 50) return "low";
    return "adequate";
  };

  return (
    <div className="management-section">
      <h3>💊 Medicine Management</h3>
      {loading ? (
        <p>Loading medicines...</p>
      ) : medicines.length > 0 ? (
        <div className="table-responsive">
          <table className="management-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Stock Status</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id}>
                  <td>{med.id}</td>
                  <td>{med.name}</td>
                  <td>{med.description?.substring(0, 30) || "N/A"}...</td>
                  <td>
                    <span className={`status-badge status-${getStockStatus(med.inventories)}`}>
                      {getStockStatus(med.inventories)}
                    </span>
                  </td>
                  <td>{new Date(med.expiry_date).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-edit">✏️ Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No medicines found</p>
      )}
    </div>
  );
};

// ============ DELIVERIES MANAGEMENT COMPONENT ============
const DeliveriesManagement: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, _setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchDelivs = async () => {
      try {
        const status = filter !== "all" ? filter : undefined;
        const data = await api.fetchDeliveries(page, status);
        setDeliveries(data.data || data);
      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDelivs();
  }, [page, filter]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.updateDeliveryStatus(id, newStatus);
      setDeliveries(
        deliveries.map((d) =>
          d.id === id ? { ...d, status: newStatus } : d
        )
      );
      alert("Status updated successfully");
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h3>🚚 Delivery Management</h3>
        <div className="filter-btns">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={filter === "approved" ? "active" : ""}
            onClick={() => setFilter("approved")}
          >
            Approved
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading deliveries...</p>
      ) : deliveries.length > 0 ? (
        <div className="table-responsive">
          <table className="management-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{delivery.id}</td>
                  <td>
                    <span className={`status-badge status-${delivery.status}`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td>{new Date(delivery.created_at).toLocaleString()}</td>
                  <td>
                    {delivery.status === "pending" && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleStatusUpdate(delivery.id, "approved")}
                        >
                          ✅ Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleStatusUpdate(delivery.id, "rejected")}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No deliveries found</p>
      )}
    </div>
  );
};

// ============ INVENTORY MANAGEMENT COMPONENT ============
const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, _setPage] = useState(1);

  useEffect(() => {
    const fetchInv = async () => {
      try {
        const data = await api.fetchInventory(page);
        setInventory(data.data || data);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInv();
  }, [page]);

  const getStockColor = (quantity: number) => {
    if (quantity < 10) return "critical";
    if (quantity < 50) return "low";
    return "adequate";
  };

  return (
    <div className="management-section">
      <h3>📦 Inventory Management</h3>
      {loading ? (
        <p>Loading inventory...</p>
      ) : inventory.length > 0 ? (
        <div className="table-responsive">
          <table className="management-table">
            <thead>
              <tr>
                <th>Medicine ID</th>
                <th>Quantity</th>
                <th>Stock Level</th>
                <th>Expiry Date</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.medicine_id}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <span className={`stock-badge stock-${getStockColor(item.quantity)}`}>
                      {getStockColor(item.quantity)}
                    </span>
                  </td>
                  <td>{new Date(item.expiry_date).toLocaleDateString()}</td>
                  <td>{item.location || "Warehouse"}</td>
                  <td>
                    <button className="btn-edit">✏️ Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No inventory items found</p>
      )}
    </div>
  );
};

export default AdminDashboard;
