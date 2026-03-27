import api from "./axiosInstance";

export interface BondCharge {
  id?: number;
  property: number;
  amount: string; // SURGICAL FIX: Restored to single amount
  createdAt?: string;
}

export const bondService = {
  getBonds: async (propertyId: number) => {
    const response = await api.get(`/bondCharge/?property=${propertyId}`);
    return response.data;
  },
  createBond: async (data: BondCharge) => {
    const response = await api.post("/bondCharge/", data);
    return response.data;
  },
  updateBond: async (id: number, data: Partial<BondCharge>) => {
    const response = await api.patch(`/bondCharge/${id}/`, data);
    return response.data;
  },
  deleteBond: async (id: number) => {
    await api.delete(`/bondCharge/${id}/`);
  }
};