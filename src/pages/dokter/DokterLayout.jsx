import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DokterLayout.css';

const DokterLayout = ({ title, children }) => {
  const { user, logout } = useAuth();
  const userName = String(user?.nama || user?.name || 'Dokter');
  const userInitial = userName.charAt(0)?.toUpperCase() || 'D';

  return (
    <div className="dokter-layout">
      <aside className="dokter-sidebar">
        <div className="sidebar-header">
          <h3>Menu Dokter</h3>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dokter" className="sidebar-link">Dashboard</Link>
            </li>
            <li>
              <Link to="/dokter/antrian" className="sidebar-link">Antrian</Link>
            </li>
            <li>
              <Link to="/dokter/diagnosis" className="sidebar-link">Diagnosis</Link>
            </li>
            <li>
              <Link to="/dokter/jadwal" className="sidebar-link">Jadwal</Link>
            </li>
            <li>
              <Link to="/dokter/riwayat" className="sidebar-link">Riwayat</Link>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{userInitial}</div>
            <div className="user-details">
              <p className="user-name">{userName}</p>
              <p className="user-role">Dokter</p>
            </div>
          </div>
          <button className="logout-btn" onClick={() => {
            logout();
            window.location.href = '/login';
          }}>
            <span>🚪 Logout</span>
          </button>
        </div>
      </aside>
      <main className="dokter-content">
        {title && (
          <div className="dokter-page-header">
            <h1>{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default DokterLayout;
