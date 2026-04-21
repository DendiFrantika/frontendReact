import React, { useEffect, useState } from 'react';
import DokterLayout from './DokterLayout';
import axiosInstance from '../../api/axios';
import './ProfileDokter.css';

export default function ProfileDokter() {
  const [dokter, setDokter] = useState({});
  const [form, setForm] = useState({});
  const [password, setPassword] = useState({
    password_lama: '',
    password_baru: '',
    password_baru_confirmation: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/dokter/profile');
      const data = res.data?.data || {};
      setDokter(data);
      setForm(data);
    } catch (err) {
      console.error(err);
      setDokter({});
      setForm({});
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axiosInstance.put('/dokter/profile', form);
      alert('Profile berhasil diupdate');
      fetchProfile();
    } catch (err) {
      alert('Gagal update profile');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      await axiosInstance.post('/dokter/password', password);
      alert('Password berhasil diubah');
      setPassword({
        password_lama: '',
        password_baru: '',
        password_baru_confirmation: ''
      });
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal update password');
    }
  };

  if (loading) {
    return (
      <DokterLayout title="Profile Dokter">
        <div className="loading-card">Memuat profile...</div>
      </DokterLayout>
    );
  }

  return (
    <DokterLayout title="Profile Dokter">

      {/* HEADER CARD */}
      <div className="profile-header-card">
        <div className="avatar">
          {dokter?.nama?.charAt(0)?.toUpperCase() || 'D'}
        </div>
        <div>
          <h2>{dokter?.nama || '-'}</h2>
          <p>{dokter?.spesialisasi || '-'}</p>
          <span className="badge">{dokter?.email || '-'}</span>
        </div>
      </div>

      {/* GRID CONTAINER */}
      <div className="profile-grid">

        {/* PROFILE FORM */}
        <div className="card">
          <h3>✏️ Edit Profile</h3>

          <input
            placeholder="Nama"
            value={form?.nama || ''}
            onChange={e => setForm({ ...form, nama: e.target.value })}
          />

          <input
            placeholder="Spesialisasi"
            value={form?.spesialisasi || ''}
            onChange={e => setForm({ ...form, spesialisasi: e.target.value })}
          />

          <input
            placeholder="No Telepon"
            value={form?.no_telepon || ''}
            onChange={e => setForm({ ...form, no_telepon: e.target.value })}
          />

          <input
            placeholder="No Identitas"
            value={form?.no_identitas || ''}
            onChange={e => setForm({ ...form, no_identitas: e.target.value })}
          />

          <input
            placeholder="No Lisensi"
            value={form?.no_lisensi || ''}
            onChange={e => setForm({ ...form, no_lisensi: e.target.value })}
          />

          <button onClick={handleUpdateProfile}>
            Simpan Profile
          </button>
        </div>

        {/* PASSWORD FORM */}
        <div className="card">
          <h3>🔐 Ganti Password</h3>

          <input
            type="password"
            placeholder="Password Lama"
            value={password.password_lama}
            onChange={e =>
              setPassword({ ...password, password_lama: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password Baru"
            value={password.password_baru}
            onChange={e =>
              setPassword({ ...password, password_baru: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Konfirmasi Password"
            value={password.password_baru_confirmation}
            onChange={e =>
              setPassword({
                ...password,
                password_baru_confirmation: e.target.value
              })
            }
          />

          <button className="danger" onClick={handleUpdatePassword}>
            Ubah Password
          </button>
        </div>

      </div>

    </DokterLayout>
  );
}