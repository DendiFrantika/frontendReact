import apiService from './api-service';

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiService.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiService.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      await apiService.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiService.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await apiService.put('/auth/profile', userData);
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else if (response.data) {
        // Fallback if user object is not wrapped
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiService.post('/auth/refresh');
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authService;
