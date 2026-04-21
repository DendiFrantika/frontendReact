import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';

const staticDoctors = [
  {
    id: 1,
    nama: 'Dr. Ahmad Santoso',
    spesialisasi: 'Umum',
    hari_libur: 'Minggu',
    jam_praktek_mulai: '08:00:00',
    jam_praktek_selesai: '16:00:00'
  },
  {
    id: 2,
    nama: 'Dr. Siti Nurhaliza',
    spesialisasi: 'Pediatri',
    jam_praktek_mulai: '09:00:00',
    jam_praktek_selesai: '17:00:00'
  },
  {
    id: 3,
    nama: 'Dr. Budi Hartono',
    spesialisasi: 'Kardiologi',
    hari_libur: 'Sabtu',
    jam_praktek_mulai: '14:00:00',
    jam_praktek_selesai: '20:00:00'
  }
];

export function ClinicDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/pasien/dokter')
      .then((response) => {
        setDoctors(response.data || []);
        setLoading(false);
        setError(false);
      })
      .catch((err) => {
        console.error("Gagal memuat data dokter:", err);
        setDoctors(staticDoctors);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-20">Memuat data dokter...</div>;
  }

  return (
    <section id="jadwal">
      <div className="max-w-7xl mx-auto px-4">
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
          {error && (
            <p className="text-orange-600 mt-4 bg-orange-50 p-3 rounded-lg">
              Data dokter sementara tidak tersedia. Menampilkan daftar contoh.
            </p>
          )}
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
                {doctor.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
              </div>
              <h3 style={{fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem'}}>
                {doctor.nama}
              </h3>
              <p style={{color: '#0ea5e9', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem'}}>
                {doctor.spesialisasi}
              </p>
              <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
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
