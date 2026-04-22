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
      // ✅ hapus removeItem di sini, biar AuthContext yang handle
    } catch (error) {
      console.warn('Logout error (ignored):', error);
      // tidak perlu throw, logout tetap lanjut
    }
},

  /**
   * @param {{ bootstrap?: boolean }} [options] — bootstrap=true: 401 tidak full page redirect (untuk init AuthContext)
   */
  getCurrentUser: async (options = {}) => {
    const response = await apiService.get('/auth/me', {
      skipAuthRedirect: Boolean(options.bootstrap),
    });
    return response.data;
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
