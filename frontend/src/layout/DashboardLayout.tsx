// src/layout/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";

const DashboardLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* You can add a sidebar here if needed */}
      <aside style={{ width: "220px", backgroundColor: "#2563eb", color: "white", padding: "20px" }}>
        <h2>Dashboard Sidebar</h2>
        {/* Links/buttons for navigation */}
      </aside>

      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet /> {/* This is critical to render nested routes */}
      </main>
    </div>
  );
};

export default DashboardLayout;