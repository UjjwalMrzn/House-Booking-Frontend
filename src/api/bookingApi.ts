import api from "./axiosInstance";

export const bookingApi = {
  // Step 1: Register guest to get ID
  register: (data: any) => api.post("/register/", {
    ...data,
    username: data.email,
    password: "GuestPassword123!", // Auto-set for simplicity
    confirm_password: "GuestPassword123!",
    userType: "customer"
  }),

  // Step 2: Finalize booking
  create: (payload: any) => api.post("/bookings/", payload)
};