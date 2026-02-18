import api from "./axiosInstance";

export const bookingApi = {
  /**
   * Step 1: Create the Customer profile
   * Hits POST /customers/ to get the ID
   */
  createCustomer: (data: any) => api.post("/customers/", {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    country: data.country || "Nepal",
    phoneNumber: data.phoneNumber // Maps from UI 'phoneNumber' to API 'phoneNumber'
  }),

  /**
   * Step 2/3: Finalize booking using the Customer ID obtained from Step 1
   * Hits POST /bookings/
   */
  createBooking: (payload: any) => api.post("/bookings/", payload)
};