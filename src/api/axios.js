import axios from "axios";

export const axiosSecureInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8011",
  timeout: 3600000,
});

axiosSecureInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
   
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
   
  
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosSecureInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("selectedWorkspace");
      localStorage.removeItem("enteredWorkspaceName");
      
      // Force page reload to reset all React state
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);