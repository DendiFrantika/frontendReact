import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';

export default function Dokter() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialty: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/dokter');
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
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
        await axiosInstance.put(`/admin/dokter/${editingId}`, formData);
      } else {
        await axiosInstance.post('/admin/dokter', formData);
      }
      fetchDoctors();
      cancelForm();
    } catch (err) {
      console.error('Error saving doctor:', err);
    }
  };

  const editDoctor = (doc) => {
    setEditingId(doc.id);
    setFormData({ name: doc.name, specialty: doc.specialty, phone: doc.phone });
    setShowForm(true);
  };

  const deleteDoctor = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dokter ini?')) {
      try {
        await axiosInstance.delete(`/admin/dokter/${id}`);
        fetchDoctors();
      } catch (err) {
        console.error('Error deleting doctor:', err);
      }
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', specialty: '', phone: '' });
  };

  return (
    <AdminLayout title="Manajemen Dokter">
        <button className="btn" onClick={() => setShowForm(true)}>
          Tambah Dokter
        </button>

        {showForm && (
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Spesialisasi</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Telepon</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
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
          <p>Memuat dokter...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Spesialisasi</th>
                <th>Telepon</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  <td>{doc.specialty}</td>
                  <td>{doc.phone}</td>
                  <td>
                    <button className="btn small" onClick={() => editDoctor(doc)}>
                      Edit
                    </button>
                    <button className="btn small danger" onClick={() => deleteDoctor(doc.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </AdminLayout>
  );
}
