// src/pages/Dashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//import DashboardSections from "../components/DashboardSections";

const mockStock = [
  { name: "Paracetamol", quantity: 240, expiry: new Date(Date.now() + 5 * 86400000) },
  { name: "Amoxicillin", quantity: 120, expiry: new Date(Date.now() + 15 * 86400000) },
  { name: "Ibuprofen", quantity: 60, expiry: new Date(Date.now() + 2 * 86400000) },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const time = Date.now(); // Static time

  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role") || "Admin";

  // Removed useEffect for timer

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard" style={{
      display: "flex",
      height: "100vh",
      background: darkMode ? "#1f2937" : "#f0f4f8",
      color: darkMode ? "#f0f4f8" : "#1f2937"
    }}>
      
      {/* Sidebar */}
      <div style={{ width: 220, background: "#2563eb", padding: 20, color: "#fff" }}>
        <h2>{role} Panel</h2>

        {role === "Admin" && (
          <>
            <button onClick={() => navigate("/dashboard/doctors")}>Doctors</button>
            <button onClick={() => navigate("/dashboard/pharmacists")}>Pharmacists</button>
            <button onClick={() => navigate("/dashboard/patients")}>Patients</button>
            <button onClick={() => navigate("/dashboard/users")}>Users</button>
            <button onClick={() => navigate("/dashboard/settings")}>Settings</button>
          </>
        )}

        <button onClick={() => setDarkMode(prev => !prev)}>
          Toggle Mode
        </button>

        <button onClick={handleLogout} style={{ marginTop: 20, background: "red" }}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 20 }}>
        <h1>Welcome {name}</h1>

        {/* Stock */}
        <div style={{ display: "grid", gap: 10 }}>
          {mockStock.map(item => {
            const seconds = Math.floor((item.expiry.getTime() - time) / 1000);
            const days = Math.max(0, Math.floor(seconds / 86400));

            return (
              <div key={item.name}>
                {item.name} — {item.quantity} — {days} days left
              </div>
            );
          })}
        </div>

        {/* <DashboardSections /> */}
      </div>
    </div>
  );
};

export default Dashboard;