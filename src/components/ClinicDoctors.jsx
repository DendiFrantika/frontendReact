import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';

export function ClinicDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/public /dokter')
      .then((response) => {
        // ✅ response berbentuk { data: [...] }
        const data = response.data?.data || response.data || [];
        setDoctors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat data dokter:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-20">Memuat data dokter...</div>;

  return (
    <section id="jadwal" style={{ padding: '4rem 1rem' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-sky-100 rounded-full text-sky-700 font-semibold mb-4">
            Dokter Kami
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Tim Dokter Profesional
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{ marginTop: '1rem' }}>
            Dokter-dokter berpengalaman siap melayani Anda
          </p>
          {error && (
            <p className="text-orange-600 mt-4 bg-orange-50 p-3 rounded-lg">
              Gagal memuat data dokter dari server.
            </p>
          )}
        </div>

        {doctors.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada data dokter tersedia.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-2xl shadow-lg" style={{ padding: '2rem' }}>
                {/* Avatar */}
                <div style={{
                  width: '5rem', height: '5rem',
                  background: '#0ea5e9', borderRadius: '50%',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white',
                  fontSize: '2rem', marginBottom: '1rem'
                }}>
                  👨‍⚕️
                </div>

                {/* Nama */}
                <h3 style={{ fontWeight: 700, color: '#1f2937', marginBottom: '0.25rem' }}>
                  {doctor.nama}
                </h3>

                {/* Spesialisasi */}
                <p style={{ color: '#0ea5e9', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                  {doctor.spesialisasi}
                </p>

                {/* Jam Praktek */}
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  🕐 {doctor.jam_praktek_mulai?.substring(0, 5)} - {doctor.jam_praktek_selesai?.substring(0, 5)}
                </p>

                {/* Hari Libur */}
                {doctor.hari_libur && (
                  <p style={{ color: '#f97316', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    🚫 Libur: {doctor.hari_libur}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ClinicDoctors;