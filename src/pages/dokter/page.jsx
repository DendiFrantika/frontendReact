import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DokterLayout from './DokterLayout';
import axiosInstance from '../../api/axios';

export default function DashboardDokter() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingDiagnoses: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchDashboardData = useCallback(async (signal) => {
    if (!isAuthenticated || authLoading) return;

    try {
      setError(null);
      const statsRes = await axiosInstance.get('/dokter/stats', { signal });
      setStats(statsRes.data);
    } catch (err) {
      if (!signal?.aborted) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [fetchDashboardData]);

  if (authLoading) {
    return (
      <DokterLayout title="Dashboard Dokter">
        <div className="loading" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
          <div className="spinner" style={{border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite'}}></div>
          Memuat...
        </div>
      </DokterLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // PrivateRoute will redirect
  }

  return (
    <DokterLayout title="Dashboard Dokter">
      <div className="dashboard-header">
        <h1>Selamat Datang, Dokter</h1>
        <p>Ringkasan aktivitas hari ini</p>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Memuat data...
        </div>
      ) : error ? (
        <div className="error-message" style={{padding: '20px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c33'}}>
          {error}
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Janji Temu Hari Ini</h3>
              <p className="stat-value">{stats.todayAppointments}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Diagnosis Pending</h3>
              <p className="stat-value">{stats.pendingDiagnoses}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Selesai Hari Ini</h3>
              <p className="stat-value">{stats.completedToday}</p>
            </div>
          </div>
        </div>
      )}
    </DokterLayout>
  );
}

