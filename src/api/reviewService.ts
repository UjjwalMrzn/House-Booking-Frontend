import api from './axiosInstance';

export const reviewService = {
  getReviewsByProperty: async (propertyId: string) => {
    const response = await api.get(`/reviews/?property=${propertyId}`);
    return response.data.results || response.data;
  },

  // NEW: Added customer creation helper
  createCustomer: async (customerData: any) => {
    const response = await api.post('/customers/', customerData);
    return response.data;
  },
  
  createReview: async (data: { property: number; rating: number; comment: string; title: string; customer: number }) => {
    const response = await api.post('/reviews/', data);
    return response.data;
  }
};