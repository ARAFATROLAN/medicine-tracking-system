<<<<<<< Updated upstream
import React from "react";
import DashboardSections from "../components/DashboardSections";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardSections />
    </div>
  );
}
=======
// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Mock data for charts and stock
const mockStock = [
  { name: "Paracetamol", quantity: 240, expiry: new Date(Date.now() + 5*24*60*60*1000) },
  { name: "Amoxicillin", quantity: 120, expiry: new Date(Date.now() + 15*24*60*60*1000) },
  { name: "Ibuprofen", quantity: 60, expiry: new Date(Date.now() + 2*24*60*60*1000) },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [role, setRole] = useState<"Admin" | "Pharmacist">("Admin"); // Role-based
  const [stockData, setStockData] = useState(mockStock);

  // Expiry countdown update
  useEffect(() => {
    const timer = setInterval(() => {
      setStockData([...stockData]);
    }, 1000);
    return () => clearInterval(timer);
  }, [stockData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMode = () => setDarkMode(!darkMode);

  return (
    <>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          font-family: 'Segoe UI', sans-serif;
        }
        .dashboard {
          display: flex;
          height: 100vh;
          background: ${darkMode ? "#1f2937" : "#f0f4f8"};
          color: ${darkMode ? "#f0f4f8" : "#1f2937"};
        }
        .sidebar {
          width: 220px;
          background: ${darkMode ? "#111827" : "#2563eb"};
          display: flex;
          flex-direction: column;
          padding: 20px;
          color: white;
        }
        .sidebar h2 { margin-bottom: 30px; font-size: 20px; }
        .sidebar button {
          margin-bottom: 10px;
          padding: 10px 15px;
          background: transparent;
          border: 1px solid white;
          border-radius: 6px;
          cursor: pointer;
          color: white;
          font-weight: bold;
          transition: 0.3s;
        }
        .sidebar button:hover { background: rgba(255,255,255,0.2); }
        .main {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .header h1 { font-size: 28px; }
        .btn { padding: 8px 16px; border-radius: 6px; cursor: pointer; border: none; font-weight: bold; }
        .btn-logout { background: #ef4444; color: white; }
        .btn-toggle { background: #0ea5e9; color: white; margin-left: 10px; }
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .glass-card {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          transition: 0.3s ease;
          cursor: pointer;
          text-align: center;
        }
        .glass-card:hover { transform: scale(1.05); }
        .chart {
          height: 250px;
          margin-bottom: 30px;
        }
        .stock-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          margin-bottom: 10px;
          background: ${darkMode ? "#374151" : "#ffffff"};
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
      `}</style>

      <div className="dashboard">
        {/* Sidebar */}
        <div className="sidebar">
          <h2>{role} Panel</h2>
          <button onClick={() => navigate("/patients")}>Patients</button>
          <button onClick={() => navigate("/doctors")}>Doctors</button>
          <button onClick={() => navigate("/medicines")}>Medicines</button>
          <button onClick={() => navigate("/prescriptions")}>Prescriptions</button>
          <button onClick={() => navigate("/deliveries")}>Deliveries</button>
          <button onClick={toggleMode}>{darkMode ? "Light Mode" : "Dark Mode"}</button>
          <button onClick={handleLogout} style={{ marginTop: "auto", background: "#ef4444" }}>Logout</button>
        </div>

        {/* Main Content */}
        <div className="main">
          <div className="header">
            <h1>🏥 National Medicine Tracking Dashboard</h1>
          </div>

          {/* Live Stock Cards */}
          <div className="cards">
            {stockData.map((item) => {
              const expiryCountdown = Math.max(0, Math.floor((item.expiry.getTime() - Date.now()) / 1000));
              const days = Math.floor(expiryCountdown / (24*60*60));
              return (
                <div className="glass-card" key={item.name}>
                  <h3>{item.name}</h3>
                  <p>Stock: {item.quantity}</p>
                  <p>Expires in: {days} day(s)</p>
                </div>
              );
            })}
          </div>

          {/* Chart Section (placeholder) */}
          <div className="chart glass-card">
            <h3>Medicine Usage Trend 📊</h3>
            <p style={{textAlign: "center"}}>Chart integration with Chart.js / Recharts goes here</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
>>>>>>> Stashed changes
