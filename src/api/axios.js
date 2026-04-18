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

/** Path relatif request (huruf kecil), untuk pengecekan auth */
const requestPathKey = (config) => {
  const url = config?.url || "";
  try {
    if (url.startsWith("http")) {
      return new URL(url).pathname.toLowerCase().split("?")[0];
    }
  } catch {
    /* noop */
  }
  const path = url.split("?")[0].toLowerCase();
  return path.startsWith("/") ? path : `/${path}`;
};

const isAuthLoginOrRegister = (config) => {
  const p = requestPathKey(config);
  return (
    p.endsWith("/auth/login") ||
    p.endsWith("/auth/register") ||
    p.endsWith("/auth/google") ||
    p === "auth/login" ||
    p === "auth/register" ||
    p === "auth/google"
  );
};

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
| RESPONSE INTERCEPTOR (401 — konsisten untuk seluruh app)
|--------------------------------------------------------------------------
| - Login/register gagal: jangan hapus token / redirect
| - Bootstrap /auth/me (skipAuthRedirect): hapus sesi, biarkan AuthContext
| - Lainnya: hapus sesi + redirect ke login (kecuali sudah di /login)
|--------------------------------------------------------------------------
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const config = error?.config;

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (isAuthLoginOrRegister(config)) {
      return Promise.reject(error);
    }

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      /* noop */
    }

    if (config?.skipAuthRedirect) {
      return Promise.reject(error);
    }

    const path = window.location.pathname || "";
    if (!path.startsWith("/login") && !path.startsWith("/register")) {
      window.location.href = "/login?expired=true";
    }

    return Promise.reject(error);
  }
);

export default api;
