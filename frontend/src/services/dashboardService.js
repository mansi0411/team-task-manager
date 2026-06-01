/**
 * Dashboard API service
 */

import api from "../api/axios";

export const getDashboardStats = async () => {
  const { data } = await api.get("/api/dashboard");
  return data;
};
