import api from "./axiosInstance";

export const propertyService = {
  getPropertyDetails: async (id: string) => {
    const response = await api.get(`/property/${id}/`);
    return response.data;
  },
};
