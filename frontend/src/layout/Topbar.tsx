import React from "react";

interface Props {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Topbar({ darkMode, toggleDarkMode }: Props) {
  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <button
        onClick={toggleDarkMode}
        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  );
}