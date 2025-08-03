import { axiosSecureInstance } from "./axios";

export const resetPassword = async  (token, password) => {
    try {
      const response = await axiosSecureInstance.post(`api/auth/reset-password/${token}`, { password });
      return response.data;

    } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
  };   

  export const getVerifyToken = async  (token) => {
    try {
      const response = await axiosSecureInstance.get(`api/auth/verify-reset-token/${token}`);
      return response.data;

    } catch (error) {
        console.error("Error verifying token:", error);
        throw error;
    }
  };  

  export const forgotPassword = async  (email) => {
    try {
      const response = await axiosSecureInstance.post("api/auth/forgot-password",{ email });
      return response.data;

    } catch (error) {
        console.error("Error in forgot password:", error);
        // Re-throw the error so the calling component can handle it
        throw error;
    }
  };
