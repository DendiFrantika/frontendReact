import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';
import './Dokter.css';

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const defaultForm = {
  nama: '', no_identitas: '', spesialisasi: '', no_lisensi: '',
  no_telepon: '', email: '', alamat: '',
  jam_praktek_mulai: '', jam_praktek_selesai: '',
  hari_libur: '', status: '',
};

export default function Dokter() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/dokter');
      setDoctors(res.data.data ?? res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err.response?.data ?? err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrors({});
    try {
      if (editingId) {
        const { nama, spesialisasi, no_telepon, hari_libur, status } = formData;
        await axiosInstance.put(`/dokter/${editingId}`, {
          nama, spesialisasi, no_telepon, hari_libur, status: Number(status),
        });
      } else {
        await axiosInstance.post('/dokter', { ...formData, status: Number(formData.status) });
      }
      await fetchDoctors();
      cancelForm();
    } catch (err) {
      console.error('Error saving doctor:', err.response?.data ?? err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message ?? 'Terjadi kesalahan, coba lagi.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const editDoctor = (doc) => {
    setEditingId(doc.id);
    setErrors({});
    setFormData({
      nama: doc.nama ?? '',
      no_identitas: doc.no_identitas ?? '',
      spesialisasi: doc.spesialisasi ?? '',
      no_lisensi: doc.no_lisensi ?? '',
      no_telepon: doc.no_telepon ?? '',
      email: doc.email ?? '',
      alamat: doc.alamat ?? '',
      jam_praktek_mulai: doc.jam_praktek_mulai ?? '',
      jam_praktek_selesai: doc.jam_praktek_selesai ?? '',
      hari_libur: doc.hari_libur ?? '',
      status: doc.status === true || doc.status === 1 ? '1' : '0',
    });
    setShowForm(true);
  };

  // ✅ Toggle status aktif/nonaktif langsung dari tabel
  const toggleStatus = async (doc) => {
    const statusBaru = doc.status === true || doc.status === 1 ? 0 : 1;
    const konfirmasi = window.confirm(
      `${statusBaru === 1 ? 'Aktifkan' : 'Nonaktifkan'} dokter ${doc.nama}?`
    );
    if (!konfirmasi) return;
    try {
      await axiosInstance.put(`/dokter/${doc.id}`, { status: statusBaru });
      fetchDoctors();
    } catch (err) {
      console.error('Error toggle status:', err.response?.data ?? err);
      alert('Gagal mengubah status dokter.');
    }
  };

  const deleteDoctor = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dokter ini?')) {
      try {
        await axiosInstance.delete(`/dokter/${id}`);
        fetchDoctors();
      } catch (err) {
        console.error('Error deleting doctor:', err);
      }
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultForm);
    setErrors({});
  };

  const renderError = (field) =>
    errors[field] ? <small className="form-error">{errors[field][0]}</small> : null;

  const isAktif = (status) => status === 1 || status === true;

  return (
    <AdminLayout title="Manajemen Dokter">

      <div className="dokter-header">
        <p className="dokter-subtitle">Total {doctors.length} dokter terdaftar</p>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData(defaultForm); }}>
          + Tambah Dokter
        </button>
      </div>

      {showForm && (
        <div className="dokter-card">
          <p className="form-title">{editingId ? 'Edit Dokter' : 'Tambah Dokter Baru'}</p>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nama lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange} required placeholder="dr. Budi Santoso" />
                {renderError('nama')}
              </div>
              <div className="form-group">
                <label className="form-label">Spesialisasi</label>
                <input type="text" name="spesialisasi" value={formData.spesialisasi} onChange={handleChange} required placeholder="Umum / Gigi / Anak..." />
                {renderError('spesialisasi')}
              </div>
              <div className="form-group">
                <label className="form-label">No. telepon</label>
                <input type="text" name="no_telepon" value={formData.no_telepon} onChange={handleChange} required placeholder="08xx..." />
                {renderError('no_telepon')}
              </div>
              <div className="form-group">
                <label className="form-label">Hari libur</label>
                <select name="hari_libur" value={formData.hari_libur} onChange={handleChange}>
                  <option value="">-- Tidak ada --</option>
                  {HARI_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                {renderError('hari_libur')}
              </div>
              <div className="form-group">
                <label className="form-label">Status <span>*</span></label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  <option value="">-- Pilih status --</option>
                  <option value="1">Aktif</option>
                  <option value="0">Tidak aktif</option>
                </select>
                {renderError('status')}
              </div>
            </div>

            {!editingId && (
              <>
                <hr className="form-divider" />
                <p className="form-section-label">Informasi identitas & jadwal</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">No. identitas</label>
                    <input type="text" name="no_identitas" value={formData.no_identitas} onChange={handleChange} required />
                    {renderError('no_identitas')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. lisensi</label>
                    <input type="text" name="no_lisensi" value={formData.no_lisensi} onChange={handleChange} required />
                    {renderError('no_lisensi')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    {renderError('email')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alamat</label>
                    <input type="text" name="alamat" value={formData.alamat} onChange={handleChange} required />
                    {renderError('alamat')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jam praktek mulai</label>
                    <input type="time" name="jam_praktek_mulai" value={formData.jam_praktek_mulai} onChange={handleChange} required />
                    {renderError('jam_praktek_mulai')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jam praktek selesai</label>
                    <input type="time" name="jam_praktek_selesai" value={formData.jam_praktek_selesai} onChange={handleChange} required />
                    {renderError('jam_praktek_selesai')}
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Simpan'}
              </button>
              <button type="button" className="btn-secondary" onClick={cancelForm}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="loading-text">Memuat data dokter...</p>
      ) : (
        <div className="dokter-card-table">
          <table className="dokter-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Spesialisasi</th>
                <th>No. telepon</th>
                <th>Jam praktek</th>
                <th>Hari libur</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr><td colSpan="7"><div className="empty-state">Belum ada data dokter</div></td></tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="nama-text">{doc.nama}</div>
                      <div className="email-text">{doc.email}</div>
                    </td>
                    <td>{doc.spesialisasi}</td>
                    <td>{doc.no_telepon}</td>
                    <td><span className="jam-text">{doc.jam_praktek_mulai} – {doc.jam_praktek_selesai}</span></td>
                    <td>{doc.hari_libur ?? '–'}</td>
                    <td>
                      {/* ✅ Badge bisa diklik untuk toggle status */}
                      <button
                        className={isAktif(doc.status) ? 'badge-aktif badge-toggle' : 'badge-nonaktif badge-toggle'}
                        onClick={() => toggleStatus(doc)}
                        title="Klik untuk ubah status"
                      >
                        {isAktif(doc.status) ? 'Aktif' : 'Tidak aktif'}
                      </button>
                    </td>
                    <td>
                      <button className="btn-small" onClick={() => editDoctor(doc)}>Edit</button>
                      <button className="btn-danger" onClick={() => deleteDoctor(doc.id)}>Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}