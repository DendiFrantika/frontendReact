import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../admin/Dashboard.css';
import './pasien-pages.css';
import {
  unwrapList,
  normalizeProfile,
  normalizeAppointmentRow,
  parsePasienDashboardResponse,
} from './pasien-helpers';

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
      const dashRes = await axiosInstance.get('/pasien/dashboard');
      const { pasienId: pid, profileRaw, appointmentsRaw } =
        parsePasienDashboardResponse(dashRes.data);

      setPasienId(pid != null ? Number(pid) || pid : null);

      let profileBody = profileRaw;
      if (!profileBody || typeof profileBody !== 'object') {
        const profileRes = await axiosInstance.get('/pasien/profile');
        profileBody = profileRes.data?.data ?? profileRes.data;
      }
      setProfile(normalizeProfile(profileBody, user));

      let rawList = appointmentsRaw;
      if (!rawList.length) {
        const apptRes = await axiosInstance.get('/pasien/appointments?upcoming=true');
        rawList = unwrapList(apptRes.data);
      }
      setAppointments(rawList.map(normalizeAppointmentRow));
    } catch (err) {
      console.error('Error loading pasien dashboard data', err);
      setError(
        err.response?.data?.message ??
          'Gagal memuat data. Periksa koneksi atau coba lagi nanti.'
      );
      setPasienId(null);
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
    { icon: '👤', label: 'Profil', to: '/pasien/profil' },
    { icon: '📝', label: 'Daftar Berobat', to: '/pasien/daftar-berobat' },
    { icon: '📜', label: 'Riwayat', to: '/pasien/riwayat' },
    { icon: '⏳', label: 'Antrian', to: '/pasien/antrian' },
  ];

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <header className="pasien-page-header">
          <h1>Dashboard pasien</h1>
          <p>Ringkasan janji temu dan akses layanan</p>
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
            {profile && (
              <div className="info-box">
                <p>
                  Selamat datang, <strong>{profile.name}</strong>!
                </p>
                {pasienId != null && <p>ID pasien: {pasienId}</p>}
                <p>Email: {profile.email}</p>
                <p>No. telepon: {profile.phone}</p>
              </div>
            )}

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
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a.id}>
                          <td>{a.date}</td>
                          <td>{a.doctorName}</td>
                          <td>{a.specialty}</td>
                          <td>{a.time}</td>
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

            <div className="dashboard-section" style={{ marginTop: 24 }}>
              <h2>Akses cepat</h2>
              <div className="quick-actions">
                {quickLinks.map((link) => (
                  <Link key={link.to} to={link.to} className="action-btn">
                    <div className="action-icon">{link.icon}</div>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
