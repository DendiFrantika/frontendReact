import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminCrudModal from '../../components/AdminCrudModal';
import {
  normalizeErrorMessage,
  normalizeFieldErrors,
  requestWithFallback,
  unpackCollection,
} from '../../services/adminCrudApi';
import { validateDokterForm, validateJadwalForm } from '../../services/adminMasterValidation';
import './Dokter.css';

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const defaultForm = {
  nama: '', no_identitas: '', spesialisasi: '', no_lisensi: '',
  no_telepon: '', email: '', alamat: '',
  jam_praktek_mulai: '', jam_praktek_selesai: '',
  hari_libur: '', status: '',
};

const defaultJadwalForm = {
  dokter_id: '', hari: '', jam_mulai: '', jam_selesai: '', kapasitas: 10,
};

export default function Dokter() {
  const [activeTab, setActiveTab] = useState('dokter'); // 'dokter' | 'jadwal'

  // --- state dokter (sama seperti sebelumnya) ---
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

  // --- state jadwal ---
  const [viewMode, setViewMode] = useState('hari');
  const [schedules, setSchedules] = useState([]);
  const [jadwalLoading, setJadwalLoading] = useState(false);
  const [showJadwalForm, setShowJadwalForm] = useState(false);
  const [jadwalForm, setJadwalForm] = useState(defaultJadwalForm);
  const [editingJadwalId, setEditingJadwalId] = useState(null);
  const [jadwalErrors, setJadwalErrors] = useState({});
  const [jadwalSubmitLoading, setJadwalSubmitLoading] = useState(false);
  const [deleteJadwalTarget, setDeleteJadwalTarget] = useState(null);
  const [jadwalSubmitError, setJadwalSubmitError] = useState('');

  const groupedByDay = schedules.reduce((acc, sch) => {
  if (!acc[sch.hari]) acc[sch.hari] = [];
  acc[sch.hari].push(sch);
  return acc;
}, {});

const groupedByDoctor = schedules.reduce((acc, sch) => {
  const name = sch.dokter?.nama || 'Dokter';
  if (!acc[name]) acc[name] = [];
  acc[name].push(sch);
  return acc;
}, {});

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
      ]);
      setDoctors(unpackCollection(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchDebounced]);

  const fetchSchedules = useCallback(async () => {
    setJadwalLoading(true);
    try {
      const res = await requestWithFallback([
        { method: 'get', url: '/admin/jadwal' },
      ]);
      setSchedules(unpackCollection(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setJadwalLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  // ---- handler dokter (sama seperti sebelumnya, tidak berubah) ----
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
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }
    setSubmitLoading(true);
    try {
      if (editingId) {
        const { nama, spesialisasi, no_telepon, hari_libur, status } = formData;
        await requestWithFallback([
          { method: 'put', url: `/admin/dokter/${editingId}`, data: { nama, spesialisasi, no_telepon, hari_libur, status: Number(status) } },
        ]);
      } else {
        await requestWithFallback([
          { method: 'post', url: '/admin/dokter', data: { ...formData, status: Number(formData.status) } },
        ]);
      }
      await fetchDoctors();
      cancelForm();
      setNotice(editingId ? 'Data dokter berhasil diperbarui.' : 'Data dokter berhasil ditambahkan.');
    } catch (err) {
      const fieldErrors = normalizeFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setSubmitError(normalizeErrorMessage(err, 'Terjadi kesalahan, coba lagi.'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const editDoctor = (doc) => {
    setEditingId(doc.id);
    setErrors({});
    setFormData({
      nama: doc.nama ?? '', no_identitas: doc.no_identitas ?? '',
      spesialisasi: doc.spesialisasi ?? '', no_lisensi: doc.no_lisensi ?? '',
      no_telepon: doc.no_telepon ?? '', email: doc.email ?? '',
      alamat: doc.alamat ?? '', jam_praktek_mulai: doc.jam_praktek_mulai ?? '',
      jam_praktek_selesai: doc.jam_praktek_selesai ?? '', hari_libur: doc.hari_libur ?? '',
      status: doc.status === true || doc.status === 1 ? '1' : '0',
    });
    setShowForm(true);
  };

  const toggleStatus = async (doc) => {
    const statusBaru = doc.status === true || doc.status === 1 ? 0 : 1;
    try {
      await requestWithFallback([
        { method: 'put', url: `/admin/dokter/${doc.id}`, data: { status: statusBaru } },
      ]);
      fetchDoctors();
      setNotice(`Status dokter ${doc.nama} berhasil diubah.`);
    } catch (err) {
      setSubmitError('Gagal mengubah status dokter.');
    }
  };

  const deleteDoctor = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      await requestWithFallback([
        { method: 'delete', url: `/admin/dokter/${deleteTarget.id}` },
      ]);
      await fetchDoctors();
      setDeleteTarget(null);
      setNotice('Data dokter berhasil dihapus.');
    } catch (err) {
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

  // ---- handler jadwal ----
  const handleJadwalChange = (e) => {
    const { name, value } = e.target;
    setJadwalForm((prev) => ({ ...prev, [name]: value }));
    setJadwalErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleJadwalSubmit = async (e) => {
    e.preventDefault();
    setJadwalSubmitError('');
    setJadwalErrors({});
    const clientErrors = validateJadwalForm(jadwalForm);
    if (Object.keys(clientErrors).length > 0) { setJadwalErrors(clientErrors); return; }
    const payload = { ...jadwalForm, dokter_id: Number(jadwalForm.dokter_id), kapasitas: Number(jadwalForm.kapasitas) };
    setJadwalSubmitLoading(true);
    try {
      if (editingJadwalId) {
        await requestWithFallback([
          { method: 'put', url: `/admin/jadwal/${editingJadwalId}`, data: payload },
        ]);
      } else {
        await requestWithFallback([
          { method: 'post', url: '/admin/jadwal', data: payload },
        ]);
      }
      await fetchSchedules();
      cancelJadwalForm();
      setNotice(editingJadwalId ? 'Jadwal berhasil diperbarui.' : 'Jadwal berhasil ditambahkan.');
    } catch (err) {
      const fieldErrors = normalizeFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) setJadwalErrors(fieldErrors);
      else setJadwalSubmitError(normalizeErrorMessage(err, 'Gagal menyimpan jadwal.'));
    } finally {
      setJadwalSubmitLoading(false);
    }
  };

  const editJadwal = (sch) => {
    setEditingJadwalId(sch.id);
    setJadwalForm({
      dokter_id: sch.dokter_id,
      hari: sch.hari,
      jam_mulai: sch.jam_mulai?.substring(0, 5) ?? '',
      jam_selesai: sch.jam_selesai?.substring(0, 5) ?? '',
      kapasitas: sch.kapasitas,
    });
    setShowJadwalForm(true);
  };

  const deleteJadwal = async () => {
    if (!deleteJadwalTarget?.id) return;
    try {
      await requestWithFallback([
        { method: 'delete', url: `/admin/jadwal/${deleteJadwalTarget.id}` },
      ]);
      await fetchSchedules();
      setDeleteJadwalTarget(null);
      setNotice('Jadwal berhasil dihapus.');
    } catch (err) {
      setJadwalSubmitError('Gagal menghapus jadwal.');
    }
  };

  const cancelJadwalForm = () => {
    setShowJadwalForm(false);
    setEditingJadwalId(null);
    setJadwalForm(defaultJadwalForm);
    setJadwalErrors({});
    setJadwalSubmitError('');
  };

  const renderError = (field) =>
    errors[field] ? <small className="form-error">{errors[field][0]}</small> : null;

  const renderJadwalError = (field) =>
    jadwalErrors[field] ? <small className="form-error">{jadwalErrors[field][0] ?? jadwalErrors[field]}</small> : null;

  const isAktif = (status) => status === 1 || status === true;

  return (
    <AdminLayout title="Manajemen Dokter">

      {/* TAB */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '0.5px solid var(--color-border-tertiary)', paddingBottom: '0' }}>
        {[
          { key: 'dokter', label: '👨‍⚕️ Data Dokter' },
          { key: 'jadwal', label: '📅 Jadwal Kerja' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #185FA5' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab.key ? '#185FA5' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.key ? 500 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {notice && <div className="dokter-card"><p className="dokter-subtitle">{notice}</p></div>}

      {/* ===== TAB DOKTER ===== */}
      {activeTab === 'dokter' && (
        <>
          <div className="dokter-header">
            <p className="dokter-subtitle">Total {doctors.length} dokter terdaftar</p>
            <button className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData(defaultForm); }}>
              + Tambah Dokter
            </button>
          </div>

          <div className="dokter-toolbar">
            <label htmlFor="dokter-search">Cari</label>
            <input
              id="dokter-search" className="dokter-search-input" type="search"
              placeholder="Cari nama atau spesialisasi…"
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)} autoComplete="off"
            />
          </div>

          {loading ? (
            <p className="loading-text">Memuat data dokter...</p>
          ) : (
            <div className="dokter-card-table">
              <table className="dokter-table">
                <thead>
                  <tr>
                    <th>Nama</th><th>Spesialisasi</th><th>No. telepon</th>
                    <th>Jam praktek</th><th>Hari libur</th><th>Status</th><th>Aksi</th>
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
                            onClick={() => toggleStatus(doc)} title="Klik untuk ubah status"
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
        </>
      )}

      {/* ===== TAB JADWAL ===== */}
      {activeTab === 'jadwal' && (
        <>
          <div className="dokter-header">
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={viewMode === 'hari' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setViewMode('hari')}
          >
            Per Hari
          </button>

          <button
            className={viewMode === 'dokter' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setViewMode('dokter')}
          >
            Per Dokter
          </button>
        </div>
            <p className="dokter-subtitle">Total {schedules.length} jadwal terdaftar</p>
            <button className="btn-primary" onClick={() => { setShowJadwalForm(true); setEditingJadwalId(null); setJadwalForm(defaultJadwalForm); }}>
              + Tambah Jadwal
            </button>
          </div>

          {jadwalLoading ? (
            <p className="loading-text">Memuat jadwal...</p>
          ) : (
          <div className="jadwal-container">

  {/* ================= PER HARI ================= */}
  {viewMode === 'hari' && HARI_OPTIONS.map(day => {
    const list = groupedByDay[day];
    if (!list) return null;

    return (
      <div key={day} className="dokter-card" style={{ marginBottom: 16 }}>
        <h4>📅 {day}</h4>

        {list.map((sch) => (
          <div key={sch.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #eee'
          }}>
            <div>
              <b>{sch.dokter?.nama ?? '–'}</b>
              <div>{sch.jam_mulai?.substring(0,5)} - {sch.jam_selesai?.substring(0,5)}</div>
              <small>Kapasitas: {sch.kapasitas}</small>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-small" onClick={() => editJadwal(sch)}>Edit</button>
              <button className="btn-danger" onClick={() => setDeleteJadwalTarget(sch)}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    );
  })}

  {/* ================= PER DOKTER ================= */}
  {viewMode === 'dokter' && Object.keys(groupedByDoctor).map(doc => (
    <div key={doc} className="dokter-card" style={{ marginBottom: 16 }}>
      <h4>👨‍⚕️ {doc}</h4>

      {groupedByDoctor[doc].map((sch) => (
        <div key={sch.id} style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #eee'
        }}>
          <div>
            <b>{sch.hari}</b>
            <div>{sch.jam_mulai?.substring(0,5)} - {sch.jam_selesai?.substring(0,5)}</div>
            <small>Kapasitas: {sch.kapasitas}</small>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-small" onClick={() => editJadwal(sch)}>Edit</button>
            <button className="btn-danger" onClick={() => setDeleteJadwalTarget(sch)}>Hapus</button>
          </div>
        </div>
      ))}
    </div>
  ))}

</div>
          )}
        </>
      )}

      {/* MODAL FORM DOKTER (tidak berubah) */}
      <AdminCrudModal open={showForm} title={editingId ? 'Edit Dokter' : 'Tambah Dokter Baru'} onClose={cancelForm}>
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

      {/* MODAL FORM JADWAL */}
      <AdminCrudModal open={showJadwalForm} title={editingJadwalId ? 'Edit Jadwal' : 'Tambah Jadwal'} onClose={cancelJadwalForm}>
        <div style={{ padding: '4px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>Jadwal Kerja</p>
            <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>{editingJadwalId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
          </div>
          {jadwalSubmitError && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-danger)', background: 'var(--color-background-danger)', padding: '10px 14px', borderRadius: 'var(--border-radius-md)', marginBottom: '16px' }}>
              {jadwalSubmitError}
            </p>
          )}
          <form onSubmit={handleJadwalSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Dokter <span style={{ color: 'var(--color-text-danger)' }}>*</span>
                </label>
                <select name="dokter_id" value={jadwalForm.dokter_id} onChange={handleJadwalChange} required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--border-radius-md)', border: jadwalErrors.dokter_id ? '1px solid var(--color-border-danger)' : '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: '14px' }}>
                  <option value="">— Pilih dokter —</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
                {renderJadwalError('dokter_id')}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  Hari <span style={{ color: 'var(--color-text-danger)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                  {HARI_OPTIONS.map(day => {
                    const selected = jadwalForm.hari === day;
                    return (
                      <button key={day} type="button"
                        onClick={() => { setJadwalForm(f => ({ ...f, hari: day })); setJadwalErrors(p => ({ ...p, hari: null })); }}
                        style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 'var(--border-radius-md)', border: selected ? '2px solid #185FA5' : '0.5px solid var(--color-border-secondary)', background: selected ? '#E6F1FB' : 'transparent', color: selected ? '#0C447C' : 'var(--color-text-secondary)', fontSize: '12px', fontWeight: selected ? 500 : 400, cursor: 'pointer' }}>
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
                {renderJadwalError('hari')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Jam mulai *</label>
                  <input type="time" name="jam_mulai" value={jadwalForm.jam_mulai} onChange={handleJadwalChange} required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: '14px', boxSizing: 'border-box' }} />
                  {renderJadwalError('jam_mulai')}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Jam selesai *</label>
                  <input type="time" name="jam_selesai" value={jadwalForm.jam_selesai} onChange={handleJadwalChange} required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: '14px', boxSizing: 'border-box' }} />
                  {renderJadwalError('jam_selesai')}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Kapasitas pasien</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="range" min="1" max="50" name="kapasitas" value={jadwalForm.kapasitas} onChange={handleJadwalChange} style={{ flex: 1 }} />
                  <div style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', padding: '6px 14px', fontSize: '14px', fontWeight: 500, minWidth: '42px', textAlign: 'center' }}>
                    {jadwalForm.kapasitas}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={cancelJadwalForm} disabled={jadwalSubmitLoading}
                  style={{ padding: '9px 20px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                  Batal
                </button>
                <button type="submit" disabled={jadwalSubmitLoading}
                  style={{ padding: '9px 20px', borderRadius: 'var(--border-radius-md)', border: 'none', background: jadwalSubmitLoading ? 'var(--color-background-secondary)' : '#185FA5', color: jadwalSubmitLoading ? 'var(--color-text-secondary)' : '#fff', fontSize: '14px', fontWeight: 500, cursor: jadwalSubmitLoading ? 'not-allowed' : 'pointer' }}>
                  {jadwalSubmitLoading ? 'Menyimpan...' : editingJadwalId ? 'Update jadwal' : 'Simpan jadwal'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </AdminCrudModal>

      {/* MODAL HAPUS DOKTER */}
      <AdminCrudModal open={Boolean(deleteTarget)} title="Konfirmasi Hapus Dokter" onClose={() => setDeleteTarget(null)} size="sm">
        <p>Hapus data dokter <strong>{deleteTarget?.nama}</strong>?</p>
        <div className="form-actions">
          <button type="button" className="btn-danger" onClick={deleteDoctor} disabled={deleteLoading}>
            {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Batal</button>
        </div>
      </AdminCrudModal>

      {/* MODAL HAPUS JADWAL */}
      <AdminCrudModal open={Boolean(deleteJadwalTarget)} title="Konfirmasi Hapus Jadwal" onClose={() => setDeleteJadwalTarget(null)} size="sm">
        <p>Hapus jadwal <strong>{deleteJadwalTarget?.dokter?.nama}</strong> hari <strong>{deleteJadwalTarget?.hari}</strong>?</p>
        <div className="form-actions">
          <button type="button" className="btn-danger" onClick={deleteJadwal}>Ya, Hapus</button>
          <button type="button" className="btn-secondary" onClick={() => setDeleteJadwalTarget(null)}>Batal</button>
        </div>
      </AdminCrudModal>

    </AdminLayout>
  );
}