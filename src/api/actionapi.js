import { axiosSecureInstance } from "./axios";

export const createAction = async (data) => {
    try {
        const response = await axiosSecureInstance.post(`/api/actions/create`, data,{
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response;
    } catch (error) {
        console.error("Error creating action:", error);
        throw error;
    }
};

export const updateActionStatus = async (id, status) => {
  const response = await axiosSecureInstance.patch(`api/actions/${id}`, { status });
  return response.data;
};

export const updateActionText = async (id, description) => {
  const response = await axiosSecureInstance.put(`api/actions/${id}`, { description });
  return response.data;
};



export const getActions = async (userAssigned) => {
    const response = await axiosSecureInstance.get(`api/actions/${userAssigned}`);
    return response.data;
  };



export const getActionDetails = async (actionId) => {
  return await axiosSecureInstance.get(`/api/actions/action-details/${actionId}`);
};


// Fetch Action Details by ID
export const fetchActionDetails = async (actionId) => {
  try {

    const response = await axiosSecureInstance.get(`/api/actions/action/${actionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching action details:", error);
    throw error;
  }
};

export const notifyUser = async (id,data) => {
    return axiosSecureInstance.post(`api/notify-users/${id}`, data);
};

export const getActionFiles = async (actionId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/actions/${actionId}/files`);
    return response.data; // Return the file list
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};


// api/actionapi.js
export const addUserToAction = async (actionId, userId) => {
  try {
    
    const response = await axiosSecureInstance.patch(`/api/actions/${actionId}/addUserToAction`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error adding user to action:", error);
    throw error;
  }
};


// Fetch user details from backend
export const getUsernamesByIds = async (userIds) => {
  try {
    const response = await axiosSecureInstance.post("/api/user/get-usernames", { userIds });
    return response.data; // Returns a map of { "userId": "Full Name" }
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return {}; // Return empty object if error occurs
  }
};

export const removeUserFromAction = async (id, userId) => {
  const response = await axiosSecureInstance.delete(`api/actions/remove-user/${id}/${userId}`);
  return response.data;
};

export const updateAssignedUser = async (actionId, newUserId) => {
  return await axiosSecureInstance.put(`/api/actions/${actionId}/reassign`, { newUserId });
};
