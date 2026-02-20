import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        console.error("Connection timed out. Backend is not responding.");
      } else {
        console.error("Cannot connect to server. Check your .env or network.");
      }
      return Promise.reject(error);
    }
    if (error.response.status === 401 || error.response.status === 403) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;