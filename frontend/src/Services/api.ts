// src/services/api.ts

const BASE_URL = "http://127.0.0.1:8000/api/v1";

export const fetchDashboardStats = async () => {
  const response = await fetch(`${BASE_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
};