import { axiosSecureInstance } from "./axios";

 
// API call to create company
export const createCompany = async (companyName, domain) => {
  const response = await axiosSecureInstance.post('/api/domain/create', { companyName, domain });
  return response;
};

// Add this function to your domainapi.js
export const checkCompanyName = async (companyName) => {
  return await axiosSecureInstance.post("/api/domain/check-name", { companyName });
};

// domainapi.js
export const getCompanies = async () => {
  const response =  axiosSecureInstance.get("/api/domain/fetchCompanyDetail"); // Update endpoint if needed
  return response;
};  


export const createRolesInCompany = async (companyId, roleName, description) => {
  try {
    const response = await axiosSecureInstance.post("/api/company-specific-roles/create-role", {
      companyId,
      roleName,
      description,
    });

    return response.data;
  } catch (error) {
    throw error;  // Rethrow the error to be handled in the component
  }
};

// API call to fetch roles by companyId
export const fetchRolesByCompanyId = async (companyId) => {
  try {
    const response = await axiosSecureInstance.get("/api/company-specific-roles/roles", {
      params: { companyId },  // Send companyId as query parameter
    });

    // Return success and data (roles)
    return { success: true, data: response.data.roles }; // Assuming 'roles' is the field that contains roles
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, message: error.response?.data?.message || "Error fetching roles" };
  }
};



//get compnay role acces matrix
export const fetchMatrixByCompanyId = async (companyId) => {
  try {
    const res = await axiosSecureInstance.get(`/api/role-access/matrix/${companyId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching matrix:', error);
    return { success: false };
  }
};




export const updateAccessMatrix = async (matrixData) => {
  return axiosSecureInstance.put('/api/role-access/bulk-update', matrixData)
    .then(res => res.data)
    .catch(err => {
      console.error('Bulk update failed:', err);
      return { success: false };
    });
};




export const getModuleAccess = async (companyId, roleName, role) => {
  try {
    const response = await axiosSecureInstance.get('/api/role-access/module-access', {
      params: {
        companyId,
        roleName,
        role,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Access API Error:", error);
    throw error;
  }
};

export const getAccessMatrixHistory = async (companyId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/role-access-history/matrix-history/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching access matrix history:", error.response?.data);
    throw error.response?.data || new Error("Failed to fetch history");
  }
};

export const logAccessMatrixChange = async (logData) => {
  try {
    const response = await axiosSecureInstance.post('/api/role-access-history/matrix-history/log', logData);
    return response.data;
  } catch (error) {
    console.error("Error logging access matrix change:", error.response?.data);
    // Don't throw error for logging failure, just log it. It's not critical for user flow.
    return { success: false };
  }
};

export const getAllRoles = async (companyId) => {
  try {
    const response = await axiosSecureInstance.get("/api/role-access/roles", {
      params: { companyId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, message: error.response?.data?.message || "Error fetching roles" };
  }
};

export const createSystemRole = async (roleName, description, companyId) => {
  try {
    const response = await axiosSecureInstance.post("/api/role-access/create-system-role", {
      roleName,
      description,
      companyId,
    });

    return response.data;
  } catch (error) {
    throw error;  // Rethrow the error to be handled in the component
  }
};




