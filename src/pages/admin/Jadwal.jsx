import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';

export default function Jadwal(){
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ doctorId: '', day: '', startTime: '', endTime: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axiosInstance.get('/admin/dokter');
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors for schedule:', err);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/jadwal');
      setSchedules(res.data);
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
      console.error('Error saving schedule:', err);
    }
  };

  const editSchedule = (sch) => {
    setEditingId(sch.id);
    setFormData({ doctorId: sch.doctorId, day: sch.day, startTime: sch.startTime, endTime: sch.endTime });
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
    setFormData({ doctorId: '', day: '', startTime: '', endTime: '' });
  };

  return (
    <AdminLayout title="Manajemen Jadwal">
      <button className="btn" onClick={() => setShowForm(true)}>
        Tambah Jadwal
      </button>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Dokter</label>
            <select name="doctorId" value={formData.doctorId} onChange={handleChange} required>
              <option value="">-- Pilih dokter --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Hari</label>
            <input type="text" name="day" value={formData.day} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mulai (HH:MM)</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Selesai (HH:MM)</label>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn primary">
              {editingId ? 'Perbarui' : 'Simpan'}
            </button>
            <button type="button" className="btn" onClick={cancelForm}>
              Batal
            </button>
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
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((sch) => {
              const doc = doctors.find(d => d.id === sch.doctorId) || {};
              return (
                <tr key={sch.id}>
                  <td>{doc.name || 'Tidak diketahui'}</td>
                  <td>{sch.day}</td>
                  <td>{sch.startTime} - {sch.endTime}</td>
                  <td>
                    <button className="btn small" onClick={() => editSchedule(sch)}>
                      Edit
                    </button>
                    <button className="btn small danger" onClick={() => deleteSchedule(sch.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
