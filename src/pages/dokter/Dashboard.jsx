'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import { Link } from 'react-router-dom';

const DokterDashboard = () => {
  const [stats, setStats] = useState({
    totalPasienHariIni: 0,
    antrianMenunggu: 0,
    rekamMedisHariIni: 0,
  });
  const [loading, setLoading] = useState(true);
  const [antrian, setAntrian] = useState([]);

  useEffect(() => {
    fetchDokterData();
  }, []);

  const fetchDokterData = async () => {
    try {
      const [statsRes, antrianRes] = await Promise.all([
        axiosInstance.get('/dokter/stats'),
        axiosInstance.get('/dokter/antrian')
      ]);

      setStats(statsRes.data);
      setAntrian(antrianRes.data);
    } catch (error) {
      console.error('Error fetching dokter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelesaiPeriksa = async (pasienId) => {
    try {
      await axiosInstance.post(`/dokter/selesai-periksa/${pasienId}`);
      // Refresh data
      fetchDokterData();
    } catch (error) {
      console.error('Error menyelesaikan periksa:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="main-content">
        <h1>Dashboard Dokter</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Pasien Hari Ini</h3>
            <p>{stats.totalPasienHariIni}</p>
          </div>
          <div className="stat-card">
            <h3>Antrian Menunggu</h3>
            <p>{stats.antrianMenunggu}</p>
          </div>
          <div className="stat-card">
            <h3>Rekam Medis Hari Ini</h3>
            <p>{stats.rekamMedisHariIni}</p>
          </div>
        </div>

        <div className="quick-actions">
          <Link to="/dokter/jadwal" className="action-btn">Lihat Jadwal</Link>
          <Link to="/dokter/rekam-medis" className="action-btn">Kelola Rekam Medis</Link>
          <Link to="/dokter/profil" className="action-btn">Profil Dokter</Link>
        </div>

        <div className="antrian-section">
          <h2>Antrian Pasien</h2>
          <div className="antrian-list">
            {antrian.map((item) => (
              <div key={item.id} className="antrian-item">
                <div className="pasien-info">
                  <h4>{item.namaPasien}</h4>
                  <p>Keluhan: {item.keluhan}</p>
                  <p>Waktu: {item.waktuDaftar}</p>
                </div>
                <div className="actions">
                  <Link to={`/dokter/rekam-medis/${item.id}`} className="btn-primary">Periksa</Link>
                  <button onClick={() => handleSelesaiPeriksa(item.id)} className="btn-secondary">Selesai</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DokterDashboard;