import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Login.css'; // File CSS untuk styling

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const getLoginUri = () => process.env.REACT_APP_API_LOGIN_URI || '/login';

  const getRoleFromResponse = (data, userResponse) => {
    if (data.role) return data.role;
    if (userResponse?.role) return userResponse.role;
    if (userResponse?.isAdmin || userResponse?.is_admin) return 'admin';
    if (userResponse?.isDokter || userResponse?.is_dokter) return 'dokter';
    if (userResponse?.isPasien || userResponse?.is_pasien) return 'pasien';
    return null;
  };

  const normalizeUser = (userResponse, roleFromResponse) => {
    const baseUser = typeof userResponse === 'object' ? { ...userResponse } : { email: formData.email };
    return {
      ...baseUser,
      role: roleFromResponse || baseUser.role || (baseUser.email?.includes('admin') ? 'admin' : 'pasien')
    };
  };
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
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
      const loginUri = getLoginUri();
      try {
        const response = await axiosInstance.post(loginUri, {
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
        console.error('Login error:', error);
        const message = error?.response?.data?.message || error?.message || 'Login gagal, silakan cek email/password dan koneksi API.';
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
        <div className="login-header">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Silakan masuk ke akun Anda</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {errors.submit && (
            <div className="error-message error-submit">
              {errors.submit}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="nama@email.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Masukkan password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <label htmlFor="rememberMe" className="checkbox-label">
                Ingat saya
              </label>
            </div>
            
            <a href="/forgot-password" className="forgot-password">
              Lupa password?
            </a>
          </div>
          
          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
          
          <div className="login-divider">
            <span>ATAU</span>
          </div>
          
          <div className="social-login">
            <button type="button" className="social-button google">
              <svg className="social-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Masuk dengan Google
            </button>
          </div>
        </form>
        
        <div className="login-footer">
          <p>
            Belum punya akun?{' '}
            <a href="/register" className="register-link">
              Daftar di sini
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}