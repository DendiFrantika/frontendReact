import React, { useState, useEffect } from 'react';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';
import './JadwalDokter.css';

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
    <DokterLayout title="Jadwal Praktik">
      <div className="jadwal-container">
        
        {/* Info Dokter - Lebih Ringkas */}
        {dokter && (
          <div className="jadwal-header-simple">
            <h2>{dokter.nama}</h2>
            <p>{dokter.spesialisasi} • {dokter.email}</p>
          </div>
        )}

        <div className="jadwal-grid-minimal">
          {loading ? (
            <div className="state-msg">Memuat jadwal...</div>
          ) : jadwal.length === 0 ? (
            <div className="state-msg">Tidak ada jadwal tersedia.</div>
          ) : (
            jadwal.map((item) => (
              <div 
                key={item.id} 
                className={`jadwal-card-clean ${!item.status ? 'is-off' : ''}`}
              >
                <div className="card-top">
                  <h4>{item.hari}</h4>
                </div>
                
                <div className="card-bottom">
                  <span className="time-label">Jam Operasional</span>
                  <p className="time-value">
                    {item.jam_mulai.slice(0, 5)} — {item.jam_selesai.slice(0, 5)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DokterLayout>
  );
}