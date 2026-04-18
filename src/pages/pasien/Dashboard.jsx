import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);

    try {
      const [profileRes, apptRes] = await Promise.all([
        axiosInstance.get('/pasien/profile'),
        axiosInstance.get('/pasien/appointments?upcoming=true')
      ]);

      setProfile(profileRes.data);
      setAppointments(apptRes.data);

    } catch (err) {
      console.error('Error loading pasien dashboard data', err);

      // fallback mock data
      setProfile({
        name: user?.nama,
        email: user?.email,
        phone: user?.phone
      });

      setAppointments([
        { id: 1, date: '2026-03-01', doctorName: 'Dr. A', specialty: 'Umum', time: '10:00' },
        { id: 2, date: '2026-03-05', doctorName: 'Dr. B', specialty: 'Gigi', time: '14:00' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [user]);

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
        <h1>Dashboard Pasien</h1>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <>
            {profile && (
              <div className="info-box">
                <p>Selamat datang, <strong>{profile.name || user?.nama}</strong>!</p>
                <p>Email: {profile.email}</p>
                <p>No. Telepon: {profile.phone}</p>
              </div>
            )}

            <div className="dashboard-section">
              <h2>Janji Temu Mendatang</h2>
              {appointments.length > 0 ? (
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
              ) : (
                <p>Tidak ada janji temu mendatang.</p>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Akses Cepat</h2>
              <div className="quick-actions">
                {quickLinks.map(link => (
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
