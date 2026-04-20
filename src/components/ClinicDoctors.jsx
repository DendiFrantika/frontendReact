import React, { useState, useEffect } from 'react';

export function ClinicDoctors() {
  // 1. Inisialisasi state dengan array kosong
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Logic pemanggilan API
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/public/dokters')
      .then((res) => res.json())
      .then((response) => {
        // Kita ambil response.data sesuai struktur controller Laravel Anda
        setDoctors(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat data:", err);
        setLoading(false);
      });
  }, []);

  // 3. Tampilan loading sederhana agar user tidak bingung saat data diproses
  if (loading) {
    return <div className="text-center py-20">Memuat data...</div>;
  }

  return (
    <section id="jadwal">
      <div className="max-w-7xl mx-auto px-4"> {/* Tambahkan mx-auto px-4 agar tetap di tengah */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-sky-100">
            Dokter Kami
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Tim Dokter Profesional
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{marginTop: '1rem'}}>
            Dokter-dokter berpengalaman siap melayani Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl shadow-lg" style={{padding: '2rem'}}>
              <div style={{
                width: '5rem',
                height: '5rem',
                background: '#0ea5e9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                marginBottom: '1rem'
              }}>
                👨‍⚕️
              </div>
              <h3 style={{fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem'}}>
                {doctor.nama} {/* Sesuaikan: sebelumnya .name menjadi .nama */}
              </h3>
              <p style={{color: '#0ea5e9', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem'}}>
                {doctor.spesialisasi} {/* Sesuaikan: sebelumnya .spec menjadi .spesialisasi */}
              </p>
              <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                {/* Gabungkan hari libur dan jam praktik jika perlu */}
                {doctor.hari_libur ? `Kecuali ${doctor.hari_libur}, ` : ''} 
                {doctor.jam_praktek_mulai.substring(0,5)} - {doctor.jam_praktek_selesai.substring(0,5)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClinicDoctors;