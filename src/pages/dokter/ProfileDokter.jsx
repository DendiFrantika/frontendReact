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
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axiosInstance.put('/dokter/profile', form);
      alert('Profile berhasil diperbarui');
      fetchProfile();
    } catch (err) {
      alert('Gagal memperbarui profile');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      await axiosInstance.post('/dokter/password', password);
      alert('Password berhasil diubah');
      setPassword({ password_lama: '', password_baru: '', password_baru_confirmation: '' });
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal mengubah password');
    }
  };

  if (loading) {
    return (
      <DokterLayout title="Profile">
        <div className="loading-state">Sedang memuat data...</div>
      </DokterLayout>
    );
  }

  return (
    <DokterLayout title="Profil Saya">
      <div className="profile-container">
        
        {/* HERO SECTION */}
        <div className="profile-hero">
          <div className="hero-content">
            <div className="hero-avatar">
              {dokter?.nama?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <div className="hero-text">
              <h2>{dokter?.nama || 'Nama Dokter'}</h2>
              <p>{dokter?.spesialisasi || 'Spesialisasi'}</p>
              <div className="hero-badge">{dokter?.email}</div>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* FORM INFORMASI UMUM */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Informasi Pribadi</h3>
              <p>Kelola informasi dasar akun Anda</p>
            </div>
            
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                value={form?.nama || ''}
                onChange={e => setForm({ ...form, nama: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Spesialisasi</label>
                <input
                  value={form?.spesialisasi || ''}
                  onChange={e => setForm({ ...form, spesialisasi: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>No. Telepon</label>
                <input
                  value={form?.no_telepon || ''}
                  onChange={e => setForm({ ...form, no_telepon: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>No. Identitas (KTP)</label>
              <input
                value={form?.no_identitas || ''}
                onChange={e => setForm({ ...form, no_identitas: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>No. Lisensi (STR)</label>
              <input
                value={form?.no_lisensi || ''}
                onChange={e => setForm({ ...form, no_lisensi: e.target.value })}
              />
            </div>

            <button className="btn-primary" onClick={handleUpdateProfile}>
              Simpan Perubahan
            </button>
          </div>

          {/* FORM KEAMANAN */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Keamanan</h3>
              <p>Perbarui kata sandi secara berkala</p>
            </div>

            <div className="form-group">
              <label>Kata Sandi Lama</label>
              <input
                type="password"
                value={password.password_lama}
                onChange={e => setPassword({ ...password, password_lama: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Kata Sandi Baru</label>
              <input
                type="password"
                value={password.password_baru}
                onChange={e => setPassword({ ...password, password_baru: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                value={password.password_baru_confirmation}
                onChange={e => setPassword({ ...password, password_baru_confirmation: e.target.value })}
              />
            </div>

            <button className="btn-outline-danger" onClick={handleUpdatePassword}>
              Ubah Kata Sandi
            </button>
          </div>
        </div>
      </div>
    </DokterLayout>
  );
}