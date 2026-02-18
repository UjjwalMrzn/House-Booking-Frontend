// src/api/axiosInstance.ts
import axios from "axios";
// import { toast } from "react-toastify"; // Uncomment if you have react-toastify installed

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.10.3:9000',
  timeout: 10000, 
});

// 1. Request Interceptor (Adds token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor (Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        console.error("Connection timed out. Backend is not responding.");
        // toast.error("Connection timed out.");
      } else {
        console.error("Cannot connect to server.");
        // toast.error("Cannot connect to server.");
      }
      return Promise.reject(error);
    }

    if (error.response.status === 401 || error.response.status === 403) {
      localStorage.removeItem("token");
      // window.location.href = "/login"; // Uncomment to auto-redirect
    }
    
    return Promise.reject(error);
  }
);

export default api;