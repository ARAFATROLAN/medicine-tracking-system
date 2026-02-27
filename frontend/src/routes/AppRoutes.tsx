import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Overview from "../pages/dashboard/Overview";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
      </Route>
    </Routes>
  );
}