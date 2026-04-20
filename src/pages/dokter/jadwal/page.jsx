import React, { useState, useEffect } from 'react';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

export default function JadwalDokter() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/dokter/jadwal');
      // Response: { dokter: {...}, jadwal: [...] }
      setSchedules(res.data.jadwal || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  return (
   <DokterLayout title="Jadwal Saya">
  {loading ? (
    <p>Memuat jadwal...</p>
  ) : (
    <div className="schedule-list">
      {schedules.length > 0 ? (
        schedules.map((schedule) => (
          <div key={schedule.id} className="schedule-item">
            <div className="schedule-info">
              
              <h3>{schedule.hari}</h3>

              <p>
                Waktu: {schedule.jam_mulai} - {schedule.jam_selesai}
              </p>

              <p>
                Kapasitas: {schedule.kapasitas ?? '-'}
              </p>

            </div>
          </div>
        ))
      ) : (
        <p>Tidak ada jadwal tersedia.</p>
      )}
    </div>
  )}
</DokterLayout>
  );
}
