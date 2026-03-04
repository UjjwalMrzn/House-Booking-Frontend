import api from "./axiosInstance";

export const contactService = {
  // GET with pagination support for the admin table
  getContacts: async (page: number = 1, pageSize: number = 10) => {
    const response = await api.get(`/contacts/?page=${page}&page_size=${pageSize}`);
    return response.data;
  },
  
  // Existing public email route
  sendEmail: async (data: { name: string; email: string; subject: string; message: string }) => {
    const response = await api.post('/receiveEmail/', data);
    return response.data;
  },

  // NEW: Admin CRUD operations
  createContact: async (data: { name: string; email: string; phoneNumber: string; address: string; isMain: boolean }) => {
    const response = await api.post('/contacts/', data);
    return response.data;
  },
  
  updateContact: async (id: number, data: { name: string; email: string; phoneNumber: string; address: string; isMain: boolean }) => {
    const response = await api.put(`/contacts/${id}/`, data);
    return response.data;
  },
  
  deleteContact: async (id: number) => {
    const response = await api.delete(`/contacts/${id}/`);
    return response.data;
  }
};