// substreamapi.js

import { axiosSecureInstance } from "./axios";


export const createSubStream = async (data) => {
    try {
        const response = await axiosSecureInstance.post("api/sub-streams", data);
        return response;
    } catch (error) {
        console.error("Error creating sub-stream:", error);
        throw error;
    }
};


// export const getAllSubStreams = async (streamTitle) => {
//     try {
//         const response = await axiosSecureInstance.get(`api/sub-streams/${streamTitle}`);
//         return response;
//     } catch (error) {
//         console.error("Error fetching sub-streams:", error);
//         throw error;
//     }
// };

export const getAllSubStreams = async (streamTitle, workspacename) => {
    try {
        const response = await axiosSecureInstance.get(`api/sub-streams`, {
            params: { streamTitle , workspacename} //Correct way to send query params
        });
        return response;
    } catch (error) {
        console.error("Error fetching sub-streams:", error);
        throw error;
    }
};


export const deleteSubStreams = async (id) => {
    try {
        const response = await axiosSecureInstance.delete(`api/sub-streams/${id}`);
        return response;
    } catch (error) {
        console.error("Error deleting sub-stream:", error);
        throw error;
    }
};

export const updateSubStreams = async (id,streamData) => {
    try {
        const response = await axiosSecureInstance.put(`api/sub-streams/${id}`,streamData);
        return response;
    } catch (error) {
        console.error("Error updating sub-stream:", error);
        throw error;
    }
};