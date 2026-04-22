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
      setSchedules(res.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
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
                  <h3>{schedule.day}</h3>
                  <p>Waktu: {schedule.startTime} - {schedule.endTime}</p>
                  <p>Status: {schedule.status}</p>
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