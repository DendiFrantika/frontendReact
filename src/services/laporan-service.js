import apiService from './api-service';

const laporanService = {
  getAll: async () => {
    try {
      const response = await apiService.get('/admin/laporan');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPatientReport: async (params = {}) => {
    const paths = ['/admin/laporan/pasien', '/admin/laporan', '/laporan/pasien', '/laporan'];
    let lastError = null;

    for (const path of paths) {
      try {
        const response = await apiService.get(path, { params });
        return response.data;
      } catch (error) {
        lastError = error;
        if (error.response?.status !== 404) {
          throw error.response?.data || error;
        }
      }
    }

    throw lastError?.response?.data || lastError || new Error('Endpoint laporan pasien tidak ditemukan');
  },

  getMedicalRecordReport: async (params = {}) => {
    const paths = ['/admin/laporan/rekam-medis', '/laporan/rekam-medis', '/laporan'];
    let lastError = null;

    for (const path of paths) {
      try {
        const response = await apiService.get(path, { params });
        return response.data;
      } catch (error) {
        lastError = error;
        if (error.response?.status !== 404) {
          throw error.response?.data || error;
        }
      }
    }

    throw lastError?.response?.data || lastError || new Error('Endpoint laporan rekam medis tidak ditemukan');
  },

  getDoctorReport: async (params = {}) => {
    const paths = ['/admin/laporan/dokter', '/laporan/dokter', '/laporan'];
    let lastError = null;

    for (const path of paths) {
      try {
        const response = await apiService.get(path, { params });
        return response.data;
      } catch (error) {
        lastError = error;
        if (error.response?.status !== 404) {
          throw error.response?.data || error;
        }
      }
    }

    throw lastError?.response?.data || lastError || new Error('Endpoint laporan dokter tidak ditemukan');
  },

  getRegistrationReport: async (params = {}) => {
    const paths = ['/admin/laporan/pendaftaran', '/laporan/pendaftaran', '/laporan'];
    let lastError = null;

    for (const path of paths) {
      try {
        const response = await apiService.get(path, { params });
        return response.data;
      } catch (error) {
        lastError = error;
        if (error.response?.status !== 404) {
          throw error.response?.data || error;
        }
      }
    }

    throw lastError?.response?.data || lastError || new Error('Endpoint laporan pendaftaran tidak ditemukan');
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

  exportPatientPdf: async (params = {}) => {
    try {
      const response = await apiService.get('/laporan/export/pdf', {
        params,
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
