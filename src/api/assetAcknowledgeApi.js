import { axiosSecureInstance } from "./axios";

export const getAcknowledgementById = async (id) => {
    try {
      const response = await axiosSecureInstance.get(`/api/asset-acknowledgement/request/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching acknowledgement:", error);
      throw error;
    }
  };

  export const updateAcknowledgementStatus = async (action, id) => {
    try {
      const response = await axiosSecureInstance.patch(`/api/asset-acknowledgement/${action}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error updating acknowledgement status:", error);
      throw error;
    }
  };

  export const getAllAcknowledgements = async () => {
    try {
      const response = await axiosSecureInstance.get("/api/asset-acknowledgement/all");
      return response.data.acknowledgements;
    } catch (error) {
      console.error("Error fetching acknowledgements:", error);
      throw error;
    }
  };