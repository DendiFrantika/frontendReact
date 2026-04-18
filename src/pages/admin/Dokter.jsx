import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminCrudModal from '../../components/AdminCrudModal';
import {
  normalizeErrorMessage,
  normalizeFieldErrors,
  requestWithFallback,
  unpackCollection,
} from '../../services/adminCrudApi';
import { validateDokterForm } from '../../services/adminMasterValidation';
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (searchDebounced) params.search = searchDebounced;
    try {
      const res = await requestWithFallback([
        { method: 'get', url: '/admin/dokter', params },
        { method: 'get', url: '/dokter', params },
      ]);
      setDoctors(unpackCollection(res.data));
    } catch (err) {
      console.error('Error fetching doctors:', err.response?.data ?? err);
    } finally {
      setLoading(false);
    }
  }, [searchDebounced]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});
    const clientErrors = validateDokterForm(formData, { editing: Boolean(editingId) });
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setSubmitLoading(true);
    try {
      if (editingId) {
        const { nama, spesialisasi, no_telepon, hari_libur, status } = formData;
        await requestWithFallback([
          {
            method: 'put',
            url: `/admin/dokter/${editingId}`,
            data: { nama, spesialisasi, no_telepon, hari_libur, status: Number(status) },
          },
          {
            method: 'put',
            url: `/dokter/${editingId}`,
            data: { nama, spesialisasi, no_telepon, hari_libur, status: Number(status) },
          },
        ]);
      } else {
        await requestWithFallback([
          {
            method: 'post',
            url: '/admin/dokter',
            data: { ...formData, status: Number(formData.status) },
          },
          {
            method: 'post',
            url: '/dokter',
            data: { ...formData, status: Number(formData.status) },
          },
        ]);
      }
      await fetchDoctors();
      cancelForm();
      setNotice(editingId ? 'Data dokter berhasil diperbarui.' : 'Data dokter berhasil ditambahkan.');
    } catch (err) {
      console.error('Error saving doctor:', err.response?.data ?? err);
      const fieldErrors = normalizeFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setSubmitError(normalizeErrorMessage(err, 'Terjadi kesalahan, coba lagi.'));
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

  const toggleStatus = async (doc) => {
    const statusBaru = doc.status === true || doc.status === 1 ? 0 : 1;
    try {
      await requestWithFallback([
        { method: 'put', url: `/admin/dokter/${doc.id}`, data: { status: statusBaru } },
        { method: 'put', url: `/dokter/${doc.id}`, data: { status: statusBaru } },
      ]);
      fetchDoctors();
      setNotice(`Status dokter ${doc.nama} berhasil diubah.`);
    } catch (err) {
      console.error('Error toggle status:', err.response?.data ?? err);
      setSubmitError('Gagal mengubah status dokter.');
    }
  };

  const deleteDoctor = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      await requestWithFallback([
        { method: 'delete', url: `/admin/dokter/${deleteTarget.id}` },
        { method: 'delete', url: `/dokter/${deleteTarget.id}` },
      ]);
      await fetchDoctors();
      setDeleteTarget(null);
      setNotice('Data dokter berhasil dihapus.');
    } catch (err) {
      console.error('Error deleting doctor:', err);
      setSubmitError('Gagal menghapus data dokter.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultForm);
    setErrors({});
    setSubmitError('');
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

      <div className="dokter-toolbar">
        <label htmlFor="dokter-search">Cari</label>
        <input
          id="dokter-search"
          className="dokter-search-input"
          type="search"
          placeholder="Cari nama atau spesialisasi…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          autoComplete="off"
        />
      </div>

      {notice && <div className="dokter-card"><p className="dokter-subtitle">{notice}</p></div>}

      <AdminCrudModal
        open={showForm}
        title={editingId ? 'Edit Dokter' : 'Tambah Dokter Baru'}
        onClose={cancelForm}
      >
        <div className="dokter-card">
          <p className="form-title">{editingId ? 'Edit Dokter' : 'Tambah Dokter Baru'}</p>
          {submitError ? <p className="form-error">{submitError}</p> : null}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nama lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange} required maxLength={255} placeholder="dr. Budi Santoso" />
                {renderError('nama')}
              </div>
              <div className="form-group">
                <label className="form-label">Spesialisasi</label>
                <input type="text" name="spesialisasi" value={formData.spesialisasi} onChange={handleChange} required maxLength={100} placeholder="Umum / Gigi / Anak..." />
                {renderError('spesialisasi')}
              </div>
              <div className="form-group">
                <label className="form-label">No. telepon</label>
                <input type="text" name="no_telepon" value={formData.no_telepon} onChange={handleChange} required maxLength={20} placeholder="08xx..." />
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
                    <input type="text" name="no_identitas" value={formData.no_identitas} onChange={handleChange} required maxLength={50} />
                    {renderError('no_identitas')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. lisensi</label>
                    <input type="text" name="no_lisensi" value={formData.no_lisensi} onChange={handleChange} required maxLength={50} />
                    {renderError('no_lisensi')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required maxLength={255} />
                    {renderError('email')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alamat</label>
                    <input type="text" name="alamat" value={formData.alamat} onChange={handleChange} required maxLength={500} />
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
      </AdminCrudModal>

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
                      <button className="btn-danger" onClick={() => setDeleteTarget(doc)}>Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdminCrudModal
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Dokter"
        onClose={() => setDeleteTarget(null)}
        size="sm"
      >
        <p>Hapus data dokter <strong>{deleteTarget?.nama}</strong>?</p>
        <div className="form-actions">
          <button
            type="button"
            className="btn-danger"
            onClick={deleteDoctor}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setDeleteTarget(null)}
            disabled={deleteLoading}
          >
            Batal
          </button>
        </div>
      </AdminCrudModal>
    </AdminLayout>
  );
}