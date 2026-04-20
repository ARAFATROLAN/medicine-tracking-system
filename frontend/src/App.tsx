// src/App.tsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import Login from "./pages/login";
import Register from "./pages/register";
import DoctorDashboard from "./pages/doctorDashboard";
import PharmacistDashboard from "./pages/pharmacistDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MessageCenter from "./components/MessageCenter";

// Layouts
import DashboardLayout from "./layout/DashboardLayout";

// Route guards
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// ✅ FIXED Dashboard Redirect (NO window.location)
const DashboardRedirect: React.FC = () => {
  const userRole = localStorage.getItem("role");

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  switch (userRole.toLowerCase()) {
    case "doctor":
      return <Navigate to="/dashboard/doctor" replace />;
    case "pharmacist":
      return <Navigate to="/dashboard/pharmacist" replace />;
    case "admin":
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>

        {/* ✅ Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ✅ Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* ✅ Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Auto redirect based on role */}
          <Route index element={<DashboardRedirect />} />

          {/* Role dashboards */}
          <Route path="doctor" element={<DoctorDashboard />} />
          <Route path="pharmacist" element={<PharmacistDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="messages" element={<MessageCenter />} />
        </Route>

        {/* ✅ Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
};

export default App;