import React, { useState, useEffect } from 'react';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

export default function JadwalDokter() {
  const [jadwal, setJadwal] = useState([]);
  const [dokter, setDokter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/dokter/jadwal');

      // 🔥 FIX: ambil dari field "jadwal"
      setJadwal(res.data?.jadwal ?? []);
      setDokter(res.data?.dokter ?? null);

    } catch (err) {
      console.error('Error fetching jadwal:', err);
      setJadwal([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DokterLayout title="Jadwal Saya">
      <div style={{ maxWidth: 800 }}>

        {/* Info dokter */}
        {dokter && (
          <div style={{
            background: '#EEF2FF',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16
          }}>
            <h3 style={{ margin: 0 }}>{dokter.nama}</h3>
            <p style={{ margin: 0, fontSize: 13 }}>
              {dokter.spesialisasi} • {dokter.email}
            </p>
          </div>
        )}

        {loading ? (
          <p>Memuat jadwal...</p>
        ) : jadwal.length === 0 ? (
          <p>Tidak ada jadwal tersedia.</p>
        ) : (
          jadwal.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                background: '#fff'
              }}
            >
              <h4 style={{ margin: 0 }}>{item.hari}</h4>

              <p style={{ margin: '6px 0', fontSize: 14 }}>
                ⏰ {item.jam_mulai} - {item.jam_selesai}
              </p>

              <p style={{ margin: 0, fontSize: 13 }}>
                👥 Kapasitas: {item.kapasitas}
              </p>

              <span
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: item.status ? '#DCFCE7' : '#FEE2E2',
                  color: item.status ? '#166534' : '#991B1B'
                }}
              >
                {item.status ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          ))
        )}
      </div>
    </DokterLayout>
  );
}