import api from "./axiosInstance";

export const paymentService = {
  getAllPayments: async () => {
    const response = await api.get('/payments/');
    return response.data.results || response.data;
  }
};