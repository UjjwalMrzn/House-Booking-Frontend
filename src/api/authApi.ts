import api from "./axiosInstance";

export const authApi = {
  // Logic: Create a real customer record first to get the Foreign Key ID
  register: async (data: any) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      country: data.country || "Nepal",
      phoneNumber: data.phone
    };
    const response = await api.post("/customers/", payload);
    return response.data;
  },
};