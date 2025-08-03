import { axiosSecureInstance } from "./axios";

export const getMonthlyAnniversariesAPI = async () => {
  try {
  const response = await axiosSecureInstance.get("/api/anniversaries/monthly");
  return response.data;
} catch (error) {
  console.error("Error fetching today's anniversaries:", error);
  throw error;
}
};