import api from "./axiosInstance";

export const mapService = {
  getMapByPropertyId: async (propertyId: string) => {
    // Standardized to use the central 'api' instance
    const response = await api.get(`/maps/?property=${propertyId}`);
    
    const maps = response.data.results || response.data;
    return maps.length > 0 ? maps[0] : null;
  }
};