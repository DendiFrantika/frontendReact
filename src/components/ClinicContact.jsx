import React from 'react';

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

          {/* Map Placeholder */}
          <div className="h-full min-h-[400px] bg-gray-200" style={{borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <p style={{color: '#9ca3af'}}>🗺️ Peta Lokasi</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClinicContact;
