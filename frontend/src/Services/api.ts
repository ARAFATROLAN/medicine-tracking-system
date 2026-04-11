// src/services/api.ts

import axios from "axios";

// Base API URL
const baseURL: string = "http://localhost:8000/api/v1";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Alias for compatibility
const api = axiosInstance;

// Export for direct use if needed
export { axiosInstance };

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

const registerMedicine = async (data: any) => {
  const response = await api.post("/medicines/register", data);
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

const createHospital = async (data: any) => {
  const response = await api.post(`/dashboard/hospitals`, data);
  return response.data;
};

const updateHospital = async (id: number, data: any) => {
  const response = await api.put(`/dashboard/hospitals/${id}`, data);
  return response.data;
};

const deleteHospital = async (id: number) => {
  const response = await api.delete(`/dashboard/hospitals/${id}`);
  return response.data;
};

const fetchDevices = async (hospitalId?: number, page = 1) => {
  const query = hospitalId ? `?hospital_id=${hospitalId}&page=${page}` : `?page=${page}`;
  const response = await api.get(`/dashboard/devices${query}`);
  return response.data;
};

const createDevice = async (data: any) => {
  const response = await api.post(`/dashboard/devices`, data);
  return response.data;
};

const updateDevice = async (id: number, data: any) => {
  const response = await api.put(`/dashboard/devices/${id}`, data);
  return response.data;
};

const deleteDevice = async (id: number) => {
  const response = await api.delete(`/dashboard/devices/${id}`);
  return response.data;
};

const fetchHospitalDevices = async (hospitalId: number, page = 1) => {
  return fetchDevices(hospitalId, page);
};

const createHospitalDevice = async (hospitalId: number, data: any) => {
  return createDevice({ ...data, hospital_id: hospitalId });
};

const updateHospitalDevice = async (id: number, data: any) => {
  return updateDevice(id, data);
};

const deleteHospitalDevice = async (id: number) => {
  return deleteDevice(id);
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

// ============ SEAL MANAGEMENT ============

const getPrintableSeal = async (sealCode: string) => {
  const response = await api.get(`/seals/${sealCode}/print`);
  return response.data;
};

const getSealDetails = async (sealCode: string) => {
  const response = await api.get(`/seals/${sealCode}`);
  return response.data;
};

const verifySeal = async (sealCode: string) => {
  const response = await api.post(`/seals/verify`, { seal_code: sealCode });
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

const updatePassword = async (data: any) => {
  const response = await api.put('/dashboard/password', data);
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
  registerMedicine,
  
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
  createHospital,
  updateHospital,
  deleteHospital,
  fetchHospitalDevices,
  createHospitalDevice,
  updateHospitalDevice,
  deleteHospitalDevice,
  
  // Branch Devices
  fetchDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  
  // Seals
  getPrintableSeal,
  getSealDetails,
  verifySeal,
  
  // Settings
  updatePassword,
  
  // Auth
  registerUser,
  loginUser,
};