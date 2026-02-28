import api from "./axiosInstance";

export const propertyService = {
  // NEW: Single Source of Truth for the public site
  getMainProperty: async () => {
    const response = await api.get('/mainProperty/');
    // Backend returns the single object directly or an array with one item
    return Array.isArray(response.data) ? response.data[0] : response.data;
  },

  getAllProperties: async () => {
    const response = await api.get('/property/');
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },
  
  // NEW: Admin action to set a property as Active
  setMainProperty: async (id: number | string) => {
    const response = await api.patch(`/property/${id}/`, { isMain: true });
    return response.data;
  },

  getPropertyDetails: async (id: string | number) => {
    const response = await api.get(`/property/${id}/`);
    return response.data;
  },
  getProperty: async (id: string | number) => {
    const response = await api.get(`/property/${id}/`);
    return response.data;
  },
  createProperty: async (data: any) => {
    const response = await api.post('/property/', data);
    return response.data;
  },
  updateProperty: async ({ id, data }: { id: string | number; data: any }) => {
    const response = await api.put(`/property/${id}/`, data);
    return response.data;
  },
  deleteProperty: async (id: number) => {
    const response = await api.delete(`/property/${id}/`);
    return response.data;
  },

  uploadPropertyImage: async (propertyId: string | number, imageFile: File) => {
    const formData = new FormData();
    formData.append('property', String(propertyId)); 
    formData.append('image', imageFile);
    const response = await api.post('/property-images/', formData);
    return response.data;
  },
  setMainImage: async (imageId: string | number) => {
    const formData = new FormData();
    formData.append('is_main', 'true');
    const response = await api.patch(`/property-images/${imageId}/`, formData);
    return response.data;
  },
  deletePropertyImage: async (imageId: string | number) => {
    const response = await api.delete(`/property-images/${imageId}/`);
    return response.data;
  },

  getAvailableAmenities: async () => {
    const response = await api.get('/amenities/');
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },
  createMasterAmenity: async (data: { name: string; icon: string }) => {
    return await api.post('/amenities/', data);
  },
  updateMasterAmenity: async (id: number | string, data: { name: string; icon: string }) => {
    return await api.put(`/amenities/${id}/`, data); 
  },
  deleteMasterAmenity: async (id: number | string) => {
    return await api.delete(`/amenities/${id}/`);
  },
  addPropertyAmenity: async (data: { property: string | number, amenity: number, description: string }) => {
    return await api.post('/property-amenities/', data);
  },
  updatePropertyAmenity: async (assignmentId: number, data: { description: string }) => {
    return await api.patch(`/property-amenities/${assignmentId}/`, data);
  },
  deletePropertyAmenity: async (assignmentId: number) => {
    return await api.delete(`/property-amenities/${assignmentId}/`);
  },

  addCheckInOutRule: async (data: { property: string | number, check_in: string, check_out: string }) => {
    return await api.post('/check-in-out/', data); 
  },
  updateCheckInOutRule: async (id: number, data: { check_in: string, check_out: string }) => {
    return await api.patch(`/check-in-out/${id}/`, data);
  },
  deleteCheckInOutRule: async (id: number) => {
    return await api.delete(`/check-in-out/${id}/`);
  },
  addPropertyPolicy: async (data: { property: string | number, name: string, description: string }) => {
    return await api.post('/policy/', data); 
  },
  updatePropertyPolicy: async (id: number, data: { name: string, description: string }) => {
    return await api.patch(`/policy/${id}/`, data);
  },
  deletePropertyPolicy: async (id: number) => {
    return await api.delete(`/policy/${id}/`);
  },

  getAllBookings: async () => {
    const response = await api.get('/bookings/'); 
    return response.data.results || response.data; 
  },
  updateBookingStatus: async (id: number, status: 'confirmed' | 'cancelled' | 'pending') => {
    const response = await api.patch(`/bookings/${id}/`, { status });
    return response.data;
  },
  getCustomerById: async (id: number) => {
    const response = await api.get(`/customers/${id}/`);
    return response.data;
  },
};