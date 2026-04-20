import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

export default function Diagnosis() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pasienId: '',
    keluhanUtama: '',
    diagnosis: '',
    anamnesis: '',
    pemeriksaanFisik: '',
    hasilLaboratorium: '',
    resep: '',
    tindakan: '',
    catatanDokter: ''
  });

  const [searchParams] = useSearchParams();
  const pasienIdParam = searchParams.get('pasienId') || '';

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  useEffect(() => {
    if (pasienIdParam) {
      setFormData(prev => ({ ...prev, pasienId: pasienIdParam }));
    }
  }, [pasienIdParam]);

  const fetchDiagnoses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/dokter/diagnosis');
      setDiagnoses(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching diagnoses:', err);
      setDiagnoses([]);
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
      await axiosInstance.post('/dokter/diagnosis', {
        pasien_id: formData.pasienId,
        keluhan_utama: formData.keluhanUtama,
        diagnosis: formData.diagnosis,
        anamnesis: formData.anamnesis,
        pemeriksaan_fisik: formData.pemeriksaanFisik,
        hasil_laboratorium: formData.hasilLaboratorium,
        resep: formData.resep,
        tindakan: formData.tindakan,
        catatan_dokter: formData.catatanDokter,
      });
      fetchDiagnoses();
      setShowForm(false);
      setFormData({
        pasienId: '',
        keluhanUtama: '',
        diagnosis: '',
        anamnesis: '',
        pemeriksaanFisik: '',
        hasilLaboratorium: '',
        resep: '',
        tindakan: '',
        catatanDokter: ''
      });
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
              name="pasienId"
              value={formData.pasienId}
              onChange={handleChange}
              required
              readOnly={Boolean(pasienIdParam)}
              placeholder={pasienIdParam ? 'ID pasien diambil dari antrian check-in' : 'Masukkan ID pasien'}
            />
          </div>
          <div className="form-group">
            <label>Keluhan Utama</label>
            <textarea
              name="keluhanUtama"
              value={formData.keluhanUtama}
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
            <label>Anamnesis</label>
            <textarea
              name="anamnesis"
              value={formData.anamnesis}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Pemeriksaan Fisik</label>
            <textarea
              name="pemeriksaanFisik"
              value={formData.pemeriksaanFisik}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Hasil Laboratorium</label>
            <textarea
              name="hasilLaboratorium"
              value={formData.hasilLaboratorium}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Resep</label>
            <textarea
              name="resep"
              value={formData.resep}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Tindakan</label>
            <textarea
              name="tindakan"
              value={formData.tindakan}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Catatan Dokter</label>
            <textarea
              name="catatanDokter"
              value={formData.catatanDokter}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn primary">Simpan</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Memuat diagnosis...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Pasien</th>
              <th>Keluhan Utama</th>
              <th>Diagnosis</th>
              <th>Anamnesis</th>
              <th>Pemeriksaan Fisik</th>
              <th>Hasil Laboratorium</th>
              <th>Resep</th>
              <th>Tindakan</th>
              <th>Catatan Dokter</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map((diag) => (
              <tr key={diag.id}>
                <td>{diag.pasien?.nama ?? diag.pasien_name ?? diag.pasien_id}</td>
                <td>{diag.keluhan_utama}</td>
                <td>{diag.diagnosis}</td>
                <td>{diag.anamnesis}</td>
                <td>{diag.pemeriksaan_fisik}</td>
                <td>{diag.hasil_laboratorium}</td>
                <td>{diag.resep}</td>
                <td>{diag.tindakan}</td>
                <td>{diag.catatan_dokter}</td>
                <td>{diag.tanggal_kunjungan ? new Date(diag.tanggal_kunjungan).toLocaleDateString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DokterLayout>
  );
}
