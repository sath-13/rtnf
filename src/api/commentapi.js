import { axiosSecureInstance } from "./axios";

export const fetchComments = async (actionId) => {
  const response = await axiosSecureInstance.get(`api/comments/${actionId}`);
  return response.data;
};

export const createComment = async (commentData) => {
  const response = await axiosSecureInstance.post("api/comments", commentData);
  return response.data;
};


export const deleteComment = async (commentId) => {
  const response = await axiosSecureInstance.delete(`api/comments/${commentId}`);
  return response.data;
};