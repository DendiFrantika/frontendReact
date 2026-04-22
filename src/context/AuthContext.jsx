import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/auth-service';

export const AuthContext = createContext(null);

const extractUserPayload = (body) => {
  if (body == null || typeof body !== 'object') return body;
  return body?.data?.user ?? body?.user ?? body?.data ?? body;
};

const normalizeUserRole = (user, fallbackRole) => {
  const normalized = { ...(user || {}) };
  if (typeof normalized.role === 'string') {
    normalized.role = normalized.role.trim().toLowerCase();
  }
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }
        const res = await authService.getCurrentUser({ bootstrap: true });
        const userData = extractUserPayload(res);
        const normalized = normalizeUserRole(userData);
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify(normalized));
      } catch (e) {
        console.warn('Token invalid:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
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
    setUser(null);
    localStorage.clear();
    authService.logout().catch(err => {
      console.warn('Backend logout failed (ignored):', err);
    });
    window.location.href = '/login';
  }, []);

  const isAuthenticated = !!user;

  const authValue = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated,
    loading,
  }), [user, login, logout, isAuthenticated, loading]);

  return ( // ✅ return yang hilang
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}; // ✅ penutup AuthProvider

// ✅ useAuth di LUAR AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};