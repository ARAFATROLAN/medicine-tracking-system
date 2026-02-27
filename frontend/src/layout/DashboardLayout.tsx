import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`${darkMode ? "dark" : ""} flex h-screen`}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}