import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Pengaturan() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  // ===== CSS LANGSUNG =====
  const styles = `
    .page-bg {
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    .card-custom {
      border-radius: 12px;
      transition: 0.3s;
    }

    .card-custom:hover {
      transform: translateY(-3px);
    }

    .form-container {
      max-width: 600px;
    }

    .nav-pills .nav-link {
      border-radius: 8px;
      font-weight: 500;
      padding: 8px 16px;
    }

    .nav-pills .nav-link.active {
      background-color: #0d6efd;
    }

    .danger-box {
      border: 1px solid #dc3545;
      border-radius: 10px;
      padding: 15px;
    }
  `;

  // ===== HELPER =====
  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const handleChangeProfile = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // ===== API =====
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axiosInstance.put('/admin/update-profile', profileData);
      showMessage('success', 'Profil berhasil diperbarui!');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      return showMessage('error', 'Konfirmasi password tidak cocok!');
    }

    setLoading(true);
    setMessage(null);

    try {
      await axiosInstance.put('/admin/update-password', passwordData);
      showMessage('success', 'Password berhasil diganti!');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Gagal mengganti password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Pengaturan">
      <>
        {/* INJECT CSS */}
        <style>{styles}</style>

        <div className="page-bg">
          <div className="container py-4">

            {/* TITLE */}
            <h3 className="fw-bold mb-4">Pengaturan Akun</h3>

            {/* NAV TAB */}
            <ul className="nav nav-pills mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profil
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  Keamanan
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === 'danger'
                      ? 'active bg-danger text-white'
                      : 'text-danger'
                  }`}
                  onClick={() => setActiveTab('danger')}
                >
                  Zona Bahaya
                </button>
              </li>
            </ul>

            {/* ALERT */}
            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                {message.text}
              </div>
            )}

            {/* CARD */}
            <div className="card card-custom shadow-sm border-0">
              <div className="card-body p-4">

                {/* PROFILE */}
                {activeTab === 'profile' && (
                  <>
                    <h5 className="fw-bold mb-2">Informasi Profil</h5>
                    <p className="text-muted mb-4">
                      Kelola informasi dasar akun Anda.
                    </p>

                    <form onSubmit={handleProfileUpdate} className="form-container">
                      <div className="mb-3">
                        <label className="form-label">Nama</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          value={profileData.name}
                          onChange={handleChangeProfile}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={profileData.email}
                          onChange={handleChangeProfile}
                          required
                        />
                      </div>

                      <button className="btn btn-primary" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                    </form>
                  </>
                )}

                {/* SECURITY */}
                {activeTab === 'security' && (
                  <>
                    <h5 className="fw-bold mb-2">Keamanan</h5>
                    <p className="text-muted mb-4">
                      Ganti password untuk menjaga keamanan akun Anda.
                    </p>

                    <form onSubmit={handlePasswordUpdate} className="form-container">
                      <div className="mb-3">
                        <label className="form-label">Password Saat Ini</label>
                        <input
                          type="password"
                          name="current_password"
                          className="form-control"
                          value={passwordData.current_password}
                          onChange={handleChangePassword}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Password Baru</label>
                        <input
                          type="password"
                          name="new_password"
                          className="form-control"
                          value={passwordData.new_password}
                          onChange={handleChangePassword}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Konfirmasi Password</label>
                        <input
                          type="password"
                          name="new_password_confirmation"
                          className="form-control"
                          value={passwordData.new_password_confirmation}
                          onChange={handleChangePassword}
                          required
                        />
                      </div>

                      <button className="btn btn-warning" disabled={loading}>
                        {loading ? 'Memproses...' : 'Update Password'}
                      </button>
                    </form>
                  </>
                )}

                {/* DANGER */}
                {activeTab === 'danger' && (
                  <>
                    <h5 className="fw-bold text-danger mb-2">Zona Bahaya</h5>
                    <p className="text-muted mb-4">
                      Aksi ini sensitif dan tidak dapat dibatalkan.
                    </p>

                    <div className="danger-box d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Logout Semua Perangkat</strong>
                        <div className="text-muted small">
                          Keluar dari semua sesi aktif akun Anda
                        </div>
                      </div>

                      <button className="btn btn-outline-danger">
                        Logout
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>

          </div>
        </div>
      </>
    </AdminLayout>
  );
}