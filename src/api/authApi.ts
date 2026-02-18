// src/api/authApi.ts
import api from "./axiosInstance";

// FIXED: Ensure this is a named export that matches your hook's import
export const authApi = {
  register: async (data: any) => {
    const response = await api.post("/register/", data);
    return response.data;
  },
};