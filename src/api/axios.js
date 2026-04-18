import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_BASE_URL ||
    "http://127.0.0.1:8000/api",

  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },

  withCredentials: false,
});

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR (ADD TOKEN)
|--------------------------------------------------------------------------
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR (HANDLE ERROR + TOKEN EXPIRED)
|--------------------------------------------------------------------------
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;

    // ❗ HANYA logout kalau token expired (bukan login gagal)
    if (status === 401 && url !== "/auth/login") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login?expired=true";
    }

    return Promise.reject(error);
  }
);

export default api;