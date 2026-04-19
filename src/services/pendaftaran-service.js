import apiService from './api-service';

const pendaftaranService = {
  getAll: async () => {
    try {
      const response = await apiService.get('/admin/pendaftaran');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiService.get(`/pendaftaran/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiService.post('/pendaftaran', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiService.put(`/pendaftaran/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/pendaftaran/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getTodayRegistrations: async () => {
    try {
      const response = await apiService.get('/pendaftaran/today');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await apiService.put(`/pendaftaran/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getStatistics: async (startDate, endDate) => {
    try {
      const response = await apiService.get('/pendaftaran/statistics', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default pendaftaranService;
