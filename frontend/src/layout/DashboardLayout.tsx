// src/layout/DashboardLayout.tsx
import type { FC } from "react";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import LeftSidebar from "../components/LeftSidebar";

const DashboardLayout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <LeftSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main style={{
        width: "100%",
        padding: "20px"
      }}>
        <Outlet /> {/* This is critical to render nested routes */}
      </main>
    </div>
  );
};

export default DashboardLayout;