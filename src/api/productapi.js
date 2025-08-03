import { axiosSecureInstance } from "./axios";


export const importProductData = async (formData) => {
  try {
    // Make a POST request to the route with the workspacename parameter in the URL
    const response = await axiosSecureInstance.post(`/api/product/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Import Product API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await axiosSecureInstance.post("/api/product/create", productData);
    return response.data;
  } catch (error) {
    console.error("Create Product API Error:", error.response?.data || error.message);
    throw error;
  }
};


export const getAllProductByWorkspacename = async (workspacename) => {
  try {
    const response = await axiosSecureInstance.get(`/api/product`, {
      params: { workspacename: workspacename }, 
    });
    return response.data;
  } catch (error) {
    console.error(" Error fetching products:", error.response?.data || error.message);
    return [];
  }
};

export const getAllProductByUser = async () => {
  try {
    const response = await axiosSecureInstance.get('/api/product/user-product'); 
    return response.data; 
  } catch (error) {
    console.error("Error fetching products:", error.response?.data || error.message); // Log errors
    return [];
  }
};

export const getSingleProduct = async (productId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Get Single Product API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await axiosSecureInstance.patch(`/api/product/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error("Update Product API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await axiosSecureInstance.delete(`/api/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Delete Product API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAllProducts = async () => {
  try {
    const response = await axiosSecureInstance.delete("/api/product/deleteAllProduct");
    return response.data;
  } catch (error) {
    console.error("Delete All Products API Error:", error.response?.data || error.message);
    throw error;
  }
};
