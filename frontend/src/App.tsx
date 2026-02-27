import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

// Layouts
import DashboardLayout from "./layout/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Admin/Doctors";
import Pharmacists from "./pages/Admin/Pharmacists";
import Patients from "./pages/Admin/Patients";
import Users from "./pages/Admin/Users";
import Settings from "./pages/Admin/Settings";

// Protected route
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="pharmacists" element={<Pharmacists />} />
          <Route path="patients" element={<Patients />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;