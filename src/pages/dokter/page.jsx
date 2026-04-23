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

  const [dokter, setDokter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const { isAuthenticated, loading: authLoading } = useAuth();

  // greeting otomatis
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 18) return 'Selamat siang';
    return 'Selamat malam';
  };
const fetchAktivitas = async () => {
  try {
    const res = await axiosInstance.get('/dokter/aktivitas-hari-ini');
    setActivities(res.data.data || []);
  } catch (err) {
    console.error(err);
  }
};

  const fetchDashboardData = useCallback(async (signal) => {
    if (!isAuthenticated || authLoading) return;

    try {
      setError(null);

      const res = await axiosInstance.get('/dokter/stats', { signal });

      setStats({
        todayAppointments: res.data.todayAppointments || 0,
        pendingDiagnoses: res.data.pendingDiagnoses || 0,
        completedToday: res.data.completedToday || 0,
      });

      setDokter(res.data.dokter || null);

    } catch (err) {
      if (!signal?.aborted) {
        console.error('Error dashboard:', err);
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
  fetchAktivitas(); // 🔥 INI YANG KURANG

  const interval = setInterval(() => {
    fetchDashboardData(controller.signal);
    fetchAktivitas(); // 🔥 biar realtime juga
  }, 10000);

  return () => {
    controller.abort();
    clearInterval(interval);
  };
}, [fetchDashboardData]);
  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);

    // 🔥 realtime auto refresh tiap 10 detik
    const interval = setInterval(() => {
      fetchDashboardData(controller.signal);
    }, 10000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  if (authLoading) {
    return (
      <DokterLayout title="Dashboard Dokter">
        <p>Memuat autentikasi...</p>
      </DokterLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <DokterLayout title="Dashboard Dokter">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>
          {getGreeting()}, Dokter {dokter?.nama || '-'}
        </h1>
        <p>Ringkasan aktivitas hari ini</p>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{
          padding: 12,
          background: '#FEE2E2',
          color: '#991B1B',
          borderRadius: 8,
          marginBottom: 12
        }}>
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <p>Memuat data dashboard...</p>
      ) : (
       <div className="stats-grid">

  <div className="stat-card">
    <div className="stat-info">
      <h3>Janji Temu Hari Ini</h3>
      <p className="stat-value">{stats.todayAppointments}</p>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-info">
      <h3>Diagnosis Pending</h3>
      <p className="stat-value">{stats.pendingDiagnoses}</p>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-info">
      <h3>Selesai Hari Ini</h3>
      <p className="stat-value">{stats.completedToday}</p>
    </div>
  </div>

        </div>
      )}

     <div className="activity-list">
  {activities.length === 0 ? (
    <p>Tidak ada aktivitas hari ini</p>
  ) : (
    activities.map((item, index) => (
      <div className="activity-item" key={index}>
        <span className="activity-time">{item.time}</span>
        <span className="activity-desc">{item.desc}</span>
      </div>
    ))
  )}
</div>
      {/* TIPS DAN PENGINGAT */}
      <div className="dashboard-section">
        <h2>Tips & Pengingat</h2>
        <div className="tips-container">
          <div className="tip-card">
            <h4>Update Status Pasien</h4>
            <p>Jangan lupa update status diagnosis setelah pemeriksaan.</p>
          </div>
          <div className="tip-card">
            <h4>Jadwal Istirahat</h4>
            <p>Ambil istirahat 15 menit setiap 2 jam untuk kesehatan.</p>
          </div>
        </div>
      </div>

    </DokterLayout>
  );
}