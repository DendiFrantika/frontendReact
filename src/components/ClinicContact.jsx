import React from 'react';

/** Tautan share Google Maps — buka di aplikasi / browser */
const CLINIC_GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/msV48DCcYuh6V5Er5';
/** Embed (tanpa API key): koordinat mengikuti titik di tautan di atas */
const CLINIC_MAP_EMBED_SRC =
  'https://www.google.com/maps?q=-0.2246548,100.6318006&hl=id&z=14&output=embed';

export function ClinicContact() {
  return (
    <section id="kontak">
      <div className="max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-sky-100">
            Hubungi Kami
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Informasi Kontak
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-sky-100">
                <span style={{fontSize: '1.75rem'}}>📍</span>
              </div>
              <h3 style={{fontWeight: 700, color: '#1f2937', marginTop: '1rem', marginBottom: '0.5rem'}}>
                Alamat
              </h3>
              <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                Jl. Kesehatan No. 123, Kota Medis, Indonesia
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-sky-100">
                <span style={{fontSize: '1.75rem'}}>📞</span>
              </div>
              <h3 style={{fontWeight: 700, color: '#1f2937', marginTop: '1rem', marginBottom: '0.5rem'}}>
                Telepon
              </h3>
              <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                (021) 1234-5678
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-sky-100">
                <span style={{fontSize: '1.75rem'}}>✉️</span>
              </div>
              <h3 style={{fontWeight: 700, color: '#1f2937', marginTop: '1rem', marginBottom: '0.5rem'}}>
                Email
              </h3>
              <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                info@kliniksejahtera.com
              </p>
            </div>
          </div>

          {/* Peta lokasi (Google Maps) */}
          <div className="h-full min-h-[400px] flex flex-col gap-3">
            <div
              className="flex-1 min-h-[320px] bg-gray-200 shadow-lg overflow-hidden"
              style={{ borderRadius: '1rem' }}
            >
              <iframe
                title="Peta lokasi klinik di Google Maps"
                src={CLINIC_MAP_EMBED_SRC}
                width="100%"
                height="100%"
                style={{ minHeight: '400px', border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a
              href={CLINIC_GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0284c7',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Buka di Google Maps →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClinicContact;
