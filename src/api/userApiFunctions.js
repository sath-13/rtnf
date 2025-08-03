import { axiosSecureInstance } from "./axios";
import { FETCH_SINGLE_USER_INFO } from "./user_api_constant";
import { GET_USER_PROFILE_API_SLUG } from "../constants/Api_constants";
import Spinner from "../components/Spinner/Spinner";

export const getUserData = async (userId, setRole) => {
  if (!userId) {
    return { success: false, error: "User ID is required" };
  }
  try {
    const userid = { userId };
    const response = await axiosSecureInstance.post(FETCH_SINGLE_USER_INFO(), userid);
    const role = response?.data?.user?.role;
    setRole(role);
    return { success: true, data: role };
  } catch (error) {
    setRole(null);
    return { success: false, error };
  }
};

export const getUserAvatar = async (userId) => {
  if (!userId) {
    return null
  }
  try {
    const userid = {
      userId: userId,
    };
    if (!userId) {
      return null
    }
    const response = await axiosSecureInstance.post(
      FETCH_SINGLE_USER_INFO(),
      userid
    );

    return { success: true, data: response?.data?.user?.userAvatar };
  } catch (error) {
    return { success: false, error };
  }
};

export const getRoleOfUser = async (userId, userRole, setUserRole, setIsPublic) => {
  if (userId === null) {
    setUserRole("user");
    setIsPublic(false);
    return <Spinner />;
  } else {
    try {
      const response = await axiosSecureInstance.post(GET_USER_PROFILE_API_SLUG, {
        "userId": userId
      });
      const userInfo = response.data.user.role;
      setUserRole(userInfo);
    } catch (error) {
      throw new Error(error);
    }
  }
};