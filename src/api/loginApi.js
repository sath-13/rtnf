import { axiosSecureInstance } from "./axios";

export const loginUser = async (userData) => {
  try {
    const response = await axiosSecureInstance.post("/api/auth/login", userData);
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const googleLoginUser = async (email) => {
  try {
    const response = await axiosSecureInstance.post("/api/auth/google-login", { email });
    return response.data;
  } catch (error) {
    console.error("Google Login API Error:", error.response?.data || error.message);
    throw error;
  }
};