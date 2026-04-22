import React, { useState, useEffect } from 'react';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

export default function Diagnosis() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const fetchRecords = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/dokter/diagnosis');
      setDiagnoses(res.data);
    } catch (err) {
      console.error('Error fetching diagnoses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/dokter/diagnosis', formData);
      fetchDiagnoses();
      setShowForm(false);
      setFormData({ patientId: '', diagnosis: '', treatment: '', notes: '' });
    } catch (err) {
      console.error('Error saving diagnosis:', err);
    }
  };

  return (
    <DokterLayout title="Diagnosis Pasien">
      <button className="btn" onClick={() => setShowForm(true)}>
        Tambah Diagnosis
      </button>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID Pasien</label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Diagnosis</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Pengobatan</label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Catatan</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn primary">Simpan</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Batal</button>
          </div>
        )}

      {loading ? (
        <p>Memuat diagnosis...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Pasien</th>
              <th>Diagnosis</th>
              <th>Pengobatan</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map((diag) => (
              <tr key={diag.id}>
                <td>{diag.patientName}</td>
                <td>{diag.diagnosis}</td>
                <td>{diag.treatment}</td>
                <td>{new Date(diag.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DokterLayout>
  );
}