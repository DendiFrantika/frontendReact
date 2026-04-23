import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './pasien-pages.css';
import { normalizeProfile } from './pasien-helpers';

const normalizeAppointment = (item) => ({
  id: item.id,
  date: item.tanggal_pendaftaran
    ? new Date(item.tanggal_pendaftaran).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : '-',
  time: item.jam_kunjungan ? item.jam_kunjungan.substring(0, 5) : '-',
  doctorName: item.dokter?.nama ?? '-',
  specialty: item.dokter?.spesialisasi ?? '-',
  status: item.status ?? 'Menunggu',
});

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, apptRes] = await Promise.all([
        axiosInstance.get('/pasien/profile'),
        axiosInstance.get('/pasien/appointments'),
      ]);

      const profileBody = profileRes.data?.data ?? profileRes.data;
      setProfile(normalizeProfile(profileBody, user));

      const rawList = apptRes.data?.data ?? apptRes.data ?? [];
      setAppointments(rawList.map(normalizeAppointment));
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="admin-layout">
      {/* Sidebar akan berada di kiri karena parent (.admin-layout) adalah flex */}
      <Sidebar />

      <main className="admin-content">
        <header className="pasien-page-header">
          <h1>Halo, {profile?.name || 'Pasien'} 👋</h1>
          <p>Selamat datang kembali. Berikut adalah ringkasan kesehatan Anda.</p>
        </header>

        {error && (
          <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
        )}

        {loading ? (
          <div className="loading">Memuat informasi dashboard...</div>
        ) : (
          <div className="dashboard-container">
            {/* STAT CARDS */}
            <div className="pasien-stats-grid">
              <div className="stat-card">
                <span>Total Janji Temu</span>
                <h3>{appointments.length}</h3>
              </div>
              <div className="stat-card">
                <span>Status Akun</span>
                <h3 style={{ color: '#059669' }}>Aktif</h3>
              </div>
            </div>

            <div className="dashboard-section">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px' 
              }}>
                <h2 style={{ fontSize: '1.25rem', color: '#111827', margin: 0 }}>
                  Jadwal Kunjungan Terdekat
                </h2>
                <Link to="/pasien/daftar-berobat" className="btn-primary">
                  + Buat Janji
                </Link>
              </div>

              {appointments.length > 0 ? (
                <div className="pasien-table-wrap">
                  <table className="pasien-table">
                    <thead>
                      <tr>
                        <th>Tanggal Kunjungan</th>
                        <th>Dokter</th>
                        <th>Spesialis</th>
                        <th>Jam</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 600 }}>{a.date}</td>
                          <td>{a.doctorName}</td>
                          <td>
                            <span style={{ color: '#6b7280' }}>{a.specialty}</span>
                          </td>
                          <td>{a.time} WIB</td>
                          <td>
                            <span className={`badge ${
                              a.status.toLowerCase() === 'selesai' 
                                ? 'badge-success' 
                                : 'badge-pending'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="pasien-empty">
                  <p>Sepertinya Anda belum memiliki jadwal janji temu dengan dokter.</p>
                  <Link to="/pasien/daftar-berobat" className="btn-primary">
                    Daftar Berobat Sekarang
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}