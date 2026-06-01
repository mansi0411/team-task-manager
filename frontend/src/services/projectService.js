/**
 * Project API service
 */

import api from "../api/axios";

export const getProjects = async () => {
  const { data } = await api.get("/api/projects");
  return data;
};

export const createProject = async (name, description) => {
  const { data } = await api.post("/api/projects", { name, description });
  return data;
};
