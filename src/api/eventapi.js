import axios from "axios";
import { axiosSecureInstance } from "./axios";
import { message } from "antd";

export const fetchEventSessions = async (eventId) => {
  const res = await axiosSecureInstance.get(`/api/event/${eventId}/sessions`);
  return res.data;
};


export const getAllEvents = async () => {
  const response = await axiosSecureInstance.get("/api/event/");
  return response.data; 
};


export const toggleAttendance = async (eventId, sessionId, userId, isAttending) => {
  const res = await axiosSecureInstance.post(`/api/event/${eventId}/toggleattendance`, {
    userId,
    isAttending
  });
  return res.data;
};

export const createEvent = async (eventData) => {
  const res = await axiosSecureInstance.post(`/api/event/create`, eventData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const getAllUsers = async () => {
  const response = await axiosSecureInstance.get("/api/event/user");
  return response.data.users; // adjust if backend response structure differs
};


export const markAttendance = async (eventId, data) => {
  const res = await axiosSecureInstance.post(
    `/api/event/${eventId}/attendance`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data;
};

export const cancelEvent = async (eventId, reason) => {
  try {
    const res = await axiosSecureInstance.put(`/api/event/${eventId}/cancel`, { reason });
    return res.data;
  } catch (err) {
    console.error("Cancel Event API Error:", err);
    throw err;
  }
};

export const getUsersInWorkspace = async (workspaceId) => {
  const response = await axiosSecureInstance.get(`/api/event/workspace/${workspaceId}`);
  return response.data; // assumes backend sends list of users in .data
};
