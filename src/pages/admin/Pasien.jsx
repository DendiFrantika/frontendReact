import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminCrudModal from '../../components/AdminCrudModal';
import {
  normalizeErrorMessage,
  normalizeFieldErrors,
  requestWithFallback,
  unpackCollection,
} from '../../services/adminCrudApi';
import {
  validatePasienForm,
  normalizeJenisKelaminForForm,
  displayJenisKelamin,
} from '../../services/adminMasterValidation';
import './Pasien.css';

const emptyForm = () => ({
  nama: '',
  tanggal_lahir: '',
  jenis_kelamin: '',
  no_telepon: '',
  email: '',
  golongan_darah: '',
});

function buildPasienPayload(form) {
  const payload = {
    nama: String(form.nama || '').trim(),
    tanggal_lahir: form.tanggal_lahir,
    jenis_kelamin: form.jenis_kelamin,
  };
  const tel = String(form.no_telepon || '').trim();
  if (tel) payload.no_telepon = tel;
  const em = String(form.email || '').trim();
  if (em) payload.email = em;
  const gd = String(form.golongan_darah || '').trim();
  if (gd) payload.golongan_darah = gd;
  return payload;
}

export default function Pasien() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');

  const [filterSearchInput, setFilterSearchInput] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterJk, setFilterJk] = useState('');
  const [filterGoldar, setFilterGoldar] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setFilterSearch(filterSearchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [filterSearchInput]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (filterSearch) params.search = filterSearch;
    if (filterJk) params.jenis_kelamin = filterJk;
    if (filterGoldar) params.golongan_darah = filterGoldar;
    try {
      const res = await requestWithFallback([
        { method: 'get', url: '/admin/pasien', params },
        { method: 'get', url: '/pasien', params },
      ]);
      setPatients(unpackCollection(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterSearch, filterJk, filterGoldar]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

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
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditId(null);
    setErrors({});
    setSubmitError('');
  };

  const resetFilters = () => {
    setFilterSearchInput('');
    setFilterSearch('');
    setFilterJk('');
    setFilterGoldar('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});
    const clientErrors = validatePasienForm(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    const payload = buildPasienPayload(form);
    setSubmitLoading(true);
    try {
      if (editId) {
        await requestWithFallback([
          { method: 'put', url: `/admin/pasien/${editId}`, data: payload },
          { method: 'put', url: `/pasien/${editId}`, data: payload },
        ]);
      } else {
        await requestWithFallback([
          { method: 'post', url: '/admin/pasien', data: payload },
          { method: 'post', url: '/pasien', data: payload },
        ]);
      }
      await fetchPatients();
      setShowForm(false);
      setNotice(editId ? 'Data pasien berhasil diperbarui.' : 'Data pasien berhasil ditambahkan.');
      resetForm();
    } catch (err) {
      console.error(err.response?.data ?? err);
      const fieldErrors = normalizeFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setSubmitError(normalizeErrorMessage(err, 'Gagal menyimpan data pasien.'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (p) => {
    const formattedDate = p.tanggal_lahir ? String(p.tanggal_lahir).substring(0, 10) : '';
    setForm({
      nama: p.nama ?? '',
      tanggal_lahir: formattedDate,
      jenis_kelamin: normalizeJenisKelaminForForm(p.jenis_kelamin),
      no_telepon: p.no_telepon ?? '',
      email: p.email ?? '',
      golongan_darah: p.golongan_darah ? String(p.golongan_darah).toUpperCase() : '',
    });
    setErrors({});
    setSubmitError('');
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      await requestWithFallback([
        { method: 'delete', url: `/admin/pasien/${deleteTarget.id}` },
        { method: 'delete', url: `/pasien/${deleteTarget.id}` },
      ]);
      await fetchPatients();
      setDeleteTarget(null);
      setNotice('Data pasien berhasil dihapus.');
    } catch (err) {
      console.error(err);
      setSubmitError('Gagal menghapus data pasien.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout title="Manajemen Pasien">
      <div className="container">
        <button className="btn-add" onClick={() => { setShowForm(true); resetForm(); }}>
          + Tambah Pasien
        </button>

        <div className="pasien-toolbar" role="search">
          <div className="pasien-toolbar-field pasien-toolbar-field--grow">
            <label htmlFor="pasien-filter-search">Cari nama</label>
            <input
              id="pasien-filter-search"
              type="search"
              placeholder="Ketik lalu tunggu atau ubah filter…"
              value={filterSearchInput}
              onChange={(e) => setFilterSearchInput(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="pasien-toolbar-field">
            <label htmlFor="pasien-filter-jk">Jenis kelamin</label>
            <select
              id="pasien-filter-jk"
              value={filterJk}
              onChange={(e) => setFilterJk(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div className="pasien-toolbar-field">
            <label htmlFor="pasien-filter-goldar">Gol. darah</label>
            <select
              id="pasien-filter-goldar"
              value={filterGoldar}
              onChange={(e) => setFilterGoldar(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>
          <div className="pasien-toolbar-actions">
            <button type="button" className="btn-filter-reset" onClick={resetFilters}>
              Reset filter
            </button>
          </div>
        </div>

        {notice && <p>{notice}</p>}

        <AdminCrudModal
          open={showForm}
          title={editId ? 'Edit Pasien' : 'Tambah Pasien'}
          onClose={() => { setShowForm(false); resetForm(); }}
        >
          <div className="form-box">
            <h3>{editId ? 'Edit Pasien' : 'Tambah Pasien'}</h3>
            {submitError ? <p className="form-error">{submitError}</p> : null}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama</label>
                <input name="nama" placeholder="Nama Lengkap" value={form.nama} onChange={handleChange} required maxLength={255} />
                {errors.nama ? <small className="form-error">{errors.nama[0]}</small> : null}
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
                {errors.tanggal_lahir ? <small className="form-error">{errors.tanggal_lahir[0]}</small> : null}
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
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
                {errors.jenis_kelamin ? <small className="form-error">{errors.jenis_kelamin[0]}</small> : null}
              </div>

              <div className="form-group">
                <label>No Telepon</label>
                <input name="no_telepon" placeholder="0812..." value={form.no_telepon} onChange={handleChange} maxLength={20} />
                {errors.no_telepon ? <small className="form-error">{errors.no_telepon[0]}</small> : null}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="email@domain.com" value={form.email} onChange={handleChange} maxLength={255} />
                {errors.email ? <small className="form-error">{errors.email[0]}</small> : null}
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
                {errors.golongan_darah ? <small className="form-error">{errors.golongan_darah[0]}</small> : null}
              </div>

              <div className="form-actions">
                <button className="btn-save" type="submit" disabled={submitLoading}>
                  {submitLoading ? 'Menyimpan...' : editId ? 'Update' : 'Simpan'}
                </button>
                <button
                  className="btn-cancel"
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  disabled={submitLoading}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </AdminCrudModal>

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
                    <td>{displayJenisKelamin(p.jenis_kelamin)}</td>
                    <td>{p.no_telepon}</td>
                    <td>{p.email}</td>
                    <td>{p.golongan_darah}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn-delete" onClick={() => setDeleteTarget(p)}>Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <AdminCrudModal
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Pasien"
        onClose={() => setDeleteTarget(null)}
        size="sm"
      >
        <p>
          Yakin ingin menghapus pasien <strong>{deleteTarget?.nama}</strong>?
        </p>
        <div className="form-actions">
          <button type="button" className="btn-delete" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
          <button type="button" className="btn-cancel" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
            Batal
          </button>
        </div>
      </AdminCrudModal>
    </AdminLayout>
  );
}