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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 18) return 'Selamat siang';
    return 'Selamat malam';
  };

  const fetchAktivitas = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/dokter/aktivitas-hari-ini');
      setActivities(res.data.data || []);
    } catch (err) {
      console.error('Error aktivitas:', err);
    }
  }, []);

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
        setError('Gagal memuat data dashboard');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    const controller = new AbortController();
    
    // Initial fetch
    fetchDashboardData(controller.signal);
    fetchAktivitas();

    // Auto Refresh 10 detik
    const interval = setInterval(() => {
      fetchDashboardData(controller.signal);
      fetchAktivitas();
    }, 10000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchDashboardData, fetchAktivitas]);

  if (authLoading) return <DokterLayout title="Dashboard"><p>Memuat...</p></DokterLayout>;
  if (!isAuthenticated) return null;

  return (
    <DokterLayout title="">
      {/* INTERNAL CSS */}
     <style>{`
  /* Pastikan layout utama tidak memotong konten */
  .dokter-layout {
    display: flex;
    height: 100vh;
    width: 100%;
    overflow: hidden; 
  }

  /* Area konten utama harus bisa scroll sendiri jika isinya panjang */
  .dokter-content {
    flex: 1;
    height: 100vh;
    overflow-y: auto; /* INI KUNCINYA: agar bisa scroll ke bawah */
    padding: 40px;
    display: flex;
    flex-direction: column;
    scroll-behavior: smooth;
  }

  .dashboard-header h1 { font-size: 1.5rem; color: #1e293b; margin-bottom: 4px; }
  .dashboard-header p { color: #64748b; margin-bottom: 24px; }
  
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
  .stat-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; transition: 0.3s; }
  .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
  .stat-info h3 { font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
  .stat-value { font-size: 2rem; font-weight: 800; color: #4f46e5; margin-top: 4px; }

  .activity-section { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 32px; }
  .activity-list { position: relative; padding-left: 20px; margin-top: 20px; }
  .activity-list::before { content: ''; position: absolute; left: 4px; top: 0; bottom: 0; width: 2px; background: #e2e8f0; }
  .activity-item { position: relative; padding-left: 24px; margin-bottom: 20px; }
  .activity-dot { position: absolute; left: -20px; top: 6px; width: 10px; height: 10px; background: #4f46e5; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 0 2px #e2e8f0; z-index: 1; }
  .activity-time { font-size: 0.75rem; font-weight: 700; color: #4f46e5; background: #eef2ff; padding: 2px 8px; border-radius: 10px; }
  .activity-desc { display: block; margin-top: 4px; font-size: 0.9rem; color: #334155; font-weight: 500; }

  /* Berikan padding bawah yang luas agar tidak mentok saat scroll */
  .dashboard-section { 
    margin-top: 20px; 
    padding-bottom: 100px; /* Jarak aman ekstra di paling bawah */
  }

  .tips-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .tip-card { display: flex; gap: 16px; padding: 20px; border-radius: 16px; background: white; border: 1px solid #e2e8f0; transition: 0.3s; }
  .tip-card.warning { border-left: 5px solid #f59e0b; }
  .tip-card.info { border-left: 5px solid #3b82f6; }
  .tip-icon { font-size: 1.5rem; background: #f8fafc; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
  .tip-text h4 { margin: 0 0 4px 0; font-size: 0.95rem; color: #1e293b; }
  .tip-text p { margin: 0; font-size: 0.85rem; color: #64748b; line-height: 1.5; }

  .empty-state { text-align: center; padding: 20px; color: #94a3b8; font-style: italic; }

  /* Perbaikan untuk Mobile */
  @media (max-width: 768px) {
    .dokter-layout { height: auto; overflow: visible; }
    .dokter-content { height: auto; overflow: visible; padding: 80px 20px 60px 20px; }
  }
`}</style>

      <div className="dashboard-header">
        <h1>{getGreeting()}, Dokter {dokter?.nama || '-'}</h1>
        <p>Berikut adalah ringkasan aktivitas dan performa Anda hari ini.</p>
      </div>

      {error && <div style={{ padding: 12, background: '#FEE2E2', color: '#991B1B', borderRadius: 8, marginBottom: 20 }}>{error}</div>}

      {loading ? (
        <p>Memuat data dashboard...</p>
      ) : (
        <>
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


          <div className="dashboard-section">
            <h2 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Tips & Pengingat</h2>
            <div className="tips-container">
              <div className="tip-card warning">
                <div className="tip-text">
                  <h4>Update Status Pasien</h4>
                  <p>Segera perbarui status diagnosis agar bagian administrasi dapat memproses resep obat.</p>
                </div>
              </div>
              <div className="tip-card info">
                <div className="tip-text">
                  <h4>Jadwal Istirahat</h4>
                  <p>Luangkan waktu 15 menit untuk peregangan mata dan tubuh setiap 2 jam praktik.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DokterLayout>
  );
}