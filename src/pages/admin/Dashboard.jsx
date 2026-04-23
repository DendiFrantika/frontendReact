'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';
import './Dashboard.css';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
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
  const [chartLoading, setChartLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [kunjunganChart, setKunjunganChart] = useState([]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await requestWithFallback([
        { method: 'get', url: '/admin/analytics' },
      ]);
      setKunjunganChart(res.data.chart);
    } catch (err) {
      console.error('Gagal ambil analytics', err);
      setKunjunganChart([]);
    }
  }, []);

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

      if (data.statistikDokter?.spesialisasi?.length > 0) {
        setServiceData(
          data.statistikDokter.spesialisasi.map((s) => ({
            name: s.spesialisasi || s.nama || 'Umum',
            value: parseInt(s.total || s.jumlah || 0, 10),
          }))
        );
      } else if (data.layanan || data.services) {
        const services = data.layanan || data.services || [];
        setServiceData(
          services.map((s, i) => ({
            name: s.nama || s.name || `Layanan ${i + 1}`,
            value: parseInt(s.total || s.jumlah || 0, 10),
          }))
        );
      }

      try {
        const activitiesRes = await axiosInstance.get('/admin/aktivitas-hari-ini');
        const actData = Array.isArray(activitiesRes.data)
          ? activitiesRes.data
          : Array.isArray(activitiesRes.data?.data) ? activitiesRes.data.data : [];
        setRecentActivities(
          actData
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3)
        );
      } catch {
        setRecentActivities([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({ totalPasien: 0, totalDokter: 0, totalPendaftaran: 0, totalLayanan: 0, pendaftaranHariIni: 0, pasienBaru: 0, dokterAktif: 0 });
      setServiceData([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  const fetchChartData = useCallback(async (range) => {
    setChartLoading(true);
    try {
      const response = await requestWithFallback([
        { method: 'get', url: `/admin/chart-data?range=${range}` },
        { method: 'get', url: `/dashboard/chart-data?range=${range}` },
        { method: 'get', url: `/admin/dashboard/chart?range=${range}` },
      ]);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setChartData(response.data);
      } else {
        setChartData([]);
      }
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
    fetchChartData(timeRange);
  }, [fetchDashboardData, fetchAnalytics, fetchChartData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchDashboardData();
        fetchChartData(timeRange);
        fetchAnalytics();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loading, refreshing, timeRange, fetchDashboardData, fetchChartData, fetchAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    await fetchChartData(timeRange);
    setRefreshing(false);
    setLastUpdated(new Date());
  };

  const laporanCards = [
    { label: 'Laporan Pasien', link: '/admin/laporan/pasien', description: 'Daftar pasien dan ringkasan laporan keseluruhan.' },
    { label: 'Laporan Rekam Medis', link: '/admin/laporan/rekam-medis', description: 'Analisis rekam medis pasien secara lengkap.' },
    { label: 'Laporan Dokter', link: '/admin/laporan/dokter', description: 'Statistik jumlah pasien per dokter.' },
    { label: 'Laporan Pendaftaran', link: '/admin/laporan/pendaftaran', description: 'Laporan berdasarkan status pendaftaran.' },
  ];

  const formatDate = (dateString) => {
    const diffMs = new Date() - new Date(dateString);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

  const badgeMap = {
    pendaftaran_baru: { label: 'Pendaftaran Baru', colorClass: 'badge-blue', dotClass: 'dot-blue' },
    jadwal_periksa:   { label: 'Jadwal Periksa',   colorClass: 'badge-amber', dotClass: 'dot-amber' },
    rekam_medis:      { label: 'Rekam Medis',      colorClass: 'badge-green', dotClass: 'dot-green' },
  };

  /* ── warna pie chart layanan ── */
  const serviceDataWithColor = serviceData.map((item, i) => ({
    ...item,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <AdminLayout>
      {/* ── HEADER ── */}
      <div className="dashboard-header">
        <h1>Dashboard Admin</h1>
        <p>Selamat datang di dashboard administratif Klinik Medis</p>
        <div className="header-info">
          <small>
            Data diperbarui otomatis setiap 5 menit &bull; Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
          </small>
        </div>
        <div className="header-actions">
          <button
            className="db-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Memuat...' : 'Refresh Data'}
          </button>
        </div>
        <div className="date-info">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </div>
      </div>

      {loading ? (
        <div className="db-loading">
          <div className="db-spinner" />
          Memuat data...
        </div>
      ) : (
        <>
          {/* ── STAT CARDS ── */}
          <div className="db-stats-grid">
            <div className="db-stat-card">
              <div className="db-stat-label">Total Pasien</div>
              <div className="db-stat-num">{stats.totalPasien.toLocaleString()}</div>
              <span className="db-pill pill-blue">
                {stats.pasienBaru > 0 ? `+${stats.pasienBaru} baru bulan ini` : 'Data terbaru'}
              </span>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-label">Total Dokter</div>
              <div className="db-stat-num">{stats.totalDokter}</div>
              <span className="db-pill pill-green">
                {stats.dokterAktif > 0 ? `${stats.dokterAktif} aktif` : 'Data terbaru'}
              </span>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-label">Pendaftaran</div>
              <div className="db-stat-num">{stats.totalPendaftaran.toLocaleString()}</div>
              <span className="db-pill pill-amber">
                {stats.pendaftaranHariIni > 0 ? `Hari ini: ${stats.pendaftaranHariIni}` : 'Data terbaru'}
              </span>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-label">Total Layanan</div>
              <div className="db-stat-num">{stats.totalLayanan}</div>
              <span className="db-pill pill-muted">
                {serviceData.length > 0 ? `${serviceData.length} kategori` : 'Data terbaru'}
              </span>
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <hr className="db-divider" />

          {/* ── LAPORAN ── */}
          <div className="db-section-label">Menu Laporan</div>
          <div className="db-laporan-grid">
            {laporanCards.map((card) => (
              <Link key={card.label} to={card.link} className="db-laporan-card">
                <div className="db-laporan-title">{card.label}</div>
                <div className="db-laporan-desc">{card.description}</div>
              </Link>
            ))}
          </div>

          <hr className="db-divider" />

          {/* ── AKTIVITAS + DISTRIBUSI ── */}
          <div className="db-two-col">
            {/* Aktivitas */}
            <div className="db-panel">
              <div className="db-panel-header">
                <span className="db-panel-title">Aktivitas Terbaru</span>
                <Link to="/admin/aktivitas" className="db-view-all">Lihat semua →</Link>
              </div>
              <div className="db-activity-list">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => {
                    const badge = badgeMap[activity.type] ?? { label: 'Aktivitas', colorClass: 'badge-muted', dotClass: 'dot-muted' };
                    return (
                      <div key={activity.id || index} className="db-activity-item">
                        <span className={`db-act-dot ${badge.dotClass}`} />
                        <div className="db-act-body">
                          <span className={`db-act-badge ${badge.colorClass}`}>{badge.label}</span>
                          <p className="db-act-desc">{activity.description ?? '-'}</p>
                          <span className="db-act-time">{formatDate(activity.timestamp || activity.created_at)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="db-activity-item">
                    <span className="db-act-dot dot-muted" />
                    <div className="db-act-body">
                      <p className="db-act-desc">Belum ada aktivitas hari ini</p>
                      <span className="db-act-time">Data akan muncul saat ada aktivitas</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Distribusi Layanan */}
            <div className="db-panel">
              <div className="db-panel-header">
                <span className="db-panel-title">Distribusi Layanan</span>
              </div>
              {serviceDataWithColor.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={serviceDataWithColor}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {serviceDataWithColor.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="db-empty" style={{ height: 250 }}>Belum ada data layanan</div>
              )}
            </div>
          </div>

          <hr className="db-divider" />

          {/* ── CHARTS ── */}
          <div className="db-chart-row">
            {/* Bar Chart */}
            <div className="db-panel">
              <div className="db-chart-header">
                <span className="db-panel-title">Statistik Pendaftaran</span>
                <select
                  className="db-chart-select"
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value);
                    fetchChartData(e.target.value);
                  }}
                >
                  <option value="week">Minggu ini</option>
                  <option value="month">Bulan ini</option>
                  <option value="year">Tahun ini</option>
                </select>
              </div>
              {chartLoading ? (
                <div className="db-empty" style={{ height: 180 }}>Memuat data...</div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="pendaftaran" fill="#378ADD" name="Pendaftaran" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="pasien" fill="#639922" name="Pasien Baru" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="db-empty" style={{ height: 180 }}>Belum ada data statistik untuk periode ini</div>
              )}
            </div>

            {/* Line Chart */}
            <div className="db-panel">
              <div className="db-chart-header">
                <span className="db-panel-title">Kunjungan 7 Hari Terakhir</span>
              </div>
              {kunjunganChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={kunjunganChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="hari" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }} />
                    <Line
                      type="monotone"
                      dataKey="pasien"
                      stroke="#378ADD"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#378ADD' }}
                      activeDot={{ r: 5 }}
                      name="Kunjungan pasien"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="db-empty" style={{ height: 180 }}>Belum ada data kunjungan</div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;