'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';

const ProfilDokter = () => {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      const response = await axiosInstance.get('/dokter/profil');
      setProfil(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put('/dokter/profil', formData);
      setProfil(formData);
      setEditing(false);
      alert('Profil berhasil diperbarui');
    } catch (error) {
      console.error('Error updating profil:', error);
      alert('Gagal memperbarui profil');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
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
        <h1>Profil Dokter</h1>

        {!editing ? (
          <div className="profil-view">
            <div className="profil-card">
              <h2>{profil.nama}</h2>
              <p><strong>Spesialisasi:</strong> {profil.spesialisasi}</p>
              <p><strong>Email:</strong> {profil.email}</p>
              <p><strong>Telepon:</strong> {profil.telepon}</p>
              <p><strong>Alamat:</strong> {profil.alamat}</p>
              <p><strong>Pengalaman:</strong> {profil.pengalaman} tahun</p>
            </div>
            <button onClick={() => setEditing(true)} className="btn-primary">Edit Profil</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profil-form">
            <div className="form-group">
              <label>Nama:</label>
              <input
                type="text"
                name="nama"
                value={formData.nama || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Spesialisasi:</label>
              <input
                type="text"
                name="spesialisasi"
                value={formData.spesialisasi || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Telepon:</label>
              <input
                type="tel"
                name="telepon"
                value={formData.telepon || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Alamat:</label>
              <textarea
                name="alamat"
                value={formData.alamat || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Pengalaman (tahun):</label>
              <input
                type="number"
                name="pengalaman"
                value={formData.pengalaman || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Simpan</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilDokter;