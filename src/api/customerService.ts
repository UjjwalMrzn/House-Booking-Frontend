import api from "./axiosInstance";

export const customerService = {
  createCustomer: (data: any) => api.post("/customers/", {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    country: data.country || "Nepal",
    phoneNumber: data.phoneNumber
  }),
};