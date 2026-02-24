import api from "./axiosInstance";

export const bookingService = {
  createBooking: (payload: any) => api.post("/bookings/", payload),

  // Added this based on our previous task for red dates
  getConfirmedBookings: async () => {
    const response = await api.get('/bookings?status=confirmed');
    return response.data.results || response.data;
  },

  getAllBookings: async () => {
    const response = await api.get('/bookings/');
    return response.data;
  }
};