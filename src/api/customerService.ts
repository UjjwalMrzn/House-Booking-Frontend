import api from "./axiosInstance";

export const customerService = {
  // 1. New endpoint to fetch customers for the Admin Panel with pagination and filtering
  getCustomers: async (page: number = 1, pageSize: number = 10, actionFilter: string = 'all') => {
    let url = `/customers/?page=${page}&page_size=${pageSize}`;
    if (actionFilter && actionFilter !== 'all') {
      url += `&action__icontains=${actionFilter}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // 2. Updated to pass the action tag to the backend
  createCustomer: (data: any) => api.post("/customers/", {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    country: data.country || "Nepal",
    phoneNumber: data.phoneNumber,
    action: data.action // <-- ADDED THIS LINE!
  }),
};