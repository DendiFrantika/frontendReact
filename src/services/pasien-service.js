import apiService from './api-service';

const pasienService = {
  getAll: async () => {
    try {
      const response = await apiService.get('/pasien');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiService.get(`/pasien/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiService.post('/pasien', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiService.put(`/pasien/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/pasien/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiService.get('/pasien/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiService.put('/pasien/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getQueue: async () => {
    try {
      const response = await apiService.get('/pasien/queue');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getHistory: async () => {
    try {
      const response = await apiService.get('/pasien/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default pasienService;
