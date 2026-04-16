import React from 'react';
import { Link } from 'react-router-dom';

export function ClinicHero() {
  return (
    <section id="beranda">
      <div style={{position: 'absolute', inset: 0, opacity: 0.5}} className="tooth-pattern"></div>
      
      <div className="absolute top-32 left-10 animate-float"></div>
      <div className="absolute bottom-32 right-10 animate-float"></div>
      <div className="absolute top-1/2 right-1/4 animate-pulse-slow"></div>

      <div className="relative max-w-7xl">
        <div className="grid lg:grid-cols-2">
          {/* Text Section */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400"></div>
              <span style={{color: 'white', fontSize: '0.875rem', fontWeight: 500}}>
                Buka 24 Jam
              </span>
            </div>

            <h1 id="hero-title">
              Kesehatan Anda Adalah Prioritas Kami
            </h1>

            <p id="hero-subtitle">
              Layanan medis profesional dengan dokter berpengalaman dan fasilitas modern untuk kesehatan keluarga Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/pasien/daftar-berobat" 
                className="px-8 py-4 bg-white"
                style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}
              >
                Daftar Sekarang
              </Link>
              <button 
                className="px-8 py-4 bg-white/10"
                style={{textDecoration: 'none'}}
              >
                ℹ️ Pelajari Lebih Lanjut
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl">500+</div>
                <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem'}}>
                  Pasien Puas
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl">50+</div>
                <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem'}}>
                  Dokter Profesional
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl">15+</div>
                <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem'}}>
                  Spesialisasi Medis
                </p>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-80 h-80 bg-white/10 rounded-full">
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="w-48 h-48 bg-white/10 rounded-full flex justify-center items-center text-white text-6xl">
                  💊
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClinicHero;
