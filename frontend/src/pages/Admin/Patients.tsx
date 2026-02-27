import React from "react";

export default function Doctors() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Doctors</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">Name</th>
            <th className="border-b p-2">Email</th>
            <th className="border-b p-2">Phone</th>
            <th className="border-b p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <td className="p-2">Dr. John Doe</td>
            <td className="p-2">john@example.com</td>
            <td className="p-2">+256 700 000 000</td>
            <td className="p-2">
              <button className="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
              <button className="px-2 py-1 bg-red-500 text-white rounded ml-2">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}