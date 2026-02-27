import React from "react";
import { Link } from "react-router-dom";
import { FaChartLine, FaUserMd, FaUserInjured, FaPills, FaPrescriptionBottleAlt, FaTruck, FaCog } from "react-icons/fa";

const links = [
  { name: "Dashboard", icon: <FaChartLine />, path: "/dashboard" },
  { name: "Doctors", icon: <FaUserMd />, path: "/dashboard/doctors" },
  { name: "Pharmacists", icon: <FaUserMd />, path: "/dashboard/pharmacists" },
  { name: "Patients", icon: <FaUserInjured />, path: "/dashboard/patients" },
  { name: "Users", icon: <FaUserMd />, path: "/dashboard/users" },
  { name: "Prescriptions", icon: <FaPrescriptionBottleAlt />, path: "/dashboard" },
  { name: "Deliveries", icon: <FaTruck />, path: "/dashboard" },
  { name: "Settings", icon: <FaCog />, path: "/dashboard/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">Admin Panel</h1>
      <nav className="flex flex-col gap-4">
        {links.map((link) => (
          <Link key={link.name} to={link.path} className="flex items-center gap-3 hover:text-blue-500 text-gray-800 dark:text-gray-200">
            {link.icon} {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}