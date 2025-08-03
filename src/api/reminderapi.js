// src/api/reminderApi.js
import { axiosSecureInstance } from "./axios";

// 📌 Create Reminder
export const createReminder = async (data) => {
  try {
    const response = await axiosSecureInstance.post("/api/reminders/create", data);
    return response.data;
  } catch (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }
};

// 📌 Get Reminders by Workspace
export const getRemindersByWorkspace = async (workspaceName, companyId, userId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/reminders/${workspaceName}`, {
      params: { companyId, userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    throw error;
  }
};
