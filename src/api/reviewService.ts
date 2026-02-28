import api from "./axiosInstance";

export const reviewService = {
  // ==========================================
  // PUBLIC API (Single Source of Truth)
  // ==========================================
  getMainReviews: async () => {
    const response = await api.get('/mainReview/');
    return response.data.results || response.data;
  },

  // ==========================================
  // ADMIN API (List & Management)
  // ==========================================
  getAllReviews: async () => {
    const response = await api.get('/reviews/');
    return response.data.results || response.data;
  },

  getReviewsByProperty: async (propertyId: string | number) => {
    const response = await api.get(`/reviews/?property__id=${propertyId}`);
    return response.data.results || response.data;
  },
  
  createReview: async (data: any) => {
    const response = await api.post('/reviews/', data);
    return response.data;
  },
  
  deleteReview: async (id: number) => {
    const response = await api.delete(`/reviews/${id}/`);
    return response.data;
  }
};