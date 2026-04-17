import apiService from './api-service';

const laporanService = {
  getAll: async () => {
    try {
      const response = await apiService.get('/laporan');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiService.get(`/laporan/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generateSummaryReport: async (startDate, endDate) => {
    try {
      const response = await apiService.post('/laporan/summary', { startDate, endDate });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generatePatientsReport: async (startDate, endDate) => {
    try {
      const response = await apiService.post('/laporan/patients', { startDate, endDate });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generateDoctorsReport: async (startDate, endDate) => {
    try {
      const response = await apiService.post('/laporan/doctors', { startDate, endDate });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generateRevenueReport: async (startDate, endDate) => {
    try {
      const response = await apiService.post('/laporan/revenue', { startDate, endDate });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportPDF: async (reportId) => {
    try {
      const response = await apiService.get(`/laporan/${reportId}/export/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportExcel: async (reportId) => {
    try {
      const response = await apiService.get(`/laporan/${reportId}/export/excel`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAnalytics: async (startDate, endDate) => {
    try {
      const response = await apiService.get('/laporan/analytics', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default laporanService;
