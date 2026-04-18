import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setErrors({ submit: 'Sesi Anda telah berakhir, silakan login kembali.' });
    }
  }, [location]);

  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'dokter') navigate('/dokter', { replace: true });
      else navigate('/pasien', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [showPassword, setShowPassword] = useState(false); // 👈 TAMBAHAN
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLoginUri = () => process.env.REACT_APP_API_LOGIN_URI || '/auth/login';

  const getRoleFromResponse = (data, userResponse) => {
    if (data.role) return data.role;
    if (userResponse?.role) return userResponse.role;
    if (userResponse?.isAdmin || userResponse?.is_admin) return 'admin';
    if (userResponse?.isDokter || userResponse?.is_dokter) return 'dokter';
    if (userResponse?.isPasien || userResponse?.is_pasien) return 'pasien';
    return null;
  };

  const normalizeUser = (userResponse, roleFromResponse) => {
    const baseUser = typeof userResponse === 'object'
      ? { ...userResponse }
      : { email: formData.email };

    return {
      ...baseUser,
      role:
        roleFromResponse ||
        baseUser.role ||
        (baseUser.email?.includes('admin') ? 'admin' : 'pasien')
    };
  };

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
        const response = await axiosInstance.post(getLoginUri(), {
          email: formData.email,
          password: formData.password
        });

        const data = response.data || {};
        const token = data.token || data.access_token || data.data?.token;
        const userResponse = data.user || data.data?.user || data;
        const roleFromResponse = getRoleFromResponse(data, userResponse);

        if (token) {
          localStorage.setItem('token', token);
        }

        const userToSave = normalizeUser(userResponse, roleFromResponse);
        login(userToSave, roleFromResponse);

        if (userToSave.role === 'admin') {
          navigate('/admin');
        } else if (userToSave.role === 'dokter') {
          navigate('/dokter');
        } else {
          navigate('/pasien');
        }

      } catch (error) {
        const message =
          error?.response?.data?.message ||
          'Login gagal, cek email/password';

        setErrors({ submit: message });
      }
    } else {
      setErrors(validationErrors);
    }

    setIsSubmitting(false);
  };

  return (
    <main className="login-container">
      <div className="login-card">

        {/* HEADER */}
        <div className="login-header">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Silakan masuk ke akun Anda</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>

          {errors.submit && (
            <div className="error-message error-submit">
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
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label className="form-label">Password</label>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Masukkan password"
              />

              {/* TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* OPTIONS */}
          <div className="form-options">
            <label>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Ingat saya
            </label>

            <a href="/forgot-password">Lupa password?</a>
          </div>

          {/* BUTTON */}
          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>

        </form>

        {/* FOOTER */}
        <div className="login-footer">
          <p>
            Belum punya akun? <a href="/register">Daftar</a>
          </p>
        </div>

      </div>
    </main>
  );
}