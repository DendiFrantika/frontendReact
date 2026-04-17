import apiService from './api-service';

const rekamMedisService = {
  getAll: async () => {
    try {
      const response = await apiService.get('/rekam-medis');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiService.get(`/rekam-medis/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getByPatientId: async (patientId) => {
    try {
      const response = await apiService.get(`/rekam-medis/pasien/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiService.post('/rekam-medis', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiService.put(`/rekam-medis/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/rekam-medis/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addDiagnosis: async (recordId, diagnosisData) => {
    try {
      const response = await apiService.post(`/rekam-medis/${recordId}/diagnosis`, diagnosisData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addTreatment: async (recordId, treatmentData) => {
    try {
      const response = await apiService.post(`/rekam-medis/${recordId}/treatment`, treatmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  export: async (patientId, format = 'pdf') => {
    try {
      const response = await apiService.get(`/rekam-medis/pasien/${patientId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default rekamMedisService;
