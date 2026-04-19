import apiService from './api-service';

const BASE_URL = '/admin/rekam-medis'; // ✅ tambahin ini biar rapi

const rekamMedisService = {
  getAll: async () => {
    const response = await apiService.get(BASE_URL);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiService.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  getByPatientId: async (patientId) => {
    const response = await apiService.get(`${BASE_URL}/pasien/${patientId}`);
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

  addDiagnosis: async (recordId, diagnosisData) => {
    const response = await apiService.post(
      `${BASE_URL}/${recordId}/diagnosis`,
      diagnosisData
    );
    return response.data;
  },

  addTreatment: async (recordId, treatmentData) => {
    const response = await apiService.post(
      `${BASE_URL}/${recordId}/treatment`,
      treatmentData
    );
    return response.data;
  },

  export: async (patientId, format = 'pdf') => {
    const response = await apiService.get(
      `${BASE_URL}/pasien/${patientId}/export`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

export default rekamMedisService;