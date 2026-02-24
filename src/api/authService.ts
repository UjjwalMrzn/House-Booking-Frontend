import api from "./axiosInstance";

export const authService = {
  login: (credentials: any) => api.post("/login/", credentials),
};