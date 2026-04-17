import apiService from './api-service';

const dokterService = {
  getAll: async () => {
    try {
      const response = await apiService.get('/dokter');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiService.get(`/dokter/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiService.post('/dokter', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiService.put(`/dokter/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/dokter/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSchedule: async (id) => {
    try {
      const response = await apiService.get(`/dokter/${id}/schedule`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getQueue: async () => {
    try {
      const response = await apiService.get('/dokter/queue');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getDiagnosis: async () => {
    try {
      const response = await apiService.get('/dokter/diagnosis');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  saveDiagnosis: async (data) => {
    try {
      const response = await apiService.post('/dokter/diagnosis', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default dokterService;
