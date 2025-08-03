import { axiosSecureInstance } from "./axios";

export const createPostAPI = async ({ content, target, workspacename, teamname }) => {
  const response = await axiosSecureInstance.post(`/api/posts`, {
    content,
    target,
    workspacename,
    teamname: target === "team" ? teamname : undefined,
  });
  return response.data;
};


export const getPostsByWorkspace = async (workspacename) => {
  const response = await axiosSecureInstance.get(`/api/posts/workspace/${workspacename}`);
  return response.data;
};

export const getPostsByTeam = async (teamname) => {
    const response = await axiosSecureInstance.get(`/api/posts/team/${teamname}`);
    return response.data;
  };
  