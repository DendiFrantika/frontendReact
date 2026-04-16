import React from 'react';
import { Link } from 'react-router-dom';

export function ClinicFooter() {
  return (
    <footer>
      <div className="max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <h3 style={{fontWeight: 700, marginBottom: '1rem'}}>Klinik Medis Sejahtera</h3>
            <p style={{color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem'}}>
              Memberikan layanan kesehatan terbaik dengan dokter profesional dan fasilitas modern untuk kesehatan keluarga Indonesia.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{fontWeight: 700, marginBottom: '1rem'}}>Menu Utama</h4>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              <li style={{marginBottom: '0.5rem'}}>
                <a href="#beranda" style={{color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem'}}>
                  Beranda
                </a>
              </li>
              <li style={{marginBottom: '0.5rem'}}>
                <a href="#layanan" style={{color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem'}}>
                  Layanan
                </a>
              </li>
              <li style={{marginBottom: '0.5rem'}}>
                <a href="#jadwal" style={{color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem'}}>
                  Jadwal
                </a>
              </li>
              <li>
                <a href="#kontak" style={{color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem'}}>
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Akun */}
          <div>
            <h4 style={{fontWeight: 700, marginBottom: '1rem'}}>Akun</h4>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              <li style={{marginBottom: '0.5rem'}}>
                <Link to="/login" style={{color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem'}}>
                  Login
                </Link>
              </li>
              <li style={{marginBottom: '0.5rem'}}>
                <Link to="/register" style={{color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem'}}>
                  Daftar
                </Link>
              </li>
              <li style={{marginBottom: '0.5rem'}}>
                <Link to="/pasien/profil" style={{color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem'}}>
                  Profil
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800">
          <p style={{margin: 0, textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem'}}>
            © {new Date().getFullYear()} Klinik Medis Sejahtera. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default ClinicFooter;
