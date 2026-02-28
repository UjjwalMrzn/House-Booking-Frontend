import api from "./axiosInstance";

export const homeService = {
  // ==========================================
  // HERO IMAGES
  // ==========================================
  getHomePageImages: async () => {
    const response = await api.get('/home-page-images/');
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },
  
  createHomePageImage: async (imageFile: File, is_main: boolean = false) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (is_main) formData.append('is_main', 'true');
    const response = await api.post('/home-page-images/', formData);
    return response.data;
  },
  
  updateHomePageImage: async (id: number | string, data: { is_main?: boolean }) => {
    const formData = new FormData();
    if (data.is_main !== undefined) formData.append('is_main', data.is_main ? 'true' : 'false');
    const response = await api.patch(`/home-page-images/${id}/`, formData);
    return response.data;
  },
  
  deleteHomePageImage: async (id: number | string) => {
    const response = await api.delete(`/home-page-images/${id}/`);
    return response.data;
  },

  // ==========================================
  // HERO TITLES (NEW API)
  // ==========================================
  getTitles: async () => {
    const response = await api.get('/titles/');
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },
  
  createTitle: async (title: string, isMain: boolean = true) => {
    const response = await api.post('/titles/', { title, isMain });
    return response.data;
  },
  
  updateTitle: async (id: number | string, title: string, isMain: boolean = true) => {
    const response = await api.patch(`/titles/${id}/`, { title, isMain });
    return response.data;
  }
};