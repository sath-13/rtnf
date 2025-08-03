import { axiosSecureInstance } from "./axios";

export const getAllWorkspaces = async () => {
  let response = await axiosSecureInstance.get("api/workspace/all");
  return response;
};

export const checkWorkspaceAvailability = async (workspacename) => {
  try {
    const response = await axiosSecureInstance.get(`api/workspace/check-workspacename/${workspacename}`);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.msg || "Error checking workspacename" };
  }
};

// export const getUserWorkspaces = async () => {
//   let response = await axiosSecureInstance.get("api/workspace/user-workspaces", {
//     headers: {  },
//   });
//   return response;
// };

export const getUserWorkspaces = async (email) => {
  const response =  await axiosSecureInstance.get(`/api/workspace/user/${email}`);
  return response;
};

export const createWorkspace = async (data) => {
  try {
    let response =  await axiosSecureInstance.post("/api/workspace/create", data, {
      headers: {
        "Content-Type": "multipart/form-data", // This ensures the formData is sent correctly
      },
    });

    return response;
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteWorkspace = async (id) => {
   let response = await axiosSecureInstance.delete(`/api/workspace/${id}`, {
      headers: {  },
    });
    return response;
  };

  export const getWorkspaceByName = async (workspacename) => {
    try {
      const response = await axiosSecureInstance.get(`/api/workspace/workspacename/${workspacename}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching workspace:", error);
      return null;
    }
  };


  export const updateWorkspace = async (workspaceId, updatedData) => {
    return await axiosSecureInstance.put(`/api/workspace/update/${workspaceId}`, updatedData);
  };
  

  export const updateWorkspaceLogo = async (workspaceId, formData) => {
    return await axiosSecureInstance.put(`/api/workspace/update-logo/${workspaceId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};


export const checkWorkspaceName = async (workspaceName) => {
  try {
    const response = await axiosSecureInstance.get(`/api/workspace/check-name`, {
      params: { workspacename: workspaceName
       },
    });
    return response.data.exists; // true if workspace exists, false otherwise
  } catch (error) {
    console.error("Error checking workspace name:", error);
    return false;
  }
};

export const checkWorkspaceEditName = async (workspaceName, workspaceId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/workspace/check-name-edit`, {
      params: { workspacename: workspaceName
        , workspaceId
       },
    });
    return response.data.exists; 
  } catch (error) {
    console.error("Error checking workspace name:", error);
    return false;
  }
};
