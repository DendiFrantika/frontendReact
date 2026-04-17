'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';
import './Dashboard.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts'; // npm install recharts
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPasien: 11,
    totalDokter: 0,
    totalPendaftaran: 0,
    totalLayanan: 0,
    pendaftaranHariIni: 0,
    pasienBaru: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchChartData(timeRange);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/admin/recent-activities')
      ]);
      
      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (range) => {
    try {
      const response = await axiosInstance.get(`/admin/chart-data?range=${range}`);
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Mock data for demo
      setChartData([
        { name: 'Senin', pendaftaran: 12, pasien: 8 },
        { name: 'Selasa', pendaftaran: 19, pasien: 11 },
        { name: 'Rabu', pendaftaran: 15, pasien: 9 },
        { name: 'Kamis', pendaftaran: 22, pasien: 14 },
        { name: 'Jumat', pendaftaran: 18, pasien: 10 },
        { name: 'Sabtu', pendaftaran: 10, pasien: 6 },
      ]);
    }
  };

  const quickActions = [
    { icon: '👥', label: 'Manajemen Pasien', link: '/admin/pasien' },
    { icon: '👨‍⚕️', label: 'Kelola Dokter', link: '/admin/dokter' },
    { icon: '📅', label: 'Jadwal', link: '/admin/jadwal' },
    { icon: '📊', label: 'Laporan', link: '/admin/laporan' },
    { icon: '⚙️', label: 'Pengaturan', link: '/admin/pengaturan' },
    { icon: '📈', label: 'Analytics', link: '/admin/analytics' },
  ];

  // Pie chart data for services
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const serviceData = [
    { name: 'Umum', value: 40, fill: COLORS[0] },
    { name: 'Gigi', value: 25, fill: COLORS[1] },
    { name: 'Mata', value: 20, fill: COLORS[2] },
    { name: 'Kulit', value: 15, fill: COLORS[3] },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} menit yang lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    } else {
      return `${diffDays} hari yang lalu`;
    }
  };

  return (
    <AdminLayout>
        <div className="dashboard-header">
          <h1>Dashboard Admin</h1>
          <p>Selamat datang di dashboard administratif Klinik Medis</p>
          <div className="date-info">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Memuat data...
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Total Pasien</h3>
                  <p className="stat-value">{stats.totalPasien.toLocaleString()}</p>
                  <small>+{stats.pasienBaru} baru bulan ini</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👨‍⚕️</div>
                <div className="stat-info">
                  <h3>Total Dokter</h3>
                  <p className="stat-value">{stats.totalDokter}</p>
                  <small>Aktif: {Math.floor(stats.totalDokter * 0.8)}</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <h3>Pendaftaran</h3>
                  <p className="stat-value">{stats.totalPendaftaran.toLocaleString()}</p>
                  <small>Hari ini: {stats.pendaftaranHariIni}</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏥</div>
                <div className="stat-info">
                  <h3>Total Layanan</h3>
                  <p className="stat-value">{stats.totalLayanan}</p>
                  <small>4 kategori utama</small>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.link} className="action-btn">
                    <div className="action-icon">{action.icon}</div>
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="dashboard-sections">
              {/* Recent Activities */}
              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Aktivitas Terbaru</h2>
                  <Link to="/admin/aktivitas" className="view-all">Lihat semua →</Link>
                </div>
                <div className="activity-list">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                        <div key={activity.id || index} className="activity-item">
                        <span className="activity-icon">{activity.icon || '📝'}</span>
                        <div className="activity-info">
                          <p>{activity.description}</p>
                          <span className="time">{formatDate(activity.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="activity-item">
                        <span className="activity-icon">📝</span>
                        <div className="activity-info">
                          <p>Pendaftaran baru dari pasien John Doe</p>
                          <span className="time">2 jam yang lalu</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">📄</span>
                        <div className="activity-info">
                          <p>Rekam medis Dr. Smith diperbarui</p>
                          <span className="time">1 jam yang lalu</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">💰</span>
                        <div className="activity-info">
                          <p>Pembayaran baru diterima</p>
                          <span className="time">30 menit yang lalu</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Statistics Chart */}
              <section className="dashboard-section">
                <h2>Distribusi Layanan</h2>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                        // per-slice color provided in data via `fill`
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* Bar Chart Section */}
            <div className="chart-container">
              <div className="chart-header">
                <h2>Statistik Pendaftaran</h2>
                <select 
                  className="chart-select" 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="week">Minggu ini</option>
                  <option value="month">Bulan ini</option>
                  <option value="year">Tahun ini</option>
                </select>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pendaftaran" fill="#8884d8" name="Pendaftaran" />
                    <Bar dataKey="pasien" fill="#82ca9d" name="Pasien Baru" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
    </AdminLayout>
  );
};

export default AdminDashboard;