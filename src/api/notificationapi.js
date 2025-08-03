import { axiosSecureInstance } from "./axios";


export const getNotifications = async ({ userId }) => {
    const response = await axiosSecureInstance.get("/api/notifications", {
      params: { userId },
    });
    return response.data;
  };


  export const markNotificationAsRead = async (id) => {
    const response = await axiosSecureInstance.patch(`/api/notifications/${id}/read`);
    return response.data;
  };
  
  export const deleteNotification = async (id) => {
    const response = await axiosSecureInstance.delete(`/api/notifications/${id}`);
    return response.data;
  };

  export const markAllNotificationsAsRead = async ({ userId }) => {
    const response = await axiosSecureInstance.patch("/api/notifications/mark-all", null, {
      params: { userId },
    });
    return response.data;
  };