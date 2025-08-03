import { UserMessages } from "../constants/constants";
import { axiosSecureInstance } from "./axios";

export const createUser = async (userData) => {
  try {
    const response = await axiosSecureInstance.post("api/user/create-user", userData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteUserFromWorkspace = async (id, workspaceName) => {
  try {
    const response = await axiosSecureInstance.delete(`api/user/${id}`, {
      data: { workspaceName }, // Sending workspaceName in request body
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};

  

// Fetch users in a specific workspace
export const getUsersInWorkspace = async (workspaceName) => {
    try {
      const response = await axiosSecureInstance.get(`api/user/${workspaceName}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: UserMessages.FETCH_USERS_ERR };
    }
  };
  

  export const getUsersByStream = async (streamTitle, workspaceName) => {
    try {
        const response = await axiosSecureInstance.get(`api/user/stream/${streamTitle}/${workspaceName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users by stream:', error);
        return [];
    }
};

export const resendResetEmails = async (workspaceName) => {
  try {
      const response = await axiosSecureInstance.post(`api/user/resend-reset-emails`, { workspaceName });
      return response.data;
  } catch (error) {
      console.error("Error resending reset emails:", error);
      return { message: UserMessages.FAILED_TO_SEND_EMAILS };
  }
};



export const checkUsernameAvailability = async (username) => {
    try {
      const response = await axiosSecureInstance.get(`api/user/check-username/${username}`);
      return response.data;
    } catch (error) {
      return { error: error.response?.data?.msg || "Error checking username" };
    }
  };

  export const checkEmailAvailability = async (email, workspaceName) => {
    try {
        const response = await axiosSecureInstance.get(`api/user/check-email/${email}/${workspaceName}`);
        return response.data;
    } catch (error) {
        return { error: error.response?.data?.msg || "Error checking email" };
    }
};

export const updateUserStatus = async (id, status) => {
  try {
    const response = await axiosSecureInstance.put(`api/user/status/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update user status";
  }
};

export const updateUserTeamTitle = async (id, teamTitle) => {
  try {
    const response = await axiosSecureInstance.put(`api/user/teamTitle/${id}`, { teamTitle });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update user teamTitle";
  }
};


// Update user by sending FormData (including a file if provided)
export const updateUser = async (userId, formData) => {
  const response = await axiosSecureInstance.put(`api/user/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};


export const AdminsIsUpdatingUser = async (id, updatedData) => {
  try {
    let config = {};
    let dataToSend = updatedData;
    if (updatedData instanceof FormData) {
      config.headers = { "Content-Type": "multipart/form-data" };
    }
    const response = await axiosSecureInstance.put(`/api/user/admin/${id}`, dataToSend, config);
    return response.data;
  } catch (error) {
    console.error("API Error while updating user:", error.response?.data || error.message);
    throw error;
  }
};

export const importUsers = async (formData) => {
  try {
    const response = await axiosSecureInstance.post("/api/user/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; //Ensure only the data is returned
  } catch (error) {
    throw error.response ? error.response.data : error; //Handle API errors properly
  }
};

export const transferUsersToWorkspace = async (userIds, targetWorkspace) => {
  try {
    const response = await axiosSecureInstance.post("/api/user/transfer", {
      userIds,
      targetWorkspace,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to transfer users");
  }
};

export const replicaUsersToWorkspace = async (userIds, targetWorkspace) => {
  try {
    const response = await axiosSecureInstance.post("/api/user/replica-users", {
      userIds,
      targetWorkspace,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to replicate users");
  }
};

export const getAllUsersFromWorkspaces = async (email) => {
  if (!email) throw new Error("Email is required");

  try {
    const response = await axiosSecureInstance.get(`/api/user/workspace-users/${email}`);
    return response.data;
  } catch (error) {
    console.error(" Error fetching users from workspaces:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || "Failed to fetch users");
  }
};




export const getUserProfileByKey = async (key) => {
  if (!key) throw new Error("User key is required");

  try {
    const response = await axiosSecureInstance.get(`/api/user/key/${key}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by key:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || "Failed to fetch user");
  }
};





export const importUsersProfileData = async (payload) => {
  try {
    const response = await axiosSecureInstance.post("/api/import-user-profiles", payload);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};








export const getImportUserDetails = async () => {
  try {
    const response = await axiosSecureInstance.get("/api/import-user-profiles");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to fetch imported user profiles");
  }
};

