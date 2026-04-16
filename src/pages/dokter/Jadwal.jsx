'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';

const JadwalDokter = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      const response = await axiosInstance.get('/dokter/jadwal');
      setJadwal(response.data);
    } catch (error) {
      console.error('Error fetching jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="main-content">
        <h1>Jadwal Kerja Dokter</h1>

        <div className="jadwal-grid">
          {jadwal.map((item) => (
            <div key={item.id} className="jadwal-card">
              <h3>{item.hari}</h3>
              <p>Jam: {item.jamMulai} - {item.jamSelesai}</p>
              <p>Status: {item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JadwalDokter;