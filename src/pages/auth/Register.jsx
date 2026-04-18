'use client';

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        password: formData.password,
        password_confirmation: formData.confirmPassword, // ✅ Laravel butuh ini
      });

      if (response.status === 201) {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/login');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        // ✅ Tangkap validation error dari Laravel
        const laravelErrors = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          laravelErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(laravelErrors);
      } else {
        setErrors({ submit: err.response?.data?.message ?? 'Registrasi gagal. Silakan coba lagi.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Daftar Akun</h1>
          <p className="register-subtitle">Buat akun baru di Klinik Medis</p>
        </div>

        {errors.submit && (
          <div className="error-submit">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className="register-form" noValidate>

          {/* Nama */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nama Lengkap *</label>
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

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Minimal 6 karakter"
              disabled={loading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
            <div className="password-requirements">
              <small>Password harus mengandung:</small>
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
            <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Ulangi password"
              disabled={loading}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Sudah punya akun?{' '}
            <Link to="/login" className="login-link">Masuk di sini</Link>
          </p>
          <p>
            <Link to="/" className="home-link">← Kembali ke beranda</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;