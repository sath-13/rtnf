import { axiosSecureInstance } from "./axios";

// Create Assigned Product
export const createAssignedProduct = async (productData) => {
  try {
    const response = await axiosSecureInstance.post("/api/assigned-product", productData);
    return response.data;
  } catch (error) {
    console.error("Create Assigned Product API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllAssignedProductByWorkspacename = async (workspacename) => {
  try {
    const response = await axiosSecureInstance.get(`/api/assigned-product`, {
      params: { workspacename }, // Pass workspace name as a query parameter
    });
    return response.data;
  } catch (error) {
    console.error(" Error fetching assigned products:", error.response?.data || error.message);
    return [];
  }
};

// Get Single Assigned Product
export const getSingleAssignedProduct = async (id) => {
  try {
    const response = await axiosSecureInstance.get(`/api/assigned-product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get Single Assigned Product API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Get Assigned Products for Current User
export const getCurrentUserAssignedProducts = async () => {
  try {
    const response = await axiosSecureInstance.get("/api/assigned-product/current-user");
    return response.data;
  } catch (error) {
    console.error("Get Current User Assigned Products API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Remove Assigned Product (Set status to inactive)
export const removeAssignedProduct = async (id) => {
  try {
    const response = await axiosSecureInstance.patch(`/api/assigned-product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Remove Assigned Product API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Delete All Assigned Products
export const deleteAllAssignedProducts = async () => {
  try {
    const response = await axiosSecureInstance.delete("/api/assigned-product");
    return response.data;
  } catch (error) {
    console.error("Delete All Assigned Products API Error:", error.response?.data || error.message);
    throw error;
  }
};
