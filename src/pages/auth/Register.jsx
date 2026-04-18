'use client';

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import './Register.css'; // CSS khusus untuk register

const Register = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    telepon: '',
    alamat: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validasi nama
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama lengkap wajib diisi';
    } else if (formData.nama.length < 3) {
      newErrors.nama = 'Nama minimal 3 karakter';
    }
    
    // Validasi email
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }
    
    // Validasi telepon
    if (!formData.telepon) {
      newErrors.telepon = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9+\-\s]+$/.test(formData.telepon)) {
      newErrors.telepon = 'Nomor telepon tidak valid';
    } else if (formData.telepon.replace(/[^0-9]/g, '').length < 10) {
      newErrors.telepon = 'Nomor telepon minimal 10 digit';
    }
    
    // Validasi alamat
    if (!formData.alamat.trim()) {
      newErrors.alamat = 'Alamat wajib diisi';
    } else if (formData.alamat.length < 10) {
      newErrors.alamat = 'Alamat terlalu pendek';
    }
    
    // Validasi password
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password harus mengandung huruf besar, kecil, dan angka';
    }
    
    // Validasi confirm password
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
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        telepon: formData.telepon,
        alamat: formData.alamat,
      });

      if (response.status === 201) {
        // Tampilkan pesan sukses sebelum redirect
        alert('Registrasi berhasil! Silakan login.');
        navigate('/login');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      setErrors({ submit: errorMessage });
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
          <div className="error-message error-submit">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nama" className="form-label">
                Nama Lengkap *
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className={`form-input ${errors.nama ? 'input-error' : ''}`}
                placeholder="Masukkan nama lengkap"
                disabled={loading}
              />
              {errors.nama && (
                <span className="error-message">{errors.nama}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
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
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telepon" className="form-label">
                Nomor Telepon *
              </label>
              <input
                type="tel"
                id="telepon"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                className={`form-input ${errors.telepon ? 'input-error' : ''}`}
                placeholder="0812-3456-7890"
                disabled={loading}
              />
              {errors.telepon && (
                <span className="error-message">{errors.telepon}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="alamat" className="form-label">
              Alamat Lengkap *
            </label>
            <textarea
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className={`form-textarea ${errors.alamat ? 'input-error' : ''}`}
              rows="3"
              placeholder="Masukkan alamat lengkap (jalan, RT/RW, kelurahan, kecamatan, kota)"
              disabled={loading}
            ></textarea>
            {errors.alamat && (
              <span className="error-message">{errors.alamat}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
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
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
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

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Konfirmasi Password *
              </label>
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
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Sudah punya akun?{' '}
            <Link to="/login" className="login-link">
              Masuk di sini
            </Link>
          </p>
          <p className="home-link">
            <Link to="/">← Kembali ke beranda</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;