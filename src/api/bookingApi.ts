import api from "./axiosInstance";

export const bookingService = {
  createBooking: (payload: any) => api.post("/bookings/", payload),

  getConfirmedBookings: async () => {
    const response = await api.get('/bookings/?status=confirmed');
    return response.data.results || response.data;
  },

  getAllBookings: async (page: number = 1, pageSize: number = 10) => {
    const response = await api.get(`/bookings/?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  // SURGICAL FIX: Added endpoint to fetch specific booking details for the Payment Modal
  getBookingById: async (id: number | string) => {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
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