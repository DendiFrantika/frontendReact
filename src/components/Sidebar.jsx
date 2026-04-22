import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './styles/Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const userName    = String(user?.nama || user?.name || 'User');
  const userInitial = userName.charAt(0).toUpperCase() || 'U';
  const roleLabel   =
    user?.role === 'admin'  ? 'Administrator' :
    user?.role === 'dokter' ? 'Dokter'        : 'Pasien';

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const getMenuItems = () => {
    if (user?.role === 'admin') return [
      { path: '/admin',             label: 'Dashboard'   },
      { path: '/admin/alur-kerja',  label: 'Alur Kerja'  },
      { path: '/admin/pasien',      label: 'Pasien'      },
      { path: '/admin/dokter',      label: 'Dokter'      },
      { path: '/admin/pendaftaran', label: 'Pendaftaran' },
      { path: '/admin/rekam-medis', label: 'Rekam Medis' },
      { path: '/admin/pengaturan',  label: 'Pengaturan'  },
    ];
    if (user?.role === 'pasien') return [
      { path: '/pasien',                label: 'Dashboard'      },
      { path: '/pasien/profil',         label: 'Profil'         },
      { path: '/pasien/daftar-berobat', label: 'Daftar Berobat' },
      { path: '/pasien/riwayat',        label: 'Riwayat'        },
      { path: '/pasien/antrian',        label: 'Antrian'        },
    ];
    if (user?.role === 'dokter') return [
      { path: '/dokter',             label: 'Dashboard'   },
      { path: '/dokter/antrian',     label: 'Antrian'     },
      { path: '/dokter/diagnosis',   label: 'Diagnosis'   },
      { path: '/dokter/jadwal',      label: 'Jadwal'      },
      { path: '/dokter/riwayat',     label: 'Riwayat'     },
      { path: '/dokter/rekam-medis', label: 'Rekam Medis' },
    ];
    return [];
  };

  const menuItems = getMenuItems();

  const headerLabel =
    user?.role === 'admin'  ? 'Dashboard Admin'  :
    user?.role === 'dokter' ? 'Dashboard Dokter' : 'Dashboard Pasien';

  return (
    <>
      {mobileOpen && (
        <div className="sb-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside className={`dokter-sidebar ${mobileOpen ? 'sb--open' : ''}`}>

        <div className="sidebar-header">
          <h3>{headerLabel}</h3>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-link${location.pathname === item.path ? ' active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button
            className="user-info user-profile-btn"
            onClick={() => navigate(`/${user?.role}/profile`)}
          >
            <div className="user-avatar">{userInitial}</div>
            <div className="user-details">
              <p className="user-name">{userName}</p>
              <p className="user-role">{roleLabel}</p>
            </div>
          </button>
          <button
            className="logout-btn"
            onClick={async () => { await logout(); navigate('/login'); }}
          >
            Logout
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;