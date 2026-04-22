import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';

// Icon per spesialisasi
const spesialisasiIcon = {
  'Umum': '🩺',
  'Gigi': '🦷',
  'Pediatri': '👶',
  'Kardiologi': '❤️',
  'Mata': '👁️',
  'Kulit': '🧴',
  'Kandungan': '🤰',
  'Bedah': '🔬',
  'Saraf': '🧠',
  'Laboratorium': '🔭',
};

const getIcon = (spesialisasi) => {
  for (const key in spesialisasiIcon) {
    if (spesialisasi?.toLowerCase().includes(key.toLowerCase())) {
      return spesialisasiIcon[key];
    }
  }
  return '🏥'; // default
};

export function ClinicServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/dokter')
      .then((response) => {
        const doctors = response.data?.data || response.data || [];

        // ✅ Ambil spesialisasi unik sebagai layanan
        const unique = [...new Map(
          doctors.map(d => [d.spesialisasi, d])
        ).values()];

        const layanan = unique.map((d, index) => ({
          id: index + 1,
          icon: getIcon(d.spesialisasi),
          title: d.spesialisasi,
          desc: `Ditangani oleh dokter spesialis ${d.spesialisasi} berpengalaman`
        }));

        setServices(layanan);
        setLoading(false);
      })
      .catch(() => {
        // fallback statis kalau API gagal
        setServices([
          { id: 1, icon: '🩺', title: 'Konsultasi Umum', desc: 'Pemeriksaan kesehatan umum' },
          { id: 2, icon: '🦷', title: 'Gigi & Mulut', desc: 'Perawatan gigi profesional' },
          { id: 3, icon: '👶', title: 'Pediatri', desc: 'Kesehatan anak' },
          { id: 4, icon: '❤️', title: 'Kardiologi', desc: 'Kesehatan jantung' },
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-10">Memuat layanan...</div>;

  return (
    <section id="layanan" style={{ padding: '4rem 1rem', background: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-sky-100 rounded-full text-sky-700 font-semibold mb-4">
            Layanan Kami
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Layanan Kesehatan Lengkap
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{ marginTop: '1rem' }}>
            Kami menyediakan berbagai layanan kesehatan dengan standar internasional
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.id} style={{
              background: 'white', borderRadius: '1rem',
              padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                {service.icon}
              </div>
              <h3 style={{ fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>
                {service.title}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClinicServices;