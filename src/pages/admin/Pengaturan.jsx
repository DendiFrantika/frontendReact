import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

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
    if (!window.confirm('Yakin logout semua perangkat?')) return;

    try {
      await axiosInstance.post('/auth/logout');
      logout();
    } catch {
      showMessage('error', 'Gagal logout');
    }
  };

  return (
    <AdminLayout title="Pengaturan">
      <div className="container py-4">

        {/* HEADER */}
        <div className="mb-4">
          <h3 className="fw-bold">⚙️ Pengaturan Akun</h3>
          <small className="text-muted">
            Kelola profil dan keamanan akun
          </small>
        </div>

        {/* TAB */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'profile', label: '👤 Profil' },
            { key: 'security', label: '🔒 Keamanan' },
            { key: 'danger', label: '⚠️ Zona Bahaya' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`btn ${
                activeTab === tab.key
                  ? 'btn-primary'
                  : tab.key === 'danger'
                  ? 'btn-outline-danger'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ALERT */}
        {message && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            {message.text}
          </div>
        )}

        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-4">

            {/* ================= PROFILE ================= */}
            {activeTab === 'profile' && (
              <>
                <h5 className="fw-bold mb-3">Informasi Akun</h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="border rounded p-3 bg-light">
                      <small className="text-muted">Nama</small>
                      <div className="fw-semibold">{user?.name || '-'}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 bg-light">
                      <small className="text-muted">Email</small>
                      <div className="fw-semibold">{user?.email || '-'}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 bg-light">
                      <small className="text-muted">Role</small>
                      <div className="fw-semibold text-capitalize">
                        {user?.role || 'admin'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 bg-light">
                      <small className="text-muted">Terdaftar</small>
                      <div className="fw-semibold">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString('id-ID')
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= SECURITY ================= */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordUpdate} style={{ maxWidth: 500 }}>
                <h5 className="fw-bold mb-3">Ganti Password</h5>

                <div className="mb-3">
                  <label>Password Lama</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current_password: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label>Password Baru</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new_password: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label>Konfirmasi Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.new_password_confirmation}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password_confirmation: e.target.value,
                      })
                    }
                  />
                </div>

                <button className="btn btn-warning">
                  {loading ? 'Memproses...' : '🔐 Update Password'}
                </button>
              </form>
            )}

            {/* ================= DANGER ================= */}
            {activeTab === 'danger' && (
              <div>
                <h5 className="fw-bold text-danger mb-3">Zona Bahaya</h5>

                <div className="border border-danger rounded p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Logout Semua Perangkat</strong>
                    <div className="text-muted small">
                      Semua sesi akan dihentikan
                    </div>
                  </div>

                  <button
                    className="btn btn-danger"
                    onClick={handleLogoutAll}
                  >
                    Logout
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