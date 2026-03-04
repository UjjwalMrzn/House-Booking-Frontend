import api from "./axiosInstance";

export const paymentService = {
  getAllPayments: async (page: number = 1, pageSize: number = 10) => {
    const response = await api.get(`/payments/?page=${page}&page_size=${pageSize}`);
    return response.data;
  }
};