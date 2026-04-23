import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaTachometerAlt,
  FaUserInjured,
  FaNotesMedical,
  FaCalendarAlt,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt
} from 'react-icons/fa';
import './DokterLayout.css';

const DokterLayout = ({ title, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userName = String(user?.nama || user?.name || 'Dokter');
  const userInitial = userName.charAt(0)?.toUpperCase() || 'D';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dokter-layout">
      <aside className="dokter-sidebar">

        <div className="sidebar-header">
          <h3>Dashboard Dokter</h3>
        </div>

        <nav className="sidebar-nav">
          <ul>

            <li>
              <Link to="/dokter" className="sidebar-link">
                <FaTachometerAlt /> Dashboard
              </Link>
            </li>

            <li>
              <Link to="/dokter/antrian" className="sidebar-link">
                <FaUserInjured /> Antrian
              </Link>
            </li>

            <li>
              <Link to="/dokter/diagnosis" className="sidebar-link">
                <FaNotesMedical /> Diagnosis
              </Link>
            </li>

            <li>
              <Link to="/dokter/jadwal" className="sidebar-link">
                <FaCalendarAlt /> Jadwal
              </Link>
            </li>

            <li>
              <Link to="/dokter/riwayat" className="sidebar-link">
                <FaHistory /> Riwayat
              </Link>
            </li>

            {/* <li>
              <Link to="/dokter/profile" className="sidebar-link">
                <FaUserCircle /> Profile
              </Link>
            </li> */}

          </ul>
        </nav>

        <div className="sidebar-footer">
          <button
            className="user-info user-profile-btn"
            onClick={() => navigate('/dokter/profile')}
            title="Profile"
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <p style={{ margin: 0, fontSize: '13px', color: '#000000' }}>{userName}</p>
            <span style={{
              fontSize: '11px',
              color: '#000000',
              marginLeft: 'auto',
              whiteSpace: 'nowrap',
            }}>
              Profile
            </span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: 6 }} />
            Logout
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