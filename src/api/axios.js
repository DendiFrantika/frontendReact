import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json", // 🔥 penting
  },
  withCredentials: false, // 🔥 penting
});

// Attach token from localStorage to each request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;