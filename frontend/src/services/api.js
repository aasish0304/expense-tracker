import axios from "axios";
import { logoutUser } from "./authService";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized requests
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      logoutUser();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;