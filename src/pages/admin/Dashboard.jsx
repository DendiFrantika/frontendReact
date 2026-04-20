'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import './Dashboard.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts'; // npm install recharts
import { Link } from 'react-router-dom';
import { requestWithFallback } from '../../services/adminCrudApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPasien: 0,
    totalDokter: 0,
    totalPendaftaran: 0,
    totalLayanan: 0,
    pendaftaranHariIni: 0,
    pasienBaru: 0,
    dokterAktif: 0,
  });
  
  const [serviceData, setServiceData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      const statsRes = await requestWithFallback([
        { method: 'get', url: '/admin/dashboard' },
        { method: 'get', url: '/dashboard' },
        { method: 'get', url: '/dashboard/stats' },
      ]);
      const data = statsRes.data;
      
      setStats({
        totalPasien: data.totalPasien || data.total_pasien || 0,
        totalDokter: data.totalDokter || data.total_dokter || 0,
        totalPendaftaran: data.totalPendaftaran || data.total_pendaftaran || 0,
        totalLayanan: data.totalLayanan || data.total_layanan || data.statistikDokter?.spesialisasi?.length || 0,
        pendaftaranHariIni: data.pendaftaranHariIni || data.pendaftaran_hari_ini || 0,
        pasienBaru: data.pasienBaru || data.pasien_baru || data.statistikPasien?.pasienBaruHariIni || 0,
        dokterAktif: data.dokterAktif || data.dokter_aktif || data.totalDokter || 0,
      });

      // Update service data dari API jika tersedia
      if (data.statistikDokter?.spesialisasi?.length > 0) {
         const mapped = data.statistikDokter.spesialisasi.map((s, i) => ({
            name: s.spesialisasi || s.nama || 'Umum',
            value: parseInt(s.total || s.jumlah || 0, 10),
            fill: COLORS[i % COLORS.length]
         }));
         setServiceData(mapped);
      } else if (data.layanan || data.services) {
        // Fallback ke data layanan jika spesialisasi tidak tersedia
        const services = data.layanan || data.services || [];
        const mapped = services.map((s, i) => ({
          name: s.nama || s.name || `Layanan ${i+1}`,
          value: parseInt(s.total || s.jumlah || 0, 10),
          fill: COLORS[i % COLORS.length]
        }));
        setServiceData(mapped);
      }
      
      // Fetch recent activities
      try {
        const activitiesRes = await requestWithFallback([
          { method: 'get', url: '/admin/recent-activities' },
          { method: 'get', url: '/dashboard/recent-activities' },
          { method: 'get', url: '/admin/aktivitas/recent' },
        ]);
        setRecentActivities(activitiesRes.data || []);
      } catch (e) {
        console.warn('Recent activities endpoint not available, using empty array');
        setRecentActivities([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values jika API gagal
      setStats({
        totalPasien: 0,
        totalDokter: 0,
        totalPendaftaran: 0,
        totalLayanan: 0,
        pendaftaranHariIni: 0,
        pasienBaru: 0,
        dokterAktif: 0,
      });
      setServiceData([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  const fetchChartData = useCallback(async (range) => {
    try {
      const response = await requestWithFallback([
        { method: 'get', url: `/admin/chart-data?range=${range}` },
        { method: 'get', url: `/dashboard/chart-data?range=${range}` },
        { method: 'get', url: `/admin/dashboard/chart?range=${range}` },
      ]);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setChartData(response.data);
      } else {
        // Set empty array jika tidak ada data
        setChartData([]);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Set empty array instead of mock data
      setChartData([]);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh setiap 5 menit
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchDashboardData();
        fetchChartData(timeRange);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loading, refreshing, timeRange, fetchDashboardData, fetchChartData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    await fetchChartData(timeRange);
    setRefreshing(false);
    setLastUpdated(new Date());
  };

  const laporanCards = [
    { icon: '👥', label: 'Laporan Pasien', link: '/admin/laporan/pasien', description: 'Lihat daftar pasien dan ringkasan laporan.' },
    { icon: '🩺', label: 'Laporan Rekam Medis', link: '/admin/laporan/rekam-medis', description: 'Analisis rekam medis pasien.' },
    { icon: '👨‍⚕️', label: 'Laporan Dokter', link: '/admin/laporan/dokter', description: 'Statistik pasien per dokter.' },
    { icon: '🗓️', label: 'Laporan Pendaftaran', link: '/admin/laporan/pendaftaran', description: 'Laporan status pendaftaran.' },
  ];

  const quickActions = [
    { icon: '🔀', label: 'Alur Admin–Kasir', link: '/admin/alur-kerja' },
    { icon: '👥', label: 'Manajemen Pasien', link: '/admin/pasien' },
    { icon: '👨‍⚕️', label: 'Kelola Dokter', link: '/admin/dokter' },
    { icon: '📅', label: 'Jadwal', link: '/admin/jadwal' },
    { icon: '📊', label: 'Laporan', link: '/admin/laporan' },
    { icon: '⚙️', label: 'Pengaturan', link: '/admin/pengaturan' },
    { icon: '📈', label: 'Analytics', link: '/admin/analytics' },
  ];

  // Pie chart data handled via state

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
          <div className="header-info">
            <small style={{ color: '#7f8c8d', fontSize: '14px' }}>
              📊 Data diperbarui otomatis setiap 5 menit • Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
            </small>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleRefresh} 
              disabled={refreshing || loading}
              className="refresh-btn"
              style={{
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: refreshing || loading ? 'not-allowed' : 'pointer',
                opacity: refreshing || loading ? 0.6 : 1
              }}
            >
              {refreshing ? '🔄 Memuat...' : '🔄 Refresh Data'}
            </button>
          </div>
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
                  <small>{stats.pasienBaru > 0 ? `+${stats.pasienBaru} baru bulan ini` : 'Data terbaru'}</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👨‍⚕️</div>
                <div className="stat-info">
                  <h3>Total Dokter</h3>
                  <p className="stat-value">{stats.totalDokter}</p>
                  <small>{stats.dokterAktif > 0 ? `${stats.dokterAktif} aktif` : 'Data terbaru'}</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <h3>Pendaftaran</h3>
                  <p className="stat-value">{stats.totalPendaftaran.toLocaleString()}</p>
                  <small>{stats.pendaftaranHariIni > 0 ? `Hari ini: ${stats.pendaftaranHariIni}` : 'Data terbaru'}</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏥</div>
                <div className="stat-info">
                  <h3>Total Layanan</h3>
                  <p className="stat-value">{stats.totalLayanan}</p>
                  <small>{serviceData.length > 0 ? `${serviceData.length} kategori` : 'Data terbaru'}</small>
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

            <div className="dashboard-section">
              <h2>Menu Laporan</h2>
              <div className="quick-actions">
                {laporanCards.map((action) => (
                  <Link key={action.label} to={action.link} className="action-btn">
                    <div className="action-icon">{action.icon}</div>
                    <strong>{action.label}</strong>
                    <span style={{ marginTop: '8px', display: 'block', color: '#7f8c8d', fontSize: '0.95rem' }}>
                      {action.description}
                    </span>
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
                          <p>{activity.description || activity.message || activity.title}</p>
                          <span className="time">{formatDate(activity.timestamp || activity.created_at)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="activity-item">
                      <span className="activity-icon">ℹ️</span>
                      <div className="activity-info">
                        <p>Belum ada aktivitas terbaru</p>
                        <span className="time">Data akan muncul saat ada aktivitas</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Statistics Chart */}
              <section className="dashboard-section">
                <h2>Distribusi Layanan</h2>
                <div style={{ height: '250px' }}>
                  {serviceData.length > 0 ? (
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
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      color: '#7f8c8d',
                      fontSize: '16px'
                    }}>
                      Belum ada data layanan
                    </div>
                  )}
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
                {chartData.length > 0 ? (
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
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: '#7f8c8d',
                    fontSize: '16px'
                  }}>
                    Belum ada data statistik untuk periode ini
                  </div>
                )}
              </div>
            </div>
          </>
        )}
    </AdminLayout>
  );
};

export default AdminDashboard;