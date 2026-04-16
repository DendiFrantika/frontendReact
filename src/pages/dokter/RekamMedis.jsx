'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';

const RekamMedisDokter = () => {
  const { id } = useParams(); // ID pasien dari URL
  const navigate = useNavigate();
  const [pasien, setPasien] = useState(null);
  const [rekamMedis, setRekamMedis] = useState({
    keluhan: '',
    diagnosis: '',
    tindakan: '',
    resep: '',
    catatan: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPasienData();
    }
  }, [id]);

  const fetchPasienData = async () => {
    try {
      const response = await axiosInstance.get(`/dokter/pasien/${id}`);
      setPasien(response.data);
    } catch (error) {
      console.error('Error fetching pasien data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/dokter/rekam-medis/${id}`, rekamMedis);
      alert('Rekam medis berhasil disimpan');
      navigate('/dokter');
    } catch (error) {
      console.error('Error saving rekam medis:', error);
      alert('Gagal menyimpan rekam medis');
    }
  };

  const handleChange = (e) => {
    setRekamMedis({
      ...rekamMedis,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="main-content">
        <h1>Rekam Medis Pasien</h1>

        {pasien && (
          <div className="pasien-info-card">
            <h2>{pasien.nama}</h2>
            <p>NIK: {pasien.nik}</p>
            <p>Tanggal Lahir: {pasien.tanggalLahir}</p>
            <p>Alamat: {pasien.alamat}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rekam-medis-form">
          <div className="form-group">
            <label>Keluhan:</label>
            <textarea
              name="keluhan"
              value={rekamMedis.keluhan}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Diagnosis:</label>
            <textarea
              name="diagnosis"
              value={rekamMedis.diagnosis}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tindakan:</label>
            <textarea
              name="tindakan"
              value={rekamMedis.tindakan}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Resep:</label>
            <textarea
              name="resep"
              value={rekamMedis.resep}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Catatan:</label>
            <textarea
              name="catatan"
              value={rekamMedis.catatan}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Simpan Rekam Medis</button>
            <button type="button" onClick={() => navigate('/dokter')} className="btn-secondary">Kembali</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RekamMedisDokter;