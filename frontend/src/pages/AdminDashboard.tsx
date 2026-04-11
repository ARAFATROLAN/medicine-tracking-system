import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import AnimatedNumber from "../components/AnimatedNumber";
import UserRegistrationForm from "../components/UserRegistrationForm";
import VehicleRegistration from "./Admin/VehicleRegistration";
import VehicleTracking from "./Admin/VehicleTracking";
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
  activeTab: "overview" | "users" | "medicines" | "prescriptions" | "deliveries" | "inventory" | "hospitals" | "vehicles";
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
  const [showVehicleRegistration, setShowVehicleRegistration] = useState(false);
  const [showVehicleTracking, setShowVehicleTracking] = useState(false);
  const [showHealthDropdown, setShowHealthDropdown] = useState(false);
  const [animatedDiskUsage, setAnimatedDiskUsage] = useState(0);
  const [animatedMemoryUsage, setAnimatedMemoryUsage] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const healthButtonRef = useRef<HTMLButtonElement | null>(null);

  const overallHealth =
    health?.database_status === "healthy" && health?.api_status === "healthy";

  // ============ CHECK ADMIN ROLE ============
  useEffect(() => {
    const rolesStr = localStorage.getItem("roles");
    const specialisation = localStorage.getItem("role");
    console.log("📍 Storage check - roles string:", rolesStr);
    console.log("📍 Storage check - specialisation:", specialisation);
    
    const roles = JSON.parse(rolesStr || "[]");
    console.log("📍 Parsed roles:", roles);
    
    // Check for admin role - either in roles array or specialisation field
    const hasAdminRole = roles.some((role: string) => 
      role.toLowerCase() === "admin" || role.toLowerCase() === "super_admin"
    ) || specialisation?.toLowerCase() === "admin";
    
    console.log("📍 Has admin role:", hasAdminRole);
    
    if (!hasAdminRole) {
      console.warn("❌ User does not have admin role - redirecting to /dashboard");
      navigate("/dashboard");
      return;
    }
    
    console.log("✅ User has admin role - allowing access");
  }, [navigate]);

  // ============ FETCH DATA ============
  const fetchStats = useCallback(async () => {
    setError(null);
    try {
      const statsData = await api.fetchDashboardStats();
      setStats(statsData);
    } catch (err: any) {
      console.error("❌ Stats fetch error:", err);
      if (err.response?.status === 401) {
        navigate("/");
      } else {
        const errorMsg = err.response?.data?.message || err.message || "Failed to load dashboard stats";
        setError(`Failed to load dashboard data: ${errorMsg}`);
      }
    }
  }, [navigate]);

  const fetchHealthData = useCallback(async () => {
    try {
      const healthData = await api.fetchSystemHealth();
      setHealth(healthData);
    } catch (err: any) {
      console.error("❌ Health fetch error:", err);
    }
  }, []);

  // ============ LOAD DATA & AUTO-REFRESH (SILENT) ============
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchHealthData()]);
      setLoading(false);
    };

    loadInitial();

    const statsInterval = setInterval(fetchStats, 60000);
    const healthInterval = setInterval(fetchHealthData, 5000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(healthInterval);
    };
  }, [fetchStats, fetchHealthData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        showHealthDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        healthButtonRef.current &&
        !healthButtonRef.current.contains(target)
      ) {
        setShowHealthDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowHealthDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showHealthDropdown]);

  useEffect(() => {
    if (!showHealthDropdown) {
      return;
    }

    const targetDisk = Math.max(0, Math.min(100, health?.disk_usage || 0));
    const targetMemory = Math.max(0, Math.min(100, health?.memory_usage || 0));

    setAnimatedDiskUsage(0);
    setAnimatedMemoryUsage(0);

    let currentDisk = 0;
    let currentMemory = 0;
    const stepDisk = Math.max(1, Math.round(targetDisk / 40));
    const stepMemory = Math.max(1, Math.round(targetMemory / 40));

    const interval = window.setInterval(() => {
      if (currentDisk < targetDisk) {
        currentDisk = Math.min(targetDisk, currentDisk + stepDisk);
        setAnimatedDiskUsage(currentDisk);
      }
      if (currentMemory < targetMemory) {
        currentMemory = Math.min(targetMemory, currentMemory + stepMemory);
        setAnimatedMemoryUsage(currentMemory);
      }
      if (currentDisk >= targetDisk && currentMemory >= targetMemory) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [showHealthDropdown, health]);

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">⏳ Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">
          <h2>❌ Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchStats} className="btn-retry" style={{marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats || !health) {
    return (
      <div className="admin-container">
        <div className="error-message">
          <h2>⚠️ No Data Available</h2>
          <p>Dashboard data could not be loaded. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} className="btn-retry" style={{marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            🔄 Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* ============ MAIN CONTENT ============ */}
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="header-left">
            <h1>Hospital Control Center</h1>
            <p className="subtitle">System Management & Monitoring</p>
          </div>
          <div className="header-right">
            <button
              type="button"
              ref={healthButtonRef}
              className={`status-button ${overallHealth ? "healthy" : "unhealthy"}`}
              onClick={() => setShowHealthDropdown((prev) => !prev)}
            >
              <span>{overallHealth ? "Healthy" : "Health Status"}</span>
              <span className="status-arrow">{showHealthDropdown ? "▲" : "▼"}</span>
            </button>
            {showHealthDropdown && (
              <div className="health-dropdown" ref={dropdownRef}>
                <div className="health-dropdown-header">System Health</div>
                <div className="health-grid dropdown-grid">
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
                    value={animatedDiskUsage}
                    icon="💾"
                  />
                  <ProgressCard
                    title="Memory Usage"
                    value={animatedMemoryUsage}
                    icon="🧠"
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* TAB NAVIGATION */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${management.activeTab === "overview" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "overview" })}
          >
            📊 Overview
          </button>
          <button
            className={`admin-tab ${management.activeTab === "users" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "users" })}
          >
            👥 Users
          </button>
          <button
            className={`admin-tab ${management.activeTab === "medicines" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "medicines" })}
          >
            💊 Medicines
          </button>
          <button
            className={`admin-tab ${management.activeTab === "prescriptions" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "prescriptions" })}
          >
            📋 Prescriptions
          </button>
          <button
            className={`admin-tab ${management.activeTab === "deliveries" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "deliveries" })}
          >
            🚚 Deliveries
          </button>
          <button
            className={`admin-tab ${management.activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "inventory" })}
          >
            📦 Inventory
          </button>
          <button
            className={`admin-tab ${management.activeTab === "hospitals" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "hospitals" })}
          >
            🏥 Hospitals
          </button>
          <button
            className={`admin-tab ${management.activeTab === "vehicles" ? "active" : ""}`}
            onClick={() => setManagement({ ...management, activeTab: "vehicles" })}
          >
            🚗 Vehicles
          </button>
        </div>

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


            {/* RECENT ACTIVITY */}
            <section className="recent-activity">
              <h3>📝 Recent Activity (Last 10)</h3>
              <div className="activity-list">
                {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                  stats.recent_activities.map((activity, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-content">
                        <span className="activity-action">{activity.action}</span>
                        <span className="activity-user-id">👤 User ID: {activity.user_id}</span>
                      </div>
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

        {/* ============ PRESCRIPTIONS TAB ============ */}
        {management.activeTab === "prescriptions" && (
          <div className="tab-content">
            <PrescriptionsManagement />
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

        {/* ============ HOSPITALS TAB ============ */}
        {management.activeTab === "hospitals" && (
          <div className="tab-content">
            <HospitalManagement />
          </div>
        )}

        {/* ============ VEHICLES TAB ============ */}
        {management.activeTab === "vehicles" && (
          <div className="tab-content">
            <div className="vehicle-management-section">
              <div className="vehicle-buttons-row">
                <button
                  className="btn-vehicle-action"
                  onClick={() => setShowVehicleRegistration(true)}
                  title="Register and manage vehicles"
                >
                  ✏️ Vehicle Management
                </button>
                <button
                  className="btn-vehicle-action btn-track"
                  onClick={() => setShowVehicleTracking(true)}
                  title="Track vehicles in real-time"
                >
                  📍 Track Vehicle
                </button>
              </div>

              {showVehicleRegistration && (
                <VehicleRegistration
                  onClose={() => setShowVehicleRegistration(false)}
                />
              )}

              {showVehicleTracking && (
                <VehicleTracking
                  onClose={() => setShowVehicleTracking(false)}
                />
              )}
            </div>
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
      <p className="metric-value"><AnimatedNumber value={value} /></p>
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
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.fetchUsers(page);
      setUsers(data.data || data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    fetchUsers();
    alert("User registered successfully!");
  };

  return (
    <div className="management-section">
      {showRegistrationForm ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <UserRegistrationForm
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setShowRegistrationForm(false)}
          />
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>👥 User Management</h3>
            <button
              style={{
                padding: "8px 16px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onClick={() => setShowRegistrationForm(true)}
            >
              ➕ Register New User
            </button>
          </div>

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
        </>
      )}
    </div>
  );
};

// ============ HOSPITAL MANAGEMENT COMPONENT ============
const HospitalManagement: React.FC = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [hospitalRegistering, setHospitalRegistering] = useState(false);
  const [deviceRegistering, setDeviceRegistering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hospitalForm, setHospitalForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [deviceForm, setDeviceForm] = useState({
    hospital_id: null as number | null,
    name: "",
    identifier: "",
    location: "",
    is_active: true,
  });

  const loadHospitals = async () => {
    try {
      const data = await api.fetchHospitals();
      setHospitals(data.data || data);
      setMessage(null);
    } catch (err: any) {
      console.error("Failed to load hospitals:", err);
      setMessage("Unable to fetch hospitals at this time.");
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async (hospital?: any) => {
    setDeviceLoading(true);
    try {
      const data = await api.fetchDevices(hospital?.id);
      console.log("✅ Devices loaded:", data);
      setDevices(data.data || data || []);
      setSelectedHospital(hospital || null);
      setMessage(null);
    } catch (err: any) {
      console.error("Failed to load devices:", err);
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
      });
      // Don't show error for initial load, just log it
      if (!hospital) {
        console.log("⚠️ Could not load initial devices list");
        setDevices([]);
      } else {
        setMessage("Unable to fetch devices for this hospital.");
      }
    } finally {
      setDeviceLoading(false);
    }
  };

  const handleHospitalChange = (field: string, value: string) => {
    setHospitalForm({ ...hospitalForm, [field]: value });
  };

  const handleDeviceChange = (field: string, value: string | boolean | number | null) => {
    setDeviceForm({ ...deviceForm, [field]: value });
  };

  const handleCreateHospital = async () => {
    if (!hospitalForm.name || !hospitalForm.email || !hospitalForm.phone || !hospitalForm.address) {
      setMessage("Please fill all hospital fields before submitting.");
      return;
    }

    setHospitalRegistering(true);
    try {
      const data = await api.createHospital(hospitalForm);
      setHospitals((prev) => [data.data || data, ...prev]);
      setHospitalForm({ name: "", email: "", phone: "", address: "" });
      setMessage("Hospital registered successfully.");
    } catch (err: any) {
      console.error("Failed to create hospital:", err);
      const message = err.response?.data?.message || err.message || "Unable to register hospital.";
      setMessage(message);
    } finally {
      setHospitalRegistering(false);
    }
  };

  const handleDeleteHospital = async (id: number) => {
    if (!window.confirm("Delete this hospital and all registered devices?")) {
      return;
    }

    try {
      await api.deleteHospital(id);
      setHospitals(hospitals.filter((h) => h.id !== id));
      if (selectedHospital?.id === id) {
        setSelectedHospital(null);
        setDevices([]);
      }
      setMessage("Hospital deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete hospital:", err);
      setMessage("Unable to delete hospital.");
    }
  };

  const handleCreateDevice = async () => {
    if (!deviceForm.name || !deviceForm.identifier) {
      setMessage("Device name and identifier are required.");
      return;
    }

    setDeviceRegistering(true);
    try {
      const data = await api.createDevice(deviceForm);
      setDevices((prev) => [data.data || data, ...prev]);
      setDeviceForm({ hospital_id: null, name: "", identifier: "", location: "", is_active: true });
      setMessage("Device registered successfully.");
    } catch (err: any) {
      console.error("Failed to create device:", err);
      const message = err.response?.data?.message || err.message || "Unable to register device.";
      setMessage(message);
    } finally {
      setDeviceRegistering(false);
    }
  };

  const handleDeleteDevice = async (id: number) => {
    if (!window.confirm("Delete this branch device?")) {
      return;
    }

    try {
      await api.deleteDevice(id);
      setDevices(devices.filter((device) => device.id !== id));
      setMessage("Branch device deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete branch device:", err);
      setMessage("Unable to delete branch device.");
    }
  };

  useEffect(() => {
    loadHospitals();
    // Don't load devices on initial mount - only load when hospital is selected
  }, []);

  return (
    <div className="management-section">
      <div className="section-header">
        <h3>🏥 Hospital & Branch Device Management</h3>
      </div>

      {message && <div className="form-message">{message}</div>}

      <div className="management-panel">
        <div className="management-column">
          <div className="form-card">
            <h4>Register New Hospital</h4>
            <div className="form-grid">
              <label>
                Name
                <input
                  value={hospitalForm.name}
                  onChange={(e) => handleHospitalChange("name", e.target.value)}
                  placeholder="Hospital name"
                />
              </label>
              <label>
                Email
                <input
                  value={hospitalForm.email}
                  onChange={(e) => handleHospitalChange("email", e.target.value)}
                  placeholder="admin@hospital.com"
                />
              </label>
              <label>
                Phone
                <input
                  value={hospitalForm.phone}
                  onChange={(e) => handleHospitalChange("phone", e.target.value)}
                  placeholder="+1234567890"
                />
              </label>
              <label className="full-width">
                Address
                <input
                  value={hospitalForm.address}
                  onChange={(e) => handleHospitalChange("address", e.target.value)}
                  placeholder="Hospital address"
                />
              </label>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateHospital}
              disabled={hospitalRegistering}
            >
              {hospitalRegistering ? "Registering..." : "Register Hospital"}
            </button>
          </div>

          <div className="table-card">
            <h4>Registered Hospitals</h4>
            {loading ? (
              <p>Loading hospitals...</p>
            ) : hospitals.length === 0 ? (
              <p>No hospitals registered yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitals.map((hospital) => (
                      <tr key={hospital.id}>
                        <td>{hospital.id}</td>
                        <td>{hospital.name}</td>
                        <td>{hospital.phone}</td>
                        <td>{hospital.email}</td>
                        <td>
                          <button className="btn-edit" onClick={() => loadDevices(hospital)}>
                            View Devices
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteHospital(hospital.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="management-column">
          <div className="form-card">
            <h4>Register Branch Device</h4>
            <p className="small-note">
              Devices can now be registered independently of hospitals. Optionally assign a device to a hospital.
            </p>
            <div className="form-grid">
              <label>
                Device Name
                <input
                  value={deviceForm.name}
                  onChange={(e) => handleDeviceChange("name", e.target.value)}
                  placeholder="Front desk scanner"
                />
              </label>
              <label>
                Identifier
                <input
                  value={deviceForm.identifier}
                  onChange={(e) => handleDeviceChange("identifier", e.target.value)}
                  placeholder="scanner-01"
                />
              </label>
              <label>
                Assign Hospital
                <select
                  value={deviceForm.hospital_id ?? ""}
                  onChange={(e) => handleDeviceChange("hospital_id", e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Standalone device</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-width">
                Location
                <input
                  value={deviceForm.location}
                  onChange={(e) => handleDeviceChange("location", e.target.value)}
                  placeholder="Branch location"
                />
              </label>
              <label className="full-width checkbox-label">
                <input
                  type="checkbox"
                  checked={deviceForm.is_active}
                  onChange={(e) => handleDeviceChange("is_active", e.target.checked)}
                />
                Active device registration
              </label>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateDevice}
              disabled={deviceRegistering}
            >
              {deviceRegistering ? "Registering..." : "Register Device"}
            </button>
          </div>

          <div className="table-card">
            <div className="table-card-header">
              <h4>Branch Devices {selectedHospital ? `for ${selectedHospital.name}` : "(All)"}</h4>
              <button className="btn-primary" onClick={() => loadDevices()}>
                View All Devices
              </button>
            </div>
            {deviceLoading ? (
              <p>Loading devices...</p>
            ) : devices.length === 0 ? (
              <p>No registered devices.</p>
            ) : (
              <div className="table-responsive">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Identifier</th>
                      <th>Hospital</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id}>
                        <td>{device.id}</td>
                        <td>{device.name}</td>
                        <td>{device.identifier}</td>
                        <td>{device.hospital?.name || "Standalone"}</td>
                        <td>{device.location || "N/A"}</td>
                        <td>{device.is_active ? "Active" : "Inactive"}</td>
                        <td>
                          <button className="btn-delete" onClick={() => handleDeleteDevice(device.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
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

  const handlePrintSeal = async (sealCode: string) => {
    try {
      const response = await api.getPrintableSeal(sealCode);
      if (response) {
        // Open print dialog with the seal data
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>QR Seal: ${sealCode}</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                  .seal-container { border: 2px solid #333; padding: 20px; margin: 20px auto; max-width: 400px; }
                  .seal-code { font-size: 24px; font-weight: bold; margin: 10px 0; }
                  .qr-code { margin: 20px 0; }
                  .seal-info { font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <div class="seal-container">
                  <h2>Medicine QR Seal</h2>
                  ${response.qr_code_url ? '<div class="qr-code"><img src="' + response.qr_code_url + '" alt="QR Code" /></div>' : '<p>No QR code available.</p>'}
                  <div class="seal-info">
                    <p>Generated: ${new Date().toLocaleString()}</p>
                    <p>Scan this QR code to verify the medicine authenticity.</p>
                  </div>
                </div>
                <script>
                  window.onload = function() {
                    window.print();
                    window.close();
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (err) {
      console.error("Failed to get printable seal:", err);
      alert("Failed to generate printable seal. Please try again.");
    }
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
                <th>QR Code</th>
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
                  <td>
                    {med.seal_code_data?.qr_code_url ? (
                      <div className="seal-code-cell">
                        <div className="qr-code-display">
                          <img
                            src={med.seal_code_data.qr_code_url}
                            alt="Medicine QR Code"
                            className="qr-code-image"
                            style={{ width: '70px', height: '70px', objectFit: 'contain' }}
                          />
                        </div>
                        <button
                          className="btn-print-seal"
                          onClick={() => handlePrintSeal(med.seal_code_data.code)}
                          title="Print QR Code"
                        >
                          🖨️ Print
                        </button>
                      </div>
                    ) : (
                      <span className="no-seal">No Seal</span>
                    )}
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

// ============ PRESCRIPTIONS MANAGEMENT COMPONENT ============
const PrescriptionsManagement: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, _setPage] = useState(1);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await api.fetchPrescriptions(page);
        setPrescriptions(data.data || data);
      } catch (err) {
        console.error("Failed to fetch prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [page]);

  const handlePrintSeal = async (sealCode: string) => {
    try {
      const response = await api.getPrintableSeal(sealCode);
      if (response) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>QR Seal: ${sealCode}</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #fff; color: #111; }
                  .seal-container { border: 2px solid #333; padding: 20px; margin: 20px auto; max-width: 420px; }
                  .qr-code { margin: 20px 0; }
                  .qr-code img { max-width: 100%; height: auto; }
                  .seal-info { font-size: 12px; color: #666; margin-top: 14px; }
                </style>
              </head>
              <body>
                <div class="seal-container">
                  <h2>Prescription QR Seal</h2>
                  ${response.qr_code_url ? '<div class="qr-code"><img src="' + response.qr_code_url + '" alt="QR Code" /></div>' : '<p>No QR code available.</p>'}
                  <div class="seal-info">
                    <p>Generated: ${new Date().toLocaleString()}</p>
                    <p>Scan this QR code to verify the medicine authenticity.</p>
                  </div>
                </div>
                <script>
                  window.onload = function() {
                    window.print();
                    window.close();
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (err) {
      console.error("Failed to get printable seal:", err);
      alert("Failed to generate printable seal. Please try again.");
    }
  };

  return (
    <div className="management-section">
      <h3>📋 Prescription Management</h3>
      {loading ? (
        <p>Loading prescriptions...</p>
      ) : prescriptions.length > 0 ? (
        <div className="table-responsive">
          <table className="management-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Medicine</th>
                <th>QR Code</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{prescription.id}</td>
                  <td>{prescription.patient_name || "N/A"}</td>
                  <td>{prescription.medicine?.name || "N/A"}</td>
                  <td>
                    {prescription.seal_code?.qr_code_url ? (
                      <img
                        src={prescription.seal_code.qr_code_url}
                        alt="Prescription QR Code"
                        style={{ width: '54px', height: '54px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>Pending</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${prescription.status}`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td>{new Date(prescription.created_at).toLocaleDateString()}</td>
                  <td>
                    {prescription.seal_code ? (
                      <button
                        className="btn-print"
                        onClick={() => handlePrintSeal(prescription.seal_code.code)}
                        title="Print QR code"
                      >
                        🖨️ Print QR
                      </button>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>No seal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No prescriptions found. Create a prescription to get started.</p>
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
