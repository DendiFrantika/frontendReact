import React, { useEffect, useState } from 'react';
import DokterLayout from './DokterLayout';
import axiosInstance from '../../api/axios';

export default function DashboardDokter() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingDiagnoses: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const res = await axiosInstance.get('/dokter/dashboard');

    const data = res.data?.data ?? res.data;

    setStats({
      todayAppointments: data.todayAppointments || 0,
      pendingDiagnoses: data.pendingDiagnoses || 0,
      completedToday: data.completedToday || 0,
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

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
