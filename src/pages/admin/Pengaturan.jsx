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

  // ===== HELPER =====
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // ===== UPDATE PASSWORD =====
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      return showMessage('error', 'Konfirmasi password tidak cocok!');
    }

    setLoading(true);

    try {
      await axiosInstance.post('/auth/change-password', {
        current_password: passwordData.current_password,
        password: passwordData.new_password,
        password_confirmation: passwordData.new_password_confirmation,
      });

      showMessage('success', 'Password berhasil diganti!');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err) {
      showMessage(
        'error',
        err.response?.data?.message ||
        JSON.stringify(err.response?.data?.errors) ||
        'Gagal mengganti password'
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== LOGOUT ALL =====
  const handleLogoutAll = async () => {
    if (!window.confirm('Yakin ingin logout dari semua perangkat?')) return;
    try {
      await axiosInstance.post('/auth/logout');
      logout();
    } catch {
      showMessage('error', 'Gagal logout');
    }
  };

  const navItems = [
    { key: 'profile',  icon: '👤', label: 'Profil' },
    { key: 'security', icon: '🔒', label: 'Keamanan' },
    { key: 'danger',   icon: '⚠️',  label: 'Zona Bahaya' },
  ];

  return (
    <AdminLayout title="Pengaturan">
      <div className="pg-wrapper">

        {/* HEADER */}
        <div className="pg-header">
          <div className="pg-header-inner">
            <div className="pg-header-icon">⚙️</div>
            <div>
              <h2>Pengaturan Akun</h2>
              <p>Kelola profil dan keamanan akun Anda</p>
            </div>
          </div>
        </div>

        {/* LAYOUT */}
        <div className="pg-layout">

          {/* SIDEBAR NAV */}
          <nav className="pg-nav">
            {navItems.map(tab => (
              <button
                key={tab.key}
                className={`pg-nav-btn ${activeTab === tab.key ? 'active' : ''} ${tab.key === 'danger' ? 'danger' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="pg-nav-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* MAIN CARD */}
          <div className="pg-card">

            {/* ALERT */}
            {message && (
              <div className={`pg-alert ${message.type}`}>
                <span>{message.type === 'success' ? '✅' : '❌'}</span>
                {message.text}
              </div>
            )}

            {/* ===== PROFILE ===== */}
            {activeTab === 'profile' && (
              <div key="profile">
                <h3 className="pg-section-title">
                  👤 Informasi Akun
                </h3>

                <div className="pg-info-grid">
                  <div className="pg-info-item">
                    <div className="pg-info-label">Nama Lengkap</div>
                    <div className="pg-info-value">{user?.name || '—'}</div>
                  </div>

                  <div className="pg-info-item">
                    <div className="pg-info-label">Email</div>
                    <div className="pg-info-value">{user?.email || '—'}</div>
                  </div>

                  <div className="pg-info-item">
                    <div className="pg-info-label">Role</div>
                    <div className="pg-info-value">
                      <span className="pg-badge">
                        {user?.role || 'admin'}
                      </span>
                    </div>
                  </div>

                  <div className="pg-info-item">
                    <div className="pg-info-label">Terdaftar Sejak</div>
                    <div className="pg-info-value">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== SECURITY ===== */}
            {activeTab === 'security' && (
              <div key="security">
                <h3 className="pg-section-title">
                  🔒 Ganti Password
                </h3>

                <form className="pg-form" onSubmit={handlePasswordUpdate}>
                  <div className="pg-field">
                    <label className="pg-label">Password Lama</label>
                    <input
                      type="password"
                      className="pg-input"
                      placeholder="Masukkan password lama"
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, current_password: e.target.value })
                      }
                    />
                  </div>

                  <div className="pg-field">
                    <label className="pg-label">Password Baru</label>
                    <input
                      type="password"
                      className="pg-input"
                      placeholder="Minimal 8 karakter"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, new_password: e.target.value })
                      }
                    />
                  </div>

                  <div className="pg-field">
                    <label className="pg-label">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      className="pg-input"
                      placeholder="Ulangi password baru"
                      value={passwordData.new_password_confirmation}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password_confirmation: e.target.value,
                        })
                      }
                    />
                  </div>

                  <hr className="pg-divider" />

                  <button
                    type="submit"
                    className="pg-btn pg-btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Memproses...' : '🔐 Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* ===== DANGER ===== */}
            {activeTab === 'danger' && (
              <div key="danger">
                <h3 className="pg-section-title" style={{ color: 'var(--color-danger)' }}>
                  ⚠️ Zona Bahaya
                </h3>

                <div className="pg-danger-card">
                  <div>
                    <div className="pg-danger-title">Logout Semua Perangkat</div>
                    <div className="pg-danger-desc">
                      Semua sesi aktif akan segera dihentikan
                    </div>
                  </div>

                  <button
                    className="pg-btn pg-btn-danger"
                    onClick={handleLogoutAll}
                  >
                    🚪 Logout Semua
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}