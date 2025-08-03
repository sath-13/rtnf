import { axiosSecureInstance } from './axios';

export const fetchCategories = async () => {
  try {
    const response = await axiosSecureInstance.get('/api/assets/categories');
    return response;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const addCategory = async (data) => {
  try {
    const response = await axiosSecureInstance.post('/api/assets/categories', data);
    return response;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

export const fetchTypes = async (categoryId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/assets/types/${categoryId}`);
    return response;
  } catch (error) {
    console.error("Error fetching types:", error);
    throw error;
  }
};

export const addType = async (data) => {
  try {
    const response = await axiosSecureInstance.post('/api/assets/types', data);
    return response;
  } catch (error) {
    console.error("Error adding type:", error);
    throw error;
  }
};

export const updateType = async (id, data) => {
    try {
      const response = await axiosSecureInstance.put(`/api/assets/types/${id}`, data);
      return response;
    } catch (error) {
      console.error("Error updating type:", error);
      throw error;
    }
  };
  
  export const deleteType = async (id) => {
    try {
      const response = await axiosSecureInstance.delete(`/api/assets/types/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting type:", error);
      throw error;
    }
  };
  

  export const updateCategory = async (id, data) => {
    try {
      const response = await axiosSecureInstance.put(`/api/assets/categories/${id}`, data);
      return response;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  };
  
  export const deleteCategory = async (id) => {
    try {
      const response = await axiosSecureInstance.delete(`/api/assets/categories/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };
  
