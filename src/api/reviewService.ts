import api from './axiosInstance';

export const reviewService = {
  // Get all reviews (for the admin dashboard)
  getAllReviews: async () => {
    const response = await api.get('/reviews/');
    return response.data.results || response.data;
  },

  // Get reviews for a specific property (for the public site)
  getReviewsByProperty: async (propertyId: string) => {
    const response = await api.get(`/reviews/?property=${propertyId}`);
    return response.data.results || response.data;
  },
 
  // Create a review
  createReview: async (data: { property: number; rating: number; comment: string; title: string; customer: number }) => {
    const response = await api.post('/reviews/', data);
    return response.data;
  },

  // Delete a review (Admin)
  deleteReview: async (id: number) => {
    const response = await api.delete(`/reviews/${id}/`);
    return response.data;
  }
};