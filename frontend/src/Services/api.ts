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


// API FUNCTIONS

const fetchDashboardStats = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};


// REGISTER USER
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


// LOGIN USER
const loginUser = async (email: string, password: string) => {

  const response = await api.post("/login", {
    email,
    password
  });

  return response.data;
};


// EXPORT
export default {
  fetchDashboardStats,
  registerUser,
  loginUser,
};