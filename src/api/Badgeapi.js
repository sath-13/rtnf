import { notification } from "antd";
import { axiosSecureInstance } from "./axios";
import { BadgeMessages, CommonMessages } from "../constants/constants";
import { toastError, toastSuccess } from "../Utility/toast";

export const createBadgeAPI = async (badgeData) => {

  try {
    const response = await axiosSecureInstance.post('/api/badges/create', badgeData);

    if (response.data.success) {
      // notification.success({
      //   message: BadgeMessages.BADGE_CREATE_SUCC,
      //   description: response.data.message,
      // });
      toastSuccess({ title: BadgeMessages.BADGE_CREATE_SUCC, description: response.data.message });
      return response.data.badge;
    } else {
      // notification.error({
      //   message: CommonMessages.ERR_MSG,
      //   description: response.data.message || BadgeMessages.CREATE_FAIL,
      // });
      toastError({ title: CommonMessages.ERR_MSG, description: response.data.message || BadgeMessages.CREATE_FAIL });
    }
  } catch (error) {
    console.error(" API Error:", error.response?.data || error); // Log exact backend error

    // notification.error({
    //   message: CommonMessages.ERR_MSG,
    //   description: error.response?.data?.message || BadgeMessages.SOMETHING_WENT_WRONG,
    // });
    toastError({ title: CommonMessages.ERR_MSG, description: error.response?.data?.message || BadgeMessages.SOMETHING_WENT_WRONG });
  }
};

export const getBadgesAPI = async (workspacename) => {
  try {
    const response = await axiosSecureInstance.get(`api/badges/get-all/${workspacename}`);  // Update the URL based on your backend endpoint
    if (response.data.success) {
      return response.data.badges;  // Return the list of badges
    } else {
      // notification.error({
      //   message: CommonMessages.ERR_MSG,
      //   description: response.data.message,
      // });
      toastError({ title: CommonMessages.ERR_MSG, description: response.data.message });
    }
  } catch (error) {
    // notification.error({
    //   message: CommonMessages.ERR_MSG,
    //   description: BadgeMessages.SOMETHING_WENT_WRONG,
    // });
    toastError({ title: CommonMessages.ERR_MSG, description: BadgeMessages.SOMETHING_WENT_WRONG });
    console.error(error);
  }
};

export const getAllSuperadminBadges = async () => {
  try {
    const response = await axiosSecureInstance.get('api/badges/get-allbadges');  // Update the URL based on your backend endpoint
    if (response.data.success) {
      return response.data.badges;  // Return the list of badges
    } else {
      // notification.error({
      //   message: CommonMessages.ERR_MSG,
      //   description: response.data.message,
      // });
      toastError({ title: CommonMessages.ERR_MSG, description: response.data.message });
    }
  } catch (error) {
    // notification.error({
    //   message: CommonMessages.ERR_MSG,
    //   description: BadgeMessages.SOMETHING_WENT_WRONG,
    // });
    toastError({ title: CommonMessages.ERR_MSG, description: BadgeMessages.SOMETHING_WENT_WRONG });
    console.error(error);
  }
};

export const assignBadge = async (badgeData) => {
  try {
    const response = await axiosSecureInstance.post("/api/badges/assigned-badge", badgeData);
    return response.data;
  } catch (error) {
    console.error("Assign Badge API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteBadgeAPI = async (badgeId) => {
  try {
    const response = await axiosSecureInstance.delete(`api/badges/${badgeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: BadgeMessages.FAIL_TO_DELETE };
  }
};



export const getUserBadgesAPI = async () => {
  try {
    const response = await axiosSecureInstance.get(`/api/badges/get-badges`);
    return response.data.success ? response.data.badges : [];
  } catch (error) {
    console.error("Fetch Badges API Error:", error);
    return [];
  }
};


export const getPerUserBadgesAPI = async (userId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/badges/user-badges/${userId}`);
    return response.data.success ? response.data.badges : [];
  } catch (error) {
    console.error("Fetch Badges API Error:", error);
    return [];
  }
};


export const getPublicAssignedBadgesAPI = async (workspacename) => {
  try {
    const response = await axiosSecureInstance.get(`/api/badges/publicBadges/${workspacename}`);
    return response.data;
  } catch (error) {
    console.error("Fetch Assigned Badges API Error:", error);
    return [];
  }
};



export const getBadgesForUserTeam = async (team) => {
  try {
    const response = await axiosSecureInstance.get(`/api/badges/teamBadges/${team}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team badges:", error);
    return [];
  }
};


