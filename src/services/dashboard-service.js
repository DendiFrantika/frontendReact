import apiService from './api-service';

const dashboardService = {
  getStats: async () => {
    try {
      const response = await apiService.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRecentActivities: async () => {
    try {
      const response = await apiService.get('/dashboard/recent-activities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getChartData: async (range = 'week') => {
    try {
      const response = await apiService.get(`/dashboard/chart-data?range=${range}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSummary: async () => {
    try {
      const response = await apiService.get('/dashboard/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default dashboardService;
