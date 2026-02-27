import api from "./axiosInstance";

export const mapService = {
  getMapByPropertyId: async (propertyId: string | number) => {
    const response = await api.get(`/maps/?property=${propertyId}`);
    const maps = response.data.results || response.data;
    return maps.length > 0 ? maps[0] : null;
  },

  createMap: async (payload: { property: number; latitude: string; longitude: string }) => {
    const response = await api.post('/maps/', payload);
    return response.data;
  },

  updateMap: async (id: number, payload: { property: number; latitude: string; longitude: string }) => {
    const response = await api.put(`/maps/${id}/`, payload);
    return response.data;
  }
};