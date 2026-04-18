import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';
import './Pasien.css';

export default function Pasien() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    no_telepon: '',
    email: '',
    golongan_darah: '',
  });

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/pasien');
      setPatients(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hitungUmur = (tanggal_lahir) => {
    if (!tanggal_lahir) return '-';
    const today = new Date();
    const lahir = new Date(tanggal_lahir);
    let age = today.getFullYear() - lahir.getFullYear();
    const m = today.getMonth() - lahir.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < lahir.getDate())) {
        age--;
    }
    return age;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      nama: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      no_telepon: '',
      email: '',
      golongan_darah: '',
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(`/pasien/${editId}`, form);
      } else {
        await axiosInstance.post('/pasien', form);
      }
      fetchPatients();
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error(err.response?.data ?? err);
    }
  };

  const handleEdit = (p) => {
    // FIX: Format tanggal ke YYYY-MM-DD agar dibaca oleh input type="date"
    const formattedDate = p.tanggal_lahir ? p.tanggal_lahir.substring(0, 10) : '';
    
    setForm({
      ...p,
      tanggal_lahir: formattedDate
    });
    
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pasien ini?')) return;
    try {
      await axiosInstance.delete(`/pasien/${id}`);
      fetchPatients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Manajemen Pasien">
      <div className="container">
        <button className="btn-add" onClick={() => { setShowForm(true); resetForm(); }}>
          + Tambah Pasien
        </button>

        {showForm && (
          <div className="form-box">
            <h3>{editId ? 'Edit Pasien' : 'Tambah Pasien'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama</label>
                <input name="nama" placeholder="Nama Lengkap" value={form.nama} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Tanggal Lahir</label>
                <input 
                  type="date" 
                  name="tanggal_lahir" 
                  value={form.tanggal_lahir} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Jenis Kelamin</label>
                <select 
                  name="jenis_kelamin" 
                  value={form.jenis_kelamin} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">-- Pilih --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="form-group">
                <label>No Telepon</label>
                <input name="no_telepon" placeholder="0812..." value={form.no_telepon} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="email@domain.com" value={form.email} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Golongan Darah</label>
                <select name="golongan_darah" value={form.golongan_darah} onChange={handleChange}>
                  <option value="">-- Pilih --</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div className="form-actions">
                <button className="btn-save" type="submit">
                  {editId ? 'Update' : 'Simpan'}
                </button>
                <button className="btn-cancel" type="button" onClick={() => setShowForm(false)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Memuat data pasien...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Umur</th>
                <th>JK</th>
                <th>Telepon</th>
                <th>Email</th>
                <th>Gol Darah</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>Tidak ada data pasien</td>
                </tr>
              ) : (
                patients.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.nama}</td>
                    <td>{hitungUmur(p.tanggal_lahir)} thn</td>
                    <td>{p.jenis_kelamin}</td>
                    <td>{p.no_telepon}</td>
                    <td>{p.email}</td>
                    <td>{p.golongan_darah}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(p.id)}>Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}