import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// PrivateRoute untuk melindungi halaman yang butuh login
const PrivateRoute = ({ children, role }) => {

  const { isAuthenticated, user, loading } = useAuth();

  // ⭐ Tunggu sampai proses membaca user dari localStorage selesai
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Jika belum login → redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika butuh role tertentu tapi tidak sesuai
  if (role) {
    const roleList = Array.isArray(role) ? role : [role];
    if (!roleList.includes(user?.role)) {
      // Redirect sesuai role user
      if (user?.role === 'admin') return <Navigate to="/admin" replace />;
      if (user?.role === 'dokter') return <Navigate to="/dokter" replace />;
      if (user?.role === 'pasien') return <Navigate to="/pasien" replace />;

      // fallback
      return <Navigate to="/" replace />;
    }
  }

  // Jika lolos semua cek
  return children;
};

export default PrivateRoute;