import api from "./axiosInstance";

export const schoolHolidayService = {
  getSchoolHolidays: async (page: number = 1, pageSize: number = 10) => {
    const response = await api.get(`/schoolHoliday/?page=${page}&page_size=${pageSize}`);
    return response.data; 
  },
  
  createHoliday: async (data: { date: string; name: string; is_active: boolean }) => {
    const response = await api.post('/schoolHoliday/', data);
    return response.data;
  },

  // SURGICAL FIX: New endpoint strictly for generating a range of dates
  createHolidayRange: async (data: { name: string; start_date: string; end_date: string }) => {
    const response = await api.post('/schoolHoliday/create_range/', data);
    return response.data;
  },
  
  updateHoliday: async (id: number, data: { date: string; name: string; is_active: boolean }) => {
    const response = await api.put(`/schoolHoliday/${id}/`, data);
    return response.data;
  },
  
  deleteHoliday: async (id: number) => {
    const response = await api.delete(`/schoolHoliday/${id}/`);
    return response.data;
  }
};