import { axiosSecureInstance } from "./axios";

export const submitHiringRequest = async (formData) => {
  const res = await axiosSecureInstance.post("/api/hiring-request/save", formData);
  return res.data;
};

export const getAllHiring = async (jobRole, userId) => {
  const data = await axiosSecureInstance.get(`/api/hiring-request?jobRole=${jobRole}&userId=${userId}`);
  return data.data;
};

export const getAllHiringInInbox = async ({ jobRole, userId } = {}) => {
  const params = {};
  if (jobRole) params.jobRole = jobRole;
  if (userId) params.userId = userId;

  const res = await axiosSecureInstance.get("/api/hiring-request", {
    params,
  });

  return res.data;
};


export const postDecision = async (id, status, reason) => {
  const res = await axiosSecureInstance.patch(
    `/api/hiring-request/${id}/decision`,
    { id, status, reason }
  );
  return res.data;
};

export const getAllUsers = async () => {
  const res = await axiosSecureInstance.get('/api/hiring-request/users');
  return res.data;
};


export const getJobById = async (id) => {
  const res = await axiosSecureInstance.get(`/api/hiring-request/jobs/${id}`);
  return res.data;
};