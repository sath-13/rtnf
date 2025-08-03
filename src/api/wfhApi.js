import { axiosSecureInstance } from "./axios";

export const importWFHRecords = async (records) => {
  try {
    const response = await axiosSecureInstance.post("/api/wfh/import", { records });
    return response.data;
  } catch (error) {
    console.error("WFH Import API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchWFHRecords = async (month = "2025-06") => {
  try {
    const response = await axiosSecureInstance.get(`/api/wfh/all?month=${month}`);
    return response.data;
  } catch (error) {
    console.error("WFH Fetch API Error:", error.response?.data || error.message);
    throw error;
  }
}; 

export const fetchAllWFHRecords = async (params = {}) => {
  try {
    const response = await axiosSecureInstance.get("/api/wfh/list", { params });
    return response.data;
  } catch (error) {
    console.error("WFH Fetch All API Error:", error.response?.data || error.message);
    throw error;
  }
}; 