import { axiosSecureInstance } from "./axios";

export const uploadFile = async (actionId,data) => {
    try {
        const response = await axiosSecureInstance.post(`/api/actions/${actionId}/upload`, data,{
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};