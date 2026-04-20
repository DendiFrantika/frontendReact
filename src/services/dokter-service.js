import apiService from './api-service';

const dokterService = {
  getAll: async () => {
    try {
      const response = await apiService.get('/admin/dokter');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiService.get(`/admin/dokter/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiService.post('/admin/dokter', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiService.put(`/admin/dokter/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/admin/dokter/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSchedule: async (id) => {
    try {
      const response = await apiService.get(`/admin/dokter/${id}/schedule`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getQueue: async () => {
    try {
      const response = await apiService.get('/admin/dokter/queue');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getDiagnosis: async () => {
    try {
      const response = await apiService.get('/admin/dokter/diagnosis');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  saveDiagnosis: async (data) => {
    try {
      const response = await apiService.post('/admin/dokter/diagnosis', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default dokterService;