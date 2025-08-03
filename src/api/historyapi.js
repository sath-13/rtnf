import { axiosSecureInstance } from "./axios";

export const getActionHistory = async (actionId, page = 1, limit = 5) => {
  try {
    const response = await axiosSecureInstance.get(`api/history/${actionId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
};



// Function to log history
export const logHistory = async (historyData) => {
    try {
      const response = await axiosSecureInstance.post(`api/history/log`, historyData);
      return response.data;
    } catch (error) {
      console.error("Error logging history:", error.response?.data || error);
      throw error.response?.data || error;
    }
  };
  


