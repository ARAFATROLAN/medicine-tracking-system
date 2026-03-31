// src/services/api.ts

import axios from "axios";

// Base API URL
const baseURL: string = "http://localhost:8000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ERROR INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// ============ DASHBOARD & STATS ============

const fetchDashboardStats = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

const fetchSystemHealth = async () => {
  const response = await api.get("/dashboard/system-health");
  return response.data;
};

// ============ USER MANAGEMENT ============

const fetchUsers = async (page = 1) => {
  const response = await api.get(`/dashboard/users?page=${page}`);
  return response.data;
};

const getUser = async (id: number) => {
  const response = await api.get(`/dashboard/users/${id}`);
  return response.data;
};

const updateUser = async (id: number, data: any) => {
  const response = await api.put(`/dashboard/users/${id}`, data);
  return response.data;
};

const deleteUser = async (id: number) => {
  const response = await api.delete(`/dashboard/users/${id}`);
  return response.data;
};

// ============ MEDICINE MANAGEMENT ============

const fetchMedicines = async (page = 1) => {
  const response = await api.get(`/dashboard/medicines?page=${page}`);
  return response.data;
};

const getMedicine = async (id: number) => {
  const response = await api.get(`/dashboard/medicines/${id}`);
  return response.data;
};

const updateMedicine = async (id: number, data: any) => {
  const response = await api.put(`/dashboard/medicines/${id}`, data);
  return response.data;
};

// ============ DELIVERY MANAGEMENT ============

const fetchDeliveries = async (page = 1, status?: string) => {
  const url = status 
    ? `/dashboard/deliveries?page=${page}&status=${status}`
    : `/dashboard/deliveries?page=${page}`;
  const response = await api.get(url);
  return response.data;
};

const getDelivery = async (id: number) => {
  const response = await api.get(`/dashboard/deliveries/${id}`);
  return response.data;
};

const updateDeliveryStatus = async (id: number, status: string, notes?: string) => {
  const response = await api.put(`/dashboard/deliveries/${id}/status`, {
    status,
    notes,
  });
  return response.data;
};

// ============ INVENTORY MANAGEMENT ============

const fetchInventory = async (page = 1) => {
  const response = await api.get(`/dashboard/inventory?page=${page}`);
  return response.data;
};

const updateInventory = async (id: number, data: any) => {
  const response = await api.put(`/dashboard/inventory/${id}`, data);
  return response.data;
};

// ============ ACTIVITY LOGS ============

const fetchActivityLogs = async (page = 1, model?: string) => {
  const url = model
    ? `/dashboard/activity-logs?page=${page}&model=${model}`
    : `/dashboard/activity-logs?page=${page}`;
  const response = await api.get(url);
  return response.data;
};

// ============ NOTIFICATIONS ============

const fetchNotifications = async (page = 1) => {
  const response = await api.get(`/dashboard/notifications?page=${page}`);
  return response.data;
};

const markNotificationRead = async (id: number) => {
  const response = await api.put(`/dashboard/notifications/${id}/read`);
  return response.data;
};

// ============ REPORTS & ANALYTICS ============

const fetchReports = async () => {
  const response = await api.get("/dashboard/reports");
  return response.data;
};

// ============ HOSPITALS ============

const fetchHospitals = async (page = 1) => {
  const response = await api.get(`/dashboard/hospitals?page=${page}`);
  return response.data;
};

// ============ PRESCRIPTION MANAGEMENT ============

const fetchPrescriptions = async (page = 1) => {
  const response = await api.get(`/prescriptions?page=${page}`);
  return response.data;
};

const getPrescription = async (id: number) => {
  const response = await api.get(`/prescriptions/${id}`);
  return response.data;
};

const createPrescription = async (data: any) => {
  const response = await api.post("/prescriptions", data);
  return response.data;
};

const updatePrescription = async (id: number, data: any) => {
  const response = await api.put(`/prescriptions/${id}`, data);
  return response.data;
};

const deletePrescription = async (id: number) => {
  const response = await api.delete(`/prescriptions/${id}`);
  return response.data;
};

// ============ PATIENT MANAGEMENT ============

const fetchPatients = async (page = 1) => {
  const response = await api.get(`/patients?page=${page}`);
  return response.data;
};

const getPatient = async (id: number) => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

const createPatient = async (data: any) => {
  const response = await api.post("/patients", data);
  return response.data;
};

const updatePatient = async (id: number, data: any) => {
  const response = await api.put(`/patients/${id}`, data);
  return response.data;
};

const deletePatient = async (id: number) => {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
};

// ============ SETTINGS ============

const fetchSettings = async () => {
  const response = await api.get("/dashboard/settings");
  return response.data;
};

// ============ AUTHENTICATION ============

const registerUser = async (
  name: string,
  email: string,
  password: string,
  contact: string,
  specialisation: string
) => {
  const response = await api.post("/register", {
    name,
    email,
    password,
    contact,
    specialisation
  });
  return response.data;
};

const loginUser = async (email: string, password: string) => {
  const response = await api.post("/login", {
    email,
    password
  });
  return response.data;
};

// ============ EXPORT ============

export default {
  // Dashboard
  fetchDashboardStats,
  fetchSystemHealth,
  
  // Users
  fetchUsers,
  getUser,
  updateUser,
  deleteUser,
  
  // Medicines
  fetchMedicines,
  getMedicine,
  updateMedicine,
  
  // Deliveries
  fetchDeliveries,
  getDelivery,
  updateDeliveryStatus,
  
  // Inventory
  fetchInventory,
  updateInventory,
  
  // Prescriptions
  fetchPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
  
  // Patients
  fetchPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  
  // Activity Logs
  fetchActivityLogs,
  
  // Notifications
  fetchNotifications,
  markNotificationRead,
  
  // Reports
  fetchReports,
  
  // Hospitals
  fetchHospitals,
  
  // Settings
  fetchSettings,
  
  // Auth
  registerUser,
  loginUser,
};