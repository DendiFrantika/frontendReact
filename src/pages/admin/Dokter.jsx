'use client';

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
  const [activeTab, setActiveTab] = useState('dokter');

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
    } catch {
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
    } catch {
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
    } catch {
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
    errors[field] ? <small className="dk-form-error">{errors[field][0]}</small> : null;

  const renderJadwalError = (field) =>
    jadwalErrors[field] ? <small className="dk-form-error">{jadwalErrors[field][0] ?? jadwalErrors[field]}</small> : null;

  const isAktif = (status) => status === 1 || status === true;

  return (
    <AdminLayout title="">

      {/* ── PAGE HEADER ── */}
      <div className="dk-page-header">
        <div>
          <h1 className="dk-page-title">Manajemen Dokter</h1>
          <p className="dk-page-sub">Kelola data dokter dan jadwal praktik klinik</p>
        </div>
      </div>

      {/* ── NOTICE ── */}
      {notice && (
        <div className="dk-notice" onAnimationEnd={() => setTimeout(() => setNotice(''), 3000)}>
          {notice}
        </div>
      )}

      {/* ── TABS ── */}
      <div className="dk-tabs">
        {[
          { key: 'dokter', label: 'Data Dokter' },
          { key: 'jadwal', label: 'Jadwal Kerja' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`dk-tab ${activeTab === tab.key ? 'dk-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TAB DOKTER ===== */}
      {activeTab === 'dokter' && (
        <>
          <div className="dk-toolbar">
            <div className="dk-toolbar-left">
              <input
                id="dokter-search"
                className="dk-search"
                type="search"
                placeholder="Cari nama atau spesialisasi..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="dk-toolbar-right">
              <span className="dk-count">Total {doctors.length} dokter</span>
              <button
                className="dk-btn-primary"
                onClick={() => { setShowForm(true); setEditingId(null); setFormData(defaultForm); }}
              >
                Tambah Dokter
              </button>
            </div>
          </div>

          {loading ? (
            <div className="dk-loading">Memuat data dokter...</div>
          ) : (
            <div className="dk-table-wrap">
              <table className="dk-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Spesialisasi</th>
                    <th>No. Telepon</th>
                    <th>Jam Praktek</th>
                    <th>Hari Libur</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <div className="dk-empty">Belum ada data dokter</div>
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="dk-nama">{doc.nama}</div>
                          <div className="dk-email">{doc.email}</div>
                        </td>
                        <td>{doc.spesialisasi}</td>
                        <td>{doc.no_telepon}</td>
                        <td>
                          <span className="dk-jam">
                            {doc.jam_praktek_mulai} – {doc.jam_praktek_selesai}
                          </span>
                        </td>
                        <td>{doc.hari_libur ?? '–'}</td>
                        <td>
                          <button
                            className={isAktif(doc.status) ? 'dk-badge-aktif' : 'dk-badge-nonaktif'}
                            onClick={() => toggleStatus(doc)}
                            title="Klik untuk ubah status"
                          >
                            {isAktif(doc.status) ? 'Aktif' : 'Tidak aktif'}
                          </button>
                        </td>
                        <td>
                          <div className="dk-aksi">
                            <button className="dk-btn-edit" onClick={() => editDoctor(doc)}>Edit</button>
                            <button className="dk-btn-hapus" onClick={() => setDeleteTarget(doc)}>Hapus</button>
                          </div>
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
          <div className="dk-toolbar">
            <div className="dk-toolbar-left">
              <div className="dk-view-toggle">
                <button
                  className={`dk-view-btn ${viewMode === 'hari' ? 'dk-view-btn-active' : ''}`}
                  onClick={() => setViewMode('hari')}
                >
                  Per Hari
                </button>
                <button
                  className={`dk-view-btn ${viewMode === 'dokter' ? 'dk-view-btn-active' : ''}`}
                  onClick={() => setViewMode('dokter')}
                >
                  Per Dokter
                </button>
              </div>
            </div>
            <div className="dk-toolbar-right">
              <span className="dk-count">Total {schedules.length} jadwal</span>
              <button
                className="dk-btn-primary"
                onClick={() => { setShowJadwalForm(true); setEditingJadwalId(null); setJadwalForm(defaultJadwalForm); }}
              >
                Tambah Jadwal
              </button>
            </div>
          </div>

          {jadwalLoading ? (
            <div className="dk-loading">Memuat jadwal...</div>
          ) : (
            <div className="dk-jadwal-grid">

              {/* PER HARI */}
              {viewMode === 'hari' && HARI_OPTIONS.map(day => {
                const list = groupedByDay[day];
                if (!list) return null;
                return (
                  <div key={day} className="dk-jadwal-card">
                    <div className="dk-jadwal-card-header">
                      <span className="dk-jadwal-day">{day}</span>
                      <span className="dk-jadwal-count">{list.length} jadwal</span>
                    </div>
                    <div className="dk-jadwal-list">
                      {list.map((sch) => (
                        <div key={sch.id} className="dk-jadwal-item">
                          <div className="dk-jadwal-info">
                            <div className="dk-jadwal-nama">{sch.dokter?.nama ?? '–'}</div>
                            <div className="dk-jadwal-meta">
                              {sch.jam_mulai?.substring(0, 5)} – {sch.jam_selesai?.substring(0, 5)}
                              <span className="dk-jadwal-sep">·</span>
                              {/* Kapasitas {sch.kapasitas} */}
                            </div>
                          </div>
                          <div className="dk-aksi">
                            <button className="dk-btn-edit" onClick={() => editJadwal(sch)}>Edit</button>
                            <button className="dk-btn-hapus" onClick={() => setDeleteJadwalTarget(sch)}>Hapus</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* PER DOKTER */}
              {viewMode === 'dokter' && Object.keys(groupedByDoctor).map(doc => (
                <div key={doc} className="dk-jadwal-card">
                  <div className="dk-jadwal-card-header">
                    <span className="dk-jadwal-day">{doc}</span>
                    <span className="dk-jadwal-count">{groupedByDoctor[doc].length} jadwal</span>
                  </div>
                  <div className="dk-jadwal-list">
                    {groupedByDoctor[doc].map((sch) => (
                      <div key={sch.id} className="dk-jadwal-item">
                        <div className="dk-jadwal-info">
                          <div className="dk-jadwal-nama">{sch.hari}</div>
                          <div className="dk-jadwal-meta">
                            {sch.jam_mulai?.substring(0, 5)} – {sch.jam_selesai?.substring(0, 5)}
                            <span className="dk-jadwal-sep">·</span>
                            {/* Kapasitas {sch.kapasitas} */}
                          </div>
                        </div>
                        <div className="dk-aksi">
                          <button className="dk-btn-edit" onClick={() => editJadwal(sch)}>Edit</button>
                          <button className="dk-btn-hapus" onClick={() => setDeleteJadwalTarget(sch)}>Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          )}
        </>
      )}

      {/* ── MODAL FORM DOKTER ── */}
      <AdminCrudModal
        open={showForm}
        title={editingId ? 'Edit Dokter' : 'Tambah Dokter Baru'}
        onClose={cancelForm}
      >
        <div className="dk-modal-body">
          <div className="dk-modal-heading">
            <p className="dk-modal-kategori">Data Dokter</p>
            <h2 className="dk-modal-title">{editingId ? 'Edit Dokter' : 'Tambah Dokter Baru'}</h2>
          </div>

          {submitError && <div className="dk-alert-error">{submitError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="dk-form-grid">
              <div className="dk-form-group">
                <label className="dk-form-label">Nama lengkap <span>*</span></label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange} required maxLength={255} placeholder="dr. Budi Santoso" />
                {renderError('nama')}
              </div>
              <div className="dk-form-group">
                <label className="dk-form-label">Spesialisasi <span>*</span></label>
                <input type="text" name="spesialisasi" value={formData.spesialisasi} onChange={handleChange} required maxLength={100} placeholder="Umum / Gigi..." />
                {renderError('spesialisasi')}
              </div>
              <div className="dk-form-group">
                <label className="dk-form-label">No. telepon <span>*</span></label>
                <input type="text" name="no_telepon" value={formData.no_telepon} onChange={handleChange} required maxLength={20} placeholder="08xx..." />
                {renderError('no_telepon')}
              </div>
              <div className="dk-form-group">
                <label className="dk-form-label">Hari libur</label>
                <select name="hari_libur" value={formData.hari_libur} onChange={handleChange}>
                  <option value="">Tidak ada</option>
                  {HARI_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                {renderError('hari_libur')}
              </div>
              <div className="dk-form-group">
                <label className="dk-form-label">Status <span>*</span></label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  <option value="">Pilih status</option>
                  <option value="1">Aktif</option>
                  <option value="0">Tidak aktif</option>
                </select>
                {renderError('status')}
              </div>
            </div>

            {!editingId && (
              <>
                <hr className="dk-form-divider" />
                <p className="dk-form-section-label">Informasi identitas & jadwal</p>
                <div className="dk-form-grid">
                  <div className="dk-form-group">
                    <label className="dk-form-label">No. identitas <span>*</span></label>
                    <input type="text" name="no_identitas" value={formData.no_identitas} onChange={handleChange} required maxLength={50} />
                    {renderError('no_identitas')}
                  </div>
                  <div className="dk-form-group">
                    <label className="dk-form-label">No. lisensi <span>*</span></label>
                    <input type="text" name="no_lisensi" value={formData.no_lisensi} onChange={handleChange} required maxLength={50} />
                    {renderError('no_lisensi')}
                  </div>
                  <div className="dk-form-group">
                    <label className="dk-form-label">Email <span>*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required maxLength={255} />
                    {renderError('email')}
                  </div>
                  <div className="dk-form-group">
                    <label className="dk-form-label">Alamat <span>*</span></label>
                    <input type="text" name="alamat" value={formData.alamat} onChange={handleChange} required maxLength={500} />
                    {renderError('alamat')}
                  </div>
                  <div className="dk-form-group">
                    <label className="dk-form-label">Jam praktek mulai <span>*</span></label>
                    <input type="time" name="jam_praktek_mulai" value={formData.jam_praktek_mulai} onChange={handleChange} required />
                    {renderError('jam_praktek_mulai')}
                  </div>
                  <div className="dk-form-group">
                    <label className="dk-form-label">Jam praktek selesai <span>*</span></label>
                    <input type="time" name="jam_praktek_selesai" value={formData.jam_praktek_selesai} onChange={handleChange} required />
                    {renderError('jam_praktek_selesai')}
                  </div>
                </div>
              </>
            )}

            <div className="dk-form-actions">
              <button type="submit" className="dk-btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Simpan'}
              </button>
              <button type="button" className="dk-btn-secondary" onClick={cancelForm}>Batal</button>
            </div>
          </form>
        </div>
      </AdminCrudModal>

      {/* ── MODAL FORM JADWAL ── */}
      <AdminCrudModal
        open={showJadwalForm}
        title={editingJadwalId ? 'Edit Jadwal' : 'Tambah Jadwal'}
        onClose={cancelJadwalForm}
      >
        <div className="dk-modal-body">
          <div className="dk-modal-heading">
            <p className="dk-modal-kategori">Jadwal Kerja</p>
            <h2 className="dk-modal-title">{editingJadwalId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
          </div>

          {jadwalSubmitError && <div className="dk-alert-error">{jadwalSubmitError}</div>}

          <form onSubmit={handleJadwalSubmit}>
            <div className="dk-form-group" style={{ marginBottom: 16 }}>
              <label className="dk-form-label">Dokter <span>*</span></label>
              <select name="dokter_id" value={jadwalForm.dokter_id} onChange={handleJadwalChange} required>
                <option value="">Pilih dokter</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
              {renderJadwalError('dokter_id')}
            </div>

            <div className="dk-form-group" style={{ marginBottom: 16 }}>
              <label className="dk-form-label">Hari <span>*</span></label>
              <div className="dk-hari-grid">
                {HARI_OPTIONS.map(day => {
                  const selected = jadwalForm.hari === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`dk-hari-btn ${selected ? 'dk-hari-btn-active' : ''}`}
                      onClick={() => {
                        setJadwalForm(f => ({ ...f, hari: day }));
                        setJadwalErrors(p => ({ ...p, hari: null }));
                      }}
                    >
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
              {renderJadwalError('hari')}
            </div>

            <div className="dk-form-grid" style={{ marginBottom: 16 }}>
              <div className="dk-form-group">
                <label className="dk-form-label">Jam mulai <span>*</span></label>
                <input type="time" name="jam_mulai" value={jadwalForm.jam_mulai} onChange={handleJadwalChange} required />
                {renderJadwalError('jam_mulai')}
              </div>
              <div className="dk-form-group">
                <label className="dk-form-label">Jam selesai <span>*</span></label>
                <input type="time" name="jam_selesai" value={jadwalForm.jam_selesai} onChange={handleJadwalChange} required />
                {renderJadwalError('jam_selesai')}
              </div>
            </div>

            <div className="dk-form-actions">
              <button type="submit" className="dk-btn-primary" disabled={jadwalSubmitLoading}>
                {jadwalSubmitLoading ? 'Menyimpan...' : editingJadwalId ? 'Update Jadwal' : 'Simpan Jadwal'}
              </button>
              <button type="button" className="dk-btn-secondary" onClick={cancelJadwalForm} disabled={jadwalSubmitLoading}>
                Batal
              </button>
            </div>
          </form>
        </div>
      </AdminCrudModal>

      {/* ── MODAL HAPUS DOKTER ── */}
      <AdminCrudModal
        open={Boolean(deleteTarget)}
        title="Hapus Dokter"
        onClose={() => setDeleteTarget(null)}
        size="sm"
      >
        <div className="dk-modal-body">
          <p className="dk-confirm-text">
            Hapus data dokter <strong>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="dk-form-actions">
            <button type="button" className="dk-btn-danger" onClick={deleteDoctor} disabled={deleteLoading}>
              {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
            <button type="button" className="dk-btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
              Batal
            </button>
          </div>
        </div>
      </AdminCrudModal>

      {/* ── MODAL HAPUS JADWAL ── */}
      <AdminCrudModal
        open={Boolean(deleteJadwalTarget)}
        title="Hapus Jadwal"
        onClose={() => setDeleteJadwalTarget(null)}
        size="sm"
      >
        <div className="dk-modal-body">
          <p className="dk-confirm-text">
            Hapus jadwal <strong>{deleteJadwalTarget?.dokter?.nama}</strong> hari <strong>{deleteJadwalTarget?.hari}</strong>?
          </p>
          <div className="dk-form-actions">
            <button type="button" className="dk-btn-danger" onClick={deleteJadwal}>Ya, Hapus</button>
            <button type="button" className="dk-btn-secondary" onClick={() => setDeleteJadwalTarget(null)}>Batal</button>
          </div>
        </div>
      </AdminCrudModal>

    </AdminLayout>
  );
}