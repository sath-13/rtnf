// streamapi.js

import { axiosSecureInstance } from "./axios";

export const getAllStreams = async (workspaceName) => {
    try {
        const response = await axiosSecureInstance.get(`api/streams/${workspaceName}`);
        return response;
    } catch (error) {
        console.error("Error fetching streams:", error);
        throw error;
    }
};

export const createStream = async (data) => {
    try {
        const response = await axiosSecureInstance.post("api/streams", data);
        return response;
    } catch (error) {
        console.error("Error creating stream:", error);
        throw error;
    }
};

export const deleteStream = async (id) => {
    try {
        const response = await axiosSecureInstance.delete(`api/streams/${id}`);
        return response;
    } catch (error) {
        console.error("Error deleting stream:", error);
        throw error;
    }
};

export const updateStream = async (id , streamData) => {
    try {
        const response = await axiosSecureInstance.put(`api/streams/${id}`,streamData);
        return response;
    } catch (error) {
        console.error("Error updating stream:", error);
        throw error;
    }
};