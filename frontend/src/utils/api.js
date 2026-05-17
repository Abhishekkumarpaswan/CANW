import axios from "axios";

const rawApiBaseUrl = import.meta.env.VITE_API_URL;

const API_BASE_URL = rawApiBaseUrl
  ? rawApiBaseUrl.endsWith("/api")
    ? rawApiBaseUrl
    : `${rawApiBaseUrl}/api`
  : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
};

export const notesAPI = {
  getAll: (params) => api.get("/notes", { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post("/notes", data),
  update: (id, data) => api.patch(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  archive: (id, data) => api.patch(`/notes/${id}/archive`, data),
  generateShareLink: (id) => api.post(`/notes/${id}/share`),
  revokeShareLink: (id) => api.delete(`/notes/${id}/share`),
};

export const aiAPI = {
  generateSummary: (noteId) => api.post(`/ai/${noteId}/summarize`),
};

export const dashboardAPI = {
  getInsights: () => api.get("/dashboard"),
};

export const publicAPI = {
  getSharedNote: (shareToken) => api.get(`/public/share/${shareToken}`),
};

export default api;
