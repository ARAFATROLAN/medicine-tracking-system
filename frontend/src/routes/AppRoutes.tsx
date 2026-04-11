import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Overview from "../pages/Dashboard/overview"; // watch case carefully
import DoctorDashboard from "../pages/doctorDashboard";
import PharmacistDashboard from "../pages/pharmacistDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import SealScanner from "../components/SealScanner";
import SealGenerator from "../components/SealGenerator";

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
        <Route path="seal-scanner" element={<SealScanner />} />
        <Route path="seal-generator" element={<SealGenerator />} />
      </Route>
    </Routes>
  );
}
