import api from "./axiosInstance";

export const propertyService = {
  getPropertyDetails: async (id: string) => {
    const response = await api.get(`/property/${id}/`);
    return response.data;
  },
  getAllProperties: async () => {
    const response = await api.get('/property/');
    // Handle both flat arrays and paginated responses safely
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },

  deleteProperty: async (id: number) => {
    const response = await api.delete(`/property/${id}/`);
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
    // Using PUT as per your API docs for full updates
    const response = await api.put(`/property/${id}/`, data);
    return response.data;
  },

  //  image
  uploadPropertyImage: async (propertyId: string | number, imageFile: File) => {
    const formData = new FormData();
    // Note: If your Django API specifically expects "property_id" instead of "property", change this key.
    formData.append('property', String(propertyId)); 
    formData.append('image', imageFile);

    // FIXED: Removed the manual headers so Axios can generate the proper multi-part boundary
    const response = await api.post('/property-images/', formData);
    return response.data;
  },

setMainImage: async (imageId: string | number) => {
    const formData = new FormData();
    formData.append('is_main', 'true');

    // Simple PATCH to update the flag
    const response = await api.patch(`/property-images/${imageId}/`, formData);
    return response.data;
  },
  deletePropertyImage: async (imageId: string | number) => {
    const response = await api.delete(`/property-images/${imageId}/`);
    return response.data;
  },

// --- MASTER AMENITIES CRUD ---
  getAvailableAmenities: async () => {
    const response = await api.get('/amenities/');
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },
  
  createMasterAmenity: async (data: { name: string; icon: string }) => {
    return await api.post('/amenities/', data);
  },

  updateMasterAmenity: async (id: number | string, data: { name: string; icon: string }) => {
    return await api.put(`/amenities/${id}/`, data); // or .patch depending on your Django setup
  },

  deleteMasterAmenity: async (id: number | string) => {
    return await api.delete(`/amenities/${id}/`);
  },

  // POST: Link a master amenity to a specific property
  addPropertyAmenity: async (data: { property: string | number, amenity: number, description: string }) => {
    return await api.post('/property-amenities/', data);
  },

  // PUT/PATCH: Edit the custom description of a linked amenity
  updatePropertyAmenity: async (assignmentId: number, data: { description: string }) => {
    return await api.patch(`/property-amenities/${assignmentId}/`, data);
  },

  // DELETE: Remove the link between the property and the amenity
  deletePropertyAmenity: async (assignmentId: number) => {
    return await api.delete(`/property-amenities/${assignmentId}/`);
  },


  // Check-In / Check-Out Rules
  addCheckInOutRule: async (data: { property: string | number, check_in: string, check_out: string }) => {
    return await api.post('/check-in-out-rules/', data); // Adjust URL if backend named it differently
  },
  updateCheckInOutRule: async (id: number, data: { check_in: string, check_out: string }) => {
    return await api.patch(`/check-in-out-rules/${id}/`, data);
  },
  deleteCheckInOutRule: async (id: number) => {
    return await api.delete(`/check-in-out-rules/${id}/`);
  },

  // General Policies (e.g., Cancellation, Smoking)
  addPropertyPolicy: async (data: { property: string | number, name: string, description: string }) => {
    return await api.post('/policies/', data); // Adjust URL if backend named it differently
  },
  updatePropertyPolicy: async (id: number, data: { name: string, description: string }) => {
    return await api.patch(`/policies/${id}/`, data);
  },
  deletePropertyPolicy: async (id: number) => {
    return await api.delete(`/policies/${id}/`);
  },
};

