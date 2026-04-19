import apiService from './api-service';

const BASE_URL = '/admin/pendaftaran'; // ✅ penting

const pendaftaranService = {
  getAll: async () => {
    const response = await apiService.get(BASE_URL);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiService.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiService.post(BASE_URL, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiService.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiService.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  getTodayRegistrations: async () => {
    const response = await apiService.get(`${BASE_URL}/today`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiService.put(
      `${BASE_URL}/${id}/status`,
      { status }
    );
    return response.data;
  },

  getStatistics: async (startDate, endDate) => {
    const response = await apiService.get(`${BASE_URL}/statistics`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

export default pendaftaranService;