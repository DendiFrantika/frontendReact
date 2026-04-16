import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Klinik Medis Sejahtera</h3>
          <p>Pelayanan kesehatan terpercaya dengan dokter profesional dan fasilitas modern.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="Instagram">📷</a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Navigasi</h4>
          <ul>
            <li><Link to="/">Beranda</Link></li>
            <li><Link to="/layanan">Layanan</Link></li>
            <li><Link to="/jadwal">Jadwal</Link></li>
            <li><Link to="/tentang">Tentang</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Kontak</h4>
          <ul>
            <li>📞 (021) 123-4567</li>
            <li>📧 info@klinikmedis.com</li>
            <li>📍 Jl. Kesehatan No. 123, Jakarta</li>
            <li>⏰ Senin - Jumat: 08:00 - 17:00</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Layanan Kami</h4>
          <ul>
            <li><Link to="/layanan">Pemeriksaan Umum</Link></li>
            <li><Link to="/layanan">Gigi</Link></li>
            <li><Link to="/layanan">Mata</Link></li>
            <li><Link to="/layanan">Vaksinasi</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Klinik Medis Sejahtera. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
