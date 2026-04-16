import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './styles/Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/pasien', label: 'Pasien', icon: '👥' },
        { path: '/admin/dokter', label: 'Dokter', icon: '👨‍⚕️' },
        { path: '/admin/jadwal', label: 'Jadwal Kerja', icon: '📅' },
        { path: '/admin/pendaftaran', label: 'Pendaftaran', icon: '📋' },
        { path: '/admin/rekam-medis', label: 'Rekam Medis', icon: '📄' },
        { path: '/admin/laporan', label: 'Laporan', icon: '📈' },
        { path: '/admin/aktivitas', label: 'Aktivitas', icon: '📝' },
        { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
        { path: '/admin/pengaturan', label: 'Pengaturan', icon: '⚙️' },
      ];
    } else if (user?.role === 'pasien') {
      return [
        { path: '/pasien', label: 'Dashboard', icon: '🏠' },
        { path: '/pasien/profil', label: 'Profil', icon: '👤' },
        { path: '/pasien/daftar-berobat', label: 'Daftar Berobat', icon: '📝' },
        { path: '/pasien/riwayat', label: 'Riwayat', icon: '📜' },
        { path: '/pasien/antrian', label: 'Antrian', icon: '⏳' },
      ];
    } else if (user?.role === 'dokter') {
      return [
        { path: '/dokter', label: 'Dashboard', icon: '🏥' },
        { path: '/dokter/jadwal', label: 'Jadwal Saya', icon: '📅' },
        { path: '/dokter/rekam-medis', label: 'Rekam Medis', icon: '📄' },
        { path: '/dokter/profil', label: 'Profil', icon: '👤' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Menu</h3>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.nama?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <p className="user-name">{user?.nama}</p>
            <p className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Pasien'}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => {
          logout();
          navigate('/login');
        }}>
          <span>🚪 Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
