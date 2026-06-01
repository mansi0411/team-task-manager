/**
 * Authentication service — login, register, logout, token helpers
 */

import api from "../api/axios";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const login = async (email, password) => {
  const { data } = await api.post("/api/auth/login", { email, password });

  // Save token and user so we can check role (admin vs member)
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data;
};

export const register = async (name, email, password, role) => {
  const { data } = await api.post("/api/auth/register", {
    name,
    email,
    password,
    ...(role && { role }),
  });

  return data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => Boolean(getToken());

export const isAdmin = () => getUser()?.role === "admin";
