import { axiosSecureInstance } from "./axios";


export const saveTasks = async (userId, tasks, date) => {
  const res = await axiosSecureInstance.post("/api/task/save", {
    userId,
    tasks,
    date,
  });
  return res.data; 
};

export const deleteTaskById = async (taskId) => {
  const res = await axiosSecureInstance.delete(`/api/task/${taskId}`);
  return res.data;
};

export const getTasksByUser = async () => {
  const res = await axiosSecureInstance.get("/api/task/");
  return res.data.tasks;
};


