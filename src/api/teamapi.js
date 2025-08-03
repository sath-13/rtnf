// teamapi.js

import { axiosSecureInstance } from "./axios";

export const getAllTeams = async (workspaceName) => {
    try {
        const response = await axiosSecureInstance.get(`/api/teams/workspace/${workspaceName}`);
        return response;
    } catch (error) {
        console.error("Error fetching teams:", error);
        throw error;
    }
};
    
export const createTeam = async (data) => {
    try {
        const response = await axiosSecureInstance.post("api/teams", data);
        return response;
    } catch (error) {
        console.error("Error creating team:", error);
        throw error;
    }
};

export const deleteTeam = async (id) => {
    try {
        const response = await axiosSecureInstance.delete(`api/teams/${id}`);
        return response;
    } catch (error) {
        console.error("Error deleting team:", error);
        throw error;
    }
};

export const updateTeam = async (id, data) => {
    try {
      const response = await axiosSecureInstance.put(`api/teams/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };