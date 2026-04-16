import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function ClinicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header id="header">
      <div className="max-w-7xl">
        <div className="flex items-center gap-3">
          <div style={{
            width: '3rem',
            height: '3rem',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            🏥
          </div>
          <h1 id="header-clinic-name">Klinik Sejahtera</h1>
        </div>

        <nav className="hidden md:flex">
          <a href="#beranda">Beranda</a>
          <a href="#layanan">Layanan</a>
          <a href="#jadwal">Jadwal</a>
          <a href="#tentang">Tentang</a>
          <a href="#kontak">Kontak</a>
          <Link to="/login" style={{color: '#0ea5e9', fontWeight: 700}}>Login</Link>
        </nav>

        <button
          className="md:hidden"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-menu">
          <nav>
            <a href="#beranda">Beranda</a>
            <a href="#layanan">Layanan</a>
            <a href="#jadwal">Jadwal</a>
            <a href="#tentang">Tentang</a>
            <a href="#kontak">Kontak</a>
            <Link to="/login">Login</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default ClinicHeader;
