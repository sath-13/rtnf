import { axiosSecureInstance } from "./axios";




export const getAllBranches = async () => {
    try {
        const response = await axiosSecureInstance.get("/api/company/branches");
        return response.data; // ✅ Ensure only the array is returned
    } catch (error) {
        console.error("Error fetching branches:", error);
        return []; // 🔴 Ensure it doesn't return undefined
    }
};

export const getCompanyById = async (companyId) => {
  const response = await axiosSecureInstance.get(`/api/company/${companyId}`);
  return response.data;
};

export const getCompanyDetails = async () => {
    try {
      const { data } = await axiosSecureInstance.get("/api/company/details");
      return data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch company details" };
    }
  };

  export const updateCompanyDetails = async (payload) => {
    try {
      const response = await axiosSecureInstance.post("/api/company/details", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update company details" };
    }
  };
