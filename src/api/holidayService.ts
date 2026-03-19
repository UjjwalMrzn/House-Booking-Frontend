import api from "./axiosInstance";

export const holidayService = {
  // FIXED: Explicitly support page and page_size parameters
  getAllHolidays: async (page: number = 1, pageSize: number = 10) => {
    const response = await api.get(`/publicHoliday/?page=${page}&page_size=${pageSize}`);
    return response.data; 
  },
  
  createHoliday: async (data: { date: string; name: string; is_active: boolean }) => {
    const response = await api.post('/publicHoliday/', data);
    return response.data;
  },

  // SURGICAL FIX: Added range endpoint for public holidays
  createHolidayRange: async (data: { name: string; start_date: string; end_date: string }) => {
    const response = await api.post('/publicHoliday/create_range/', data);
    return response.data;
  },
  
  updateHoliday: async (id: number, data: { date: string; name: string; is_active: boolean }) => {
    const response = await api.put(`/publicHoliday/${id}/`, data);
    return response.data;
  },
  
  deleteHoliday: async (id: number) => {
    const response = await api.delete(`/publicHoliday/${id}/`);
    return response.data;
  }
};