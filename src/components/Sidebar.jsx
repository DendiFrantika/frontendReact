import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './styles/Sidebar.css';

/* ── SVG Icons: semua 18×18px, dijamin lurus ── */
const Ico = ({ children }) => (
  <svg
    width="18" height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', flexShrink: 0 }}
  >
    {children}
  </svg>
);

const Icons = {
  dashboard:     <Ico><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></Ico>,
  alurKerja:     <Ico><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></Ico>,
  pasien:        <Ico><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Ico>,
  dokter:        <Ico><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>,
  pendaftaran:   <Ico><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></Ico>,
  rekamMedis:    <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></Ico>,
  pengaturan:    <Ico><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ico>,
  home:          <Ico><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ico>,
  profil:        <Ico><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>,
  daftarBerobat: <Ico><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Ico>,
  riwayat:       <Ico><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></Ico>,
  antrian:       <Ico><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ico>,
  hospital:      <Ico><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="12" y1="22" x2="12" y2="17"/><path d="M9 17h6"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/></Ico>,
  jadwal:        <Ico><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ico>,
  logout:        <Ico><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Ico>,
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
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
      { path: '/admin',             label: 'Dashboard',   icon: Icons.dashboard     },
      { path: '/admin/alur-kerja',  label: 'Alur Kerja',  icon: Icons.alurKerja     },
      { path: '/admin/pasien',      label: 'Pasien',      icon: Icons.pasien        },
      { path: '/admin/dokter',      label: 'Dokter',      icon: Icons.dokter        },
      { path: '/admin/pendaftaran', label: 'Pendaftaran', icon: Icons.pendaftaran   },
      { path: '/admin/rekam-medis', label: 'Rekam Medis', icon: Icons.rekamMedis    },
      { path: '/admin/pengaturan',  label: 'Pengaturan',  icon: Icons.pengaturan    },
    ];
    if (user?.role === 'pasien') return [
      { path: '/pasien',                label: 'Dashboard',      icon: Icons.home          },
      { path: '/pasien/profil',         label: 'Profil',         icon: Icons.profil        },
      { path: '/pasien/daftar-berobat', label: 'Daftar Berobat', icon: Icons.daftarBerobat },
      { path: '/pasien/riwayat',        label: 'Riwayat',        icon: Icons.riwayat       },
      { path: '/pasien/antrian',        label: 'Antrian',        icon: Icons.antrian       },
    ];
    if (user?.role === 'dokter') return [
      { path: '/dokter',             label: 'Dashboard',   icon: Icons.hospital   },
      { path: '/dokter/jadwal',      label: 'Jadwal Saya', icon: Icons.jadwal     },
      { path: '/dokter/rekam-medis', label: 'Rekam Medis', icon: Icons.rekamMedis },
      { path: '/dokter/profil',      label: 'Profil',      icon: Icons.profil     },
    ];
    return [];
  };

  const menuItems = getMenuItems();
  const isActive  = (path) => location.pathname === path;

  return (
    <>
      <header className="sb-topbar">
        <button className="sb-hamburger" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
          <span /><span /><span />
        </button>
        <span className="sb-topbar-title">Klinik</span>
      </header>

      {mobileOpen && (
        <div className="sb-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside className={`sb ${collapsed ? 'sb--collapsed' : ''} ${mobileOpen ? 'sb--open' : ''}`}>

        <div className="sb-head">
          <div className="sb-logo">
            <span className="sb-logo-icon">{Icons.hospital}</span>
            {!collapsed && <span className="sb-logo-text">Klinik</span>}
          </div>
          <button className="sb-toggle" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Perluas' : 'Perkecil'}>
            {collapsed ? '›' : '‹'}
          </button>
          <button className="sb-close" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">✕</button>
        </div>

        <nav className="sb-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sb-link ${isActive(item.path) ? 'sb-link--active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="sb-link-icon">{item.icon}</span>
              {!collapsed && <span className="sb-link-label">{item.label}</span>}
              {!collapsed && isActive(item.path) && <span className="sb-link-dot" aria-hidden="true" />}
            </Link>
          ))}
        </nav>

        <div className="sb-foot">
          <div className={`sb-user ${collapsed ? 'sb-user--mini' : ''}`}>
            <div className="sb-avatar">{userInitial}</div>
            {!collapsed && (
              <div className="sb-user-info">
                <p className="sb-user-name">{userName}</p>
                <p className="sb-user-role">{roleLabel}</p>
              </div>
            )}
          </div>
          <button
            className="sb-logout"
            onClick={async () => { await logout(); navigate('/login'); }}
            title={collapsed ? 'Logout' : undefined}
          >
            <span className="sb-logout-icon">{Icons.logout}</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;