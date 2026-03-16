import api from "./axiosInstance";

export interface PerPersonCharge {
  id?: number;
  property: number;
  amount: string;
  createdAt?: string;
}

export const guestService = {
  getCharges: async (propertyId: number) => {
    const response = await api.get(`/perPersonCharge/?property=${propertyId}`);
    return response.data;
  },
  createCharge: async (data: PerPersonCharge) => {
    const response = await api.post("/perPersonCharge/", data);
    return response.data;
  },
  updateCharge: async (id: number, data: Partial<PerPersonCharge>) => {
    const response = await api.patch(`/perPersonCharge/${id}/`, data);
    return response.data;
  },
  deleteCharge: async (id: number) => {
    await api.delete(`/perPersonCharge/${id}/`);
  }
};