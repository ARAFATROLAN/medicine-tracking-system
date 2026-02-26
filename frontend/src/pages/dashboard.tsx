// src/pages/Dashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // go back to login
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
        padding: "30px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ color: "#2563eb" }}>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Welcome Section */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2>Welcome to Medicine Tracking System 💊</h2>
        <p>
          Manage patients, doctors, medicines, prescriptions, and deliveries
          efficiently.
        </p>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <Card
          title="Patients"
          subtitle="View & Manage Patients"
          onClick={() => navigate("/patients")}
        />
        <Card
          title="Doctors"
          subtitle="View & Manage Doctors"
          onClick={() => navigate("/doctors")}
        />
        <Card
          title="Medicines"
          subtitle="Track Medicine Inventory"
          onClick={() => navigate("/medicines")}
        />
        <Card
          title="Prescriptions"
          subtitle="Manage Prescriptions"
          onClick={() => navigate("/prescriptions")}
        />
        <Card
          title="Deliveries"
          subtitle="Track Medicine Deliveries"
          onClick={() => navigate("/deliveries")}
        />
      </div>
    </div>
  );
};

// Reusable Card Component
interface CardProps {
  title: string;
  subtitle: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, subtitle, onClick }) => {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        textAlign: "center",
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
      onClick={onClick}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <button
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Go
      </button>
    </div>
  );
};

export default Dashboard;