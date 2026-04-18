import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';

export default function Jadwal() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Sesuaikan field dengan validasi Laravel
  const [formData, setFormData] = useState({
    dokter_id: '',
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    kapasitas: 10 // Default kapasitas
  });

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

 const fetchDoctors = async () => {
    try {
      // Jika di Laravel rutenya /api/dokter
      const res = await axiosInstance.get('/dokter'); 
      setDoctors(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      // Jika di Laravel rutenya /api/jadwal
      const res = await axiosInstance.get('/jadwal'); 
      setSchedules(res.data.data || []); 
    } catch (err) {
      console.error('Error fetching schedules:', err);
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
      if (editingId) {
        await axiosInstance.put(`/admin/jadwal/${editingId}`, formData);
      } else {
        await axiosInstance.post('/admin/jadwal', formData);
      }
      fetchSchedules();
      cancelForm();
    } catch (err) {
      // Menampilkan error validasi dari Laravel
      if (err.response && err.response.data.errors) {
        alert(JSON.stringify(err.response.data.errors));
      }
      console.error('Error saving schedule:', err);
    }
  };

  const editSchedule = (sch) => {
    setEditingId(sch.id);
    setFormData({
      dokter_id: sch.dokter_id,
      hari: sch.hari,
      jam_mulai: sch.jam_mulai.substring(0, 5), // Potong detik jika ada (HH:mm)
      jam_selesai: sch.jam_selesai.substring(0, 5),
      kapasitas: sch.kapasitas
    });
    setShowForm(true);
  };

  const deleteSchedule = async (id) => {
    if (window.confirm('Hapus jadwal ini?')) {
      try {
        await axiosInstance.delete(`/admin/jadwal/${id}`);
        fetchSchedules();
      } catch (err) {
        console.error('Error deleting schedule:', err);
      }
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ dokter_id: '', hari: '', jam_mulai: '', jam_selesai: '', kapasitas: 10 });
  };

  return (
    <AdminLayout title="Manajemen Jadwal">
      <button className="btn" onClick={() => setShowForm(true)}>Tambah Jadwal</button>

      {showForm && (
        <form className="form" onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <div className="form-group">
            <label>Dokter</label>
            <select name="dokter_id" value={formData.dokter_id} onChange={handleChange} required>
              <option value="">-- Pilih dokter --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.nama}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Hari</label>
            <select name="hari" value={formData.hari} onChange={handleChange} required>
              <option value="">-- Pilih Hari --</option>
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mulai</label>
            <input type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Selesai</label>
            <input type="time" name="jam_selesai" value={formData.jam_selesai} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Kapasitas</label>
            <input type="number" name="kapasitas" value={formData.kapasitas} onChange={handleChange} required min="1" />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary">{editingId ? 'Perbarui' : 'Simpan'}</button>
            <button type="button" className="btn" onClick={cancelForm}>Batal</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Memuat jadwal...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Dokter</th>
              <th>Hari</th>
              <th>Jam</th>
              <th>Kapasitas</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((sch) => (
              <tr key={sch.id}>
                {/* Laravel load('dokter') menaruh data di object dokter */}
                <td>{sch.dokter?.nama || 'Tidak diketahui'}</td>
                <td>{sch.hari}</td>
                <td>{sch.jam_mulai} - {sch.jam_selesai}</td>
                <td>{sch.kapasitas}</td>
                <td>
                  <button className="btn small" onClick={() => editSchedule(sch)}>Edit</button>
                  <button className="btn small danger" onClick={() => deleteSchedule(sch.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}