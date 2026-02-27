import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaExclamationTriangle } from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const DashboardSections = () => {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (section: string) => setOpen(open === section ? null : section);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <button className="w-full px-6 py-3 flex justify-between" onClick={() => toggle("stats")}>
          <span className="font-semibold">Stats</span>
          {open === "stats" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {open === "stats" && <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded shadow">Doctors: 12</div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded shadow">Patients: 250</div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded shadow">Medicines: 340</div>
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded shadow">Pending Deliveries: 15</div>
        </div>}
      </div>

      {/* Charts Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <button className="w-full px-6 py-3 flex justify-between" onClick={() => toggle("charts")}>
          <span className="font-semibold">Charts</span>
          {open === "charts" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {open === "charts" && <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded shadow"><Line data={{labels:["Mon","Tue"], datasets:[{label:"Prescriptions", data:[12,19], borderColor:"rgb(59,130,246)", backgroundColor:"rgba(59,130,246,0.2)"}]}} /></div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded shadow"><Bar data={{labels:["Paracetamol","Ibuprofen"], datasets:[{label:"Stock", data:[120,80], backgroundColor:"rgba(16,185,129,0.7)"}]}} /></div>
        </div>}
      </div>

      {/* Low Stock Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <button className="w-full px-6 py-3 flex justify-between" onClick={() => toggle("lowStock")}>
          <span className="flex items-center gap-2 font-semibold text-red-600"><FaExclamationTriangle /> Low Stock Medicines</span>
          {open === "lowStock" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {open === "lowStock" && <ul className="p-6 list-disc pl-6 text-red-700 dark:text-red-400">
          <li>Aspirin – Only 3 left</li>
          <li>Vitamin D – Only 5 left</li>
        </ul>}
      </div>
    </div>
  );
};

export default DashboardSections;