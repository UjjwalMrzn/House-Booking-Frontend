import api from "./axiosInstance";

export const bookingService = {
  createBooking: (payload: any) => api.post("/bookings/", payload),

  getConfirmedBookings: async () => {
    const response = await api.get('/bookings/?status=confirmed');
    return response.data.results || response.data;
  },

  getAllBookings: async () => {
    const response = await api.get('/bookings/');
    // Safely handles both paginated and non-paginated responses
    return response.data.results || response.data;
  },

  // NEW: Backend Price Calculation Endpoint
  calculatePrice: async (payload: {
    property: number;
    check_in: string;
    check_out: string;
    guests: number;
    adults?: number;
    kids?: number;
  }) => {
    const response = await api.post('/bookings/calculatePrice/', payload);
    return response.data;
  }
};