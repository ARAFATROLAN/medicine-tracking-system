import React from "react";
import DashboardSections from "../components/DashboardSections";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardSections />
    </div>
  );
}