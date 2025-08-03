import { axiosSecureInstance } from "./axios";
// Register a new user
export const registerUser = async (userData) => {
  console.log("before register");
  try {
    const response = await axiosSecureInstance.post(
      "api/auth/register",
      userData
    );
    console.log("after register");
    return response.data;
  } catch (error) {
    console.error(
      "Registration API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const checkEmailAvailability = async (email) => {
  try {
    const response = await axiosSecureInstance.get(
      `/api/auth/check-email/${email}`
    );
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.msg || "Error checking email" };
  }
};
