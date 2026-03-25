// src/App.tsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Doctors from "./pages/Admin/Doctors";
import Pharmacists from "./pages/Admin/Pharmacists";
import Patients from "./pages/Admin/Patients";
import Users from "./pages/Admin/Users";
import Settings from "./pages/Admin/Settings";

// Layouts
import DashboardLayout from "./layout/DashboardLayout";

// Route guards
import AuthorizedRoute from "./components/AuthorizedRoute";
import PublicRoute from "./components/PublicRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
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

        {/* Protected dashboard route - only accessible if authenticated and authorized */}
        <Route
          path="/dashboard"
          element={
            <AuthorizedRoute allowedRoles={["Doctor", "Pharmacist", "Admin", "User"]}>
              <DashboardLayout />
            </AuthorizedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="pharmacists" element={<Pharmacists />} />
          <Route path="patients" element={<Patients />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;