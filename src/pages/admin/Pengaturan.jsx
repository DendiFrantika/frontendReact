import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Pengaturan.css';

export default function Pengaturan() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      return showMessage('error', 'Konfirmasi password tidak cocok');
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/change-password', {
        current_password: passwordData.current_password,
        password: passwordData.new_password,
        password_confirmation: passwordData.new_password_confirmation,
      });

      showMessage('success', 'Password berhasil diperbarui');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err) {
      showMessage('error', 'Gagal mengganti password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Logout semua perangkat?')) return;
    await axiosInstance.post('/auth/logout');
    logout();
  };

  const navItems = [
    { key: 'profile', label: 'Profil' },
    { key: 'security', label: 'Keamanan' },
    { key: 'danger', label: 'Akun' },
  ];

  return (
    <AdminLayout title="">
      <div className="pg-wrapper">

        {/* HEADER */}
        <div className="pg-header">
          <h2>Pengaturan Akun</h2>
          <p>Kelola informasi dan keamanan akun Anda</p>
        </div>

        <div className="pg-layout">

          {/* SIDEBAR */}
          <div className="pg-nav">
            {navItems.map(tab => (
              <button
                key={tab.key}
                className={`pg-nav-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="pg-card">

            {message && (
              <div className={`pg-alert ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <>
                <h3 className="pg-title">Informasi Akun</h3>

                <div className="pg-info-grid">
                  <div>
                    <label>Nama</label>
                    <p>{user?.name}</p>
                  </div>

                  <div>
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>

                  <div>
                    <label>Role</label>
                    <p>{user?.role}</p>
                  </div>

                  <div>
                    <label>Terdaftar</label>
                    <p>
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('id-ID')
                        : '-'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
              <>
                <h3 className="pg-title">Ganti Password</h3>

                <form onSubmit={handlePasswordUpdate} className="pg-form">
                  <input
                    type="password"
                    placeholder="Password lama"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current_password: e.target.value })
                    }
                  />

                  <input
                    type="password"
                    placeholder="Password baru"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new_password: e.target.value })
                    }
                  />

                  <input
                    type="password"
                    placeholder="Konfirmasi password"
                    value={passwordData.new_password_confirmation}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password_confirmation: e.target.value,
                      })
                    }
                  />

                  <button disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Update Password'}
                  </button>
                </form>
              </>
            )}

            {/* DANGER */}
            {activeTab === 'danger' && (
              <>
                <h3 className="pg-title text-danger">Manajemen Akun</h3>

                <div className="pg-danger-box">
                  <div>
                    <p className="pg-danger-title">Logout semua perangkat</p>
                    <span>Sesi login akan dihentikan</span>
                  </div>

                  <button className="pg-btn-danger" onClick={handleLogoutAll}>
                    Logout
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}