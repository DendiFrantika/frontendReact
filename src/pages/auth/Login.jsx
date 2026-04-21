import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import { getAuthBackgroundImageUrl } from './authEnv';
import { getRoleFromResponse, normalizeUserPayload } from './authRoles';

export default function Login() {
  const navigate = useNavigate();
  // const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [toasts, setToasts] = useState([]);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pushToast = useCallback((message, variant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === 'true') {
      setSessionExpiredOpen(true);
    }
  }, []);

  const { login, isAuthenticated, user, loading } = useAuth();

    useEffect(() => {
      if (loading) return; // ⛔ tahan dulu

      if (!isAuthenticated || !user?.role) return;

      const r = String(user.role).toLowerCase();
      if (r === 'admin') navigate('/admin', { replace: true });
      else if (r === 'dokter') navigate('/dokter', { replace: true });
      else navigate('/pasien', { replace: true });
    }, [isAuthenticated, user, loading, navigate]);

  const closeSessionModal = () => {
    setSessionExpiredOpen(false);
    navigate({ pathname: '/login', search: '' }, { replace: true });
  };

  const loginBgImageUrl = getAuthBackgroundImageUrl();
  const loginBgStyle = loginBgImageUrl
    ? { '--login-bg-image': `url(${JSON.stringify(loginBgImageUrl)})` }
    : undefined;



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrors({});

  const validationErrors = validateForm();

  if (Object.keys(validationErrors).length === 0) {
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      // ✅ LANGSUNG KE ENDPOINT YANG BENAR
      const response = await axiosInstance.post('/auth/login', payload);

      const data = response.data || {};
      const token = data.token;
      const userResponse = data.user;

      if (token) {
        localStorage.setItem('token', token);
      }

      const userToSave = normalizeUserPayload(
        userResponse,
        userResponse.role,
        formData.email
      );

      login(userToSave, userResponse.role);
      pushToast('Login berhasil 🚀', 'success');

      setTimeout(() => {
        const role = String(userResponse.role || 'pasien').toLowerCase();

        if (role === 'admin') navigate('/admin');
        else if (role === 'dokter') navigate('/dokter');
        else navigate('/pasien');
      }, 500);

    } catch (error) {
      console.log(error);

      const message =
        error?.response?.data?.message ||
        'Login gagal, cek email/password';

      setErrors({ submit: message });
      pushToast(message, 'error');
    }
  } else {
    setErrors(validationErrors);
  }

  setIsSubmitting(false);
};


  return (
    <main
      className={`login-container${loginBgImageUrl ? ' login-container--bg-image' : ''}`}
    >
      <div
        className={`login-bg${loginBgImageUrl ? ' login-bg--image' : ''}`}
        style={loginBgStyle}
        aria-hidden="true"
      />
      <div className="login-bg-shapes" aria-hidden="true">
        <span className="login-shape login-shape--1" />
        <span className="login-shape login-shape--2" />
        <span className="login-shape login-shape--3" />
      </div>

      <div
        className="login-toast-region"
        role="region"
        aria-label="Notifikasi"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`login-toast login-toast--${t.variant}`}
            role="status"
          >
            {t.message}
          </div>
        ))}
      </div>

      {sessionExpiredOpen && (
        <div
          className="login-modal-backdrop"
          role="presentation"
          onClick={closeSessionModal}
        >
          <div
            className="login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-session-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="login-session-title" className="login-modal-title">
              Sesi berakhir
            </h2>
            <p className="login-modal-text">
              Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.
            </p>
            <button
              type="button"
              className="login-modal-button"
              onClick={closeSessionModal}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      <div className="login-card">

        {/* HEADER */}
        <div className="login-header">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Silakan masuk ke akun Anda</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>

          {errors.submit && (
            <div className="error-message error-submit" role="alert">
              {errors.submit}
            </div>
          )}

          {/* EMAIL */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="nama@email.com"
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label className="form-label">Password</label>

            <div className="login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input form-input--with-toggle ${errors.password ? 'input-error' : ''}`}
                placeholder="Masukkan password"
                autoComplete="current-password"
                disabled={isSubmitting}
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                disabled={isSubmitting}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* OPTIONS */}
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span className="checkbox-label">Ingat saya</span>
            </label>

            <Link to="/forgot-password" className="forgot-password">
              Lupa password?
            </Link>
          </div>

          {/* BUTTON */}
          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>

        </form>

        {/* FOOTER */}
        <div className="login-footer">
          <p>
            Belum punya akun?{' '}
            <Link to="/register" className="register-link">
              Daftar
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}