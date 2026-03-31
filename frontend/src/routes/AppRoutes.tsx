import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Overview from "../pages/Dashboard/overview"; // watch case carefully
import DoctorDashboard from "../pages/doctorDashboard";
import PharmacistDashboard from "../pages/pharmacistDashboard";
import AdminDashboard from "../pages/AdminDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route
          path="doctor"
          element={
            <ProtectedRoute requiredRole="Doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="pharmacist"
          element={
            <ProtectedRoute requiredRole="Pharmacist">
              <PharmacistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}