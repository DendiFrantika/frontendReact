import apiService from './api-service';

const jadwalService = {
  getAll: async () => {
    try {
      const response = await apiService.get('/jadwal');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiService.get(`/jadwal/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getByDoctorId: async (doctorId) => {
    try {
      const response = await apiService.get(`/jadwal/dokter/${doctorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiService.post('/jadwal', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiService.put(`/jadwal/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/jadwal/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await apiService.get(`/jadwal/available-slots`, {
        params: { doctorId, date },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  bookAppointment: async (appointmentData) => {
    try {
      const response = await apiService.post('/jadwal/book-appointment', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  cancelAppointment: async (appointmentId, reason) => {
    try {
      const response = await apiService.put(`/jadwal/cancel-appointment/${appointmentId}`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  rescheduleAppointment: async (appointmentId, newDate, newTime) => {
    try {
      const response = await apiService.put(`/jadwal/reschedule/${appointmentId}`, { newDate, newTime });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default jadwalService;
