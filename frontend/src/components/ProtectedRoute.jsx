import AuthorizedRoute from "./components/AuthorizedRoute";

// Example: Only allow Doctors and Pharmacists
<Route
  path="/dashboard"
  element={
    <AuthorizedRoute allowedRoles={["Doctor", "Pharmacist", "Admin"]}>
      <DashboardLayout />
    </AuthorizedRoute>
  }
>
  {/* nested routes here */}
</Route>