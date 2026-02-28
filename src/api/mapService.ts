import api from "./axiosInstance";

export const mapService = {
  // NEW: Fetch active map directly
  getMainMap: async () => {
    const response = await api.get('/mainMaps/');
    const data = response.data.results || response.data;
    return Array.isArray(data) ? data[0] : data;
  },
  
  getMapByPropertyId: async (propertyId: string | number) => {
    const response = await api.get(`/maps/?property=${propertyId}`);
    const data = response.data.results || response.data;
    return Array.isArray(data) ? data[0] : data;
  },
  createMap: async (data: any) => {
    const response = await api.post('/maps/', data);
    return response.data;
  },
  updateMap: async (id: number, data: any) => {
    const response = await api.patch(`/maps/${id}/`, data);
    return response.data;
  },
  deleteMap: async (id: number) => {
    const response = await api.delete(`/maps/${id}/`);
    return response.data;
  }
};