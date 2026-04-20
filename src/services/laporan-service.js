import apiService from './api-service';

const laporanService = {
  // ── Fetch data ─────────────────────────────────────────────────────────────

  getAll: async () => {
    try {
      const response = await apiService.get('/admin/laporan');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPatientReport: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/pasien', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMedicalRecordReport: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/rekam-medis', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getDoctorReport: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/dokter', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRegistrationReport: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/pendaftaran', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ── Export PDF ─────────────────────────────────────────────────────────────

  exportPatientPdf: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/export/pdf', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportMedicalRecordPdf: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/rekam-medis/export/pdf', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportRegistrationPdf: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/pendaftaran/export/pdf', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportDoctorPdf: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/dokter/export/pdf', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportPatientExcel: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/export/csv', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportDoctorExcel: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/dokter/export/csv', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportMedicalRecordExcel: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/rekam-medis/export/csv', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportRegistrationExcel: async (params = {}) => {
    try {
      const response = await apiService.get('/admin/laporan/pendaftaran/export/csv', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default laporanService;