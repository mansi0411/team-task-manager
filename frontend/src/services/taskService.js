/**
 * Task API service
 */

import api from "../api/axios";

export const getTasks = async () => {
  const { data } = await api.get("/api/tasks");
  return data;
};

export const createTask = async (taskData) => {
  const { data } = await api.post("/api/tasks", taskData);
  return data;
};

export const updateTaskStatus = async (taskId, status) => {
  const { data } = await api.patch(`/api/tasks/${taskId}/status`, { status });
  return data;
};
