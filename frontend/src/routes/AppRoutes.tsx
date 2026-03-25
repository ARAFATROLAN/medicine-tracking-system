import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";

import Overview from "../pages/Dashboard/dashboard"; // watch case carefully
import DoctorDashboard from "../pages/doctorDashboard";
import PharmacistDashboard from "../pages/pharmacistDashboard";
import AdminDashboard from "../pages/adminDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="doctor" element={<DoctorDashboard />} />
        <Route path="pharmacist" element={<PharmacistDashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}