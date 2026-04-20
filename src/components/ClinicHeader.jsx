import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Gunakan ../ untuk keluar dari folder components, lalu masuk ke folder assets
import logoKlinik from '../assets/logoklinik.png';
export function ClinicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 return (
  <header id="header" className="py-4 px-6 bg-white shadow-sm">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        {/* Kontainer Gambar/Logo */}
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '0.5rem',
          overflow: 'hidden', // Memastikan gambar tidak keluar dari rounded corner
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        }}>
          <img 
  src={logoKlinik} 
  alt="Logo Klinik Sejahtera"
  className="w-full h-full object-cover"
  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=K'; }} 
/>
        </div>
        
        <h1 id="header-clinic-name" className="text-2xl font-bold text-slate-800">
          Klinik Sejahtera
        </h1>
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
