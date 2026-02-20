import axios from 'axios';

// Replace with your actual configured axios instance if you have one
const apiClient = axios.create({
  baseURL: 'http://192.168.10.3:9000',
});

export const mapService = {
  getMapByPropertyId: async (propertyId: string) => {
    // FIXED: Now passing the property ID directly as a query parameter
    const response = await apiClient.get(`/maps/?property=${propertyId}`);
    
    // The API returns an array (or paginated results), so we just grab the first match
    const maps = response.data.results || response.data;
    
    return maps.length > 0 ? maps[0] : null;
  }
};