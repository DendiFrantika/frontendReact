/**
 * Satu instance axios dengan interceptor auth terpusat (lihat ../api/axios.js).
 * Semua service mengimpor dari sini agar 401 / token konsisten.
 */
import api from '../api/axios';

export default api;
