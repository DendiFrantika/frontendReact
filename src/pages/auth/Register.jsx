import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { getAuthBackgroundImageUrl } from './authEnv';
import './Login.css';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    no_identitas: '',
    tanggal_lahir: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const registerBgUrl = getAuthBackgroundImageUrl();
  const registerBgStyle = registerBgUrl
    ? { '--login-bg-image': `url(${JSON.stringify(registerBgUrl)})` }
    : undefined;

  const pushToast = useCallback((message, variant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    // Validasi No Identitas
    if (!formData.no_identitas) {
      newErrors.no_identitas = 'No identitas wajib diisi';
    } else if (!/^\d+$/.test(formData.no_identitas)) {
      newErrors.no_identitas = 'No identitas harus berupa angka';
    }

    // Validasi Tanggal Lahir
    if (!formData.tanggal_lahir) {
      newErrors.tanggal_lahir = 'Tanggal lahir wajib diisi';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password harus mengandung huruf besar, kecil, dan angka';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sesuai';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        no_identitas: formData.no_identitas,
        tanggal_lahir: formData.tanggal_lahir,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      if (response.status === 201 || response.status === 200) {
        pushToast('Registrasi berhasil. Silakan masuk.', 'success');
        window.setTimeout(() => navigate('/login'), 600);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const laravelErrors = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          laravelErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(laravelErrors);
      } else {
        const msg = err.response?.data?.message ?? 'Registrasi gagal. Silakan coba lagi.';
        setErrors({ submit: msg });
        pushToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`login-container${registerBgUrl ? ' login-container--bg-image' : ''}`}>
      <div
        className={`login-bg${registerBgUrl ? ' login-bg--image' : ''}`}
        style={registerBgStyle}
        aria-hidden="true"
      />
      <div className="login-bg-shapes" aria-hidden="true">
        <span className="login-shape login-shape--1" />
        <span className="login-shape login-shape--2" />
        <span className="login-shape login-shape--3" />
      </div>

      <div className="login-toast-region" role="region" aria-label="Notifikasi" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`login-toast login-toast--${t.variant}`} role="status">
            {t.message}
          </div>
        ))}
      </div>

      <div className="login-card register-card-shell">
        <div className="login-header">
          <h1 className="login-title">Daftar akun</h1>
          <p className="login-subtitle">Buat akun baru untuk layanan klinik</p>
        </div>

        {errors.submit && (
          <div className="error-message error-submit" role="alert">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form register-form-tight" noValidate>
          {/* Nama Lengkap */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nama lengkap *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Masukkan nama lengkap"
              disabled={loading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="nama@email.com"
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* No Identitas */}
          <div className="form-group">
            <label htmlFor="no_identitas" className="form-label">No Identitas *</label>
            <input
              type="text"
              id="no_identitas"
              name="no_identitas"
              value={formData.no_identitas}
              onChange={handleChange}
              className={`form-input ${errors.no_identitas ? 'input-error' : ''}`}
              placeholder="Masukkan nomor identitas"
              disabled={loading}
            />
            {errors.no_identitas && <span className="error-message">{errors.no_identitas}</span>}
          </div>

          {/* Tanggal Lahir */}
          <div className="form-group">
            <label htmlFor="tanggal_lahir" className="form-label">Tanggal Lahir *</label>
            <input
              type="date"
              id="tanggal_lahir"
              name="tanggal_lahir"
              value={formData.tanggal_lahir}
              onChange={handleChange}
              className={`form-input ${errors.tanggal_lahir ? 'input-error' : ''}`}
              disabled={loading}
            />
            {errors.tanggal_lahir && <span className="error-message">{errors.tanggal_lahir}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password *</label>
            <div className="login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input form-input--with-toggle ${errors.password ? 'input-error' : ''}`}
                placeholder="Minimal 6 karakter"
                disabled={loading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
            
            <div className="password-requirements">
              <small>PERSYARATAN PASSWORD</small>
              <ul>
                <li className={formData.password.length >= 6 ? 'valid' : ''}>Minimal 6 karakter</li>
                <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>Huruf kecil</li>
                <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>Huruf besar</li>
                <li className={/\d/.test(formData.password) ? 'valid' : ''}>Angka</li>
              </ul>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Konfirmasi password *</label>
            <div className="login-password-wrap">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input form-input--with-toggle ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Ulangi password"
                disabled={loading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="login-button register-submit" disabled={loading}>
            {loading ? 'Memproses…' : 'Daftar'}
          </button>
        </form>

        <div className="login-footer register-footer-stack">
          <p>Sudah punya akun? <Link to="/login" className="register-link">Masuk</Link></p>
          <p className="register-footer-secondary">
            <Link to="/" className="auth-back-home">← Kembali ke beranda</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;