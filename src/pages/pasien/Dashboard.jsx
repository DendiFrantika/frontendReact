import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../admin/Dashboard.css';
import './pasien-pages.css';
import { normalizeProfile } from './pasien-helpers';

// ✅ normalize langsung di sini, sesuai struktur API yang sudah diketahui
const normalizeAppointment = (item) => ({
  id: item.id,
  date: item.tanggal_pendaftaran
    ? new Date(item.tanggal_pendaftaran).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : '-',
  time: item.jam_kunjungan
    ? item.jam_kunjungan.substring(0, 5)
    : '-',
  doctorName: item.dokter?.nama ?? '-',
  specialty:  item.dokter?.spesialisasi ?? '-',
  status:     item.status ?? '-',
  noAntrian:  item.no_antrian ?? '-',
});

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [pasienId, setPasienId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Fetch profile & appointments secara paralel
      const [profileRes, apptRes] = await Promise.all([
        axiosInstance.get('/pasien/profile'),
        axiosInstance.get('/pasien/appointments'),
      ]);

      // Profile
      const profileBody = profileRes.data?.data ?? profileRes.data;
      setProfile(normalizeProfile(profileBody, user));
      setPasienId(profileBody?.id ?? null);

      // Appointments — data ada di .data (pagination Laravel)
      const rawList = apptRes.data?.data ?? apptRes.data ?? [];
      setAppointments(rawList.map(normalizeAppointment));

    } catch (err) {
      console.error('Error loading pasien dashboard data', err);
      setError(
        err.response?.data?.message ??
          'Gagal memuat data. Periksa koneksi atau coba lagi nanti.'
      );
      setProfile(normalizeProfile(null, user));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const quickLinks = [
    { icon: '👤', label: 'Profil',        to: '/pasien/profil' },
    { icon: '📝', label: 'Daftar Berobat', to: '/pasien/daftar-berobat' },
    { icon: '📜', label: 'Riwayat',        to: '/pasien/riwayat' },
    { icon: '⏳', label: 'Antrian',        to: '/pasien/antrian' },
  ];

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <header className="pasien-page-header">
          <h1>Dashboard Pasien</h1>
          {profile && (
              <div className="info-box">
                <p>Selamat datang, <strong>{profile.name}</strong>!</p>
              </div>
            )}
        </header>

        {error && (
          <div className="pasien-banner pasien-banner--error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Memuat data…</div>
        ) : (
          <>
            

            <div className="dashboard-section" style={{ marginTop: 24 }}>
              <h2>Janji temu mendatang</h2>
              {appointments.length > 0 ? (
                <div className="pasien-table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Dokter</th>
                        <th>Spesialis</th>
                        <th>Jam</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a.id}>
                          <td>{a.date}</td>
                          <td>{a.doctorName}</td>
                          <td>{a.specialty}</td>
                          <td>{a.time}</td>
                          <td>{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="pasien-empty">
                  Tidak ada janji temu mendatang.{' '}
                  <Link to="/pasien/daftar-berobat">Daftar berobat</Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}