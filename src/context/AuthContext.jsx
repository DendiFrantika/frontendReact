import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/auth-service';

export const AuthContext = createContext(null);

const normalizeUserRole = (user, fallbackRole) => {
  const normalized = { ...(user || {}) };

  if (!normalized.role) {
    if (normalized.isAdmin || normalized.is_admin || fallbackRole === 'admin') {
      normalized.role = 'admin';
    } else if (normalized.isDokter || normalized.is_dokter || fallbackRole === 'dokter') {
      normalized.role = 'dokter';
    } else if (normalized.isPasien || normalized.is_pasien || fallbackRole === 'pasien') {
      normalized.role = 'pasien';
    } else if (fallbackRole) {
      normalized.role = fallbackRole;
    } else if (normalized.email?.includes('admin')) {
      normalized.role = 'admin';
    } else {
      normalized.role = 'pasien';
    }
  }

  return normalized;
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⭐ penting

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token) {
          try {
             // Verifikasi token & ambil data profile terbaru dari backend
             const res = await authService.getCurrentUser();
             const userData = res.data || res.user || res;
             
             // Keep fallback role if backend somehow fails to provide one but frontend knows it
             const mappedRole = storedUser ? JSON.parse(storedUser).role : null;
             const normalized = normalizeUserRole(userData, mappedRole);
             
             setUser(normalized);
             localStorage.setItem('user', JSON.stringify(normalized));
          } catch (e) {
             console.warn('Auto login validation failed (token may be expired)', e);
             if (storedUser) setUser(normalizeUserRole(JSON.parse(storedUser)));
          }
        } else if (storedUser) {
           setUser(normalizeUserRole(JSON.parse(storedUser)));
        }
      } catch (err) {
        console.warn('Failed to parse or load stored user', err);
      } finally {
        setLoading(false); // ⭐ selesai loading
      }
    };
    initAuth();
  }, []);

  const login = useCallback((userData, fallbackRole) => {

    const normalizedUser = normalizeUserRole(userData, fallbackRole);

    setUser(normalizedUser);

    try {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } catch (err) {
      console.warn('Failed to save user to localStorage', err);
    }

  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Backend logout failed', err);
    }
    
    setUser(null);

    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (err) {
      console.warn('Failed to clear storage on logout', err);
    }

  }, []);

  const isAuthenticated = !!user;

  const authValue = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated,
    loading // ⭐ tambahkan ini
  }), [user, login, logout, isAuthenticated, loading]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};