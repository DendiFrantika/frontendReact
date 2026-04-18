import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminCrudModal from '../../components/AdminCrudModal';
import {
  normalizeErrorMessage,
  normalizeFieldErrors,
  requestWithFallback,
  unpackCollection,
} from '../../services/adminCrudApi';
import { validateJadwalForm } from '../../services/adminMasterValidation';

export default function Jadwal() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');

  // Sesuaikan field dengan validasi Laravel
  const [formData, setFormData] = useState({
    dokter_id: '',
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    kapasitas: 10 // Default kapasitas
  });

  // inisialisasi data jadwal & dokter saat halaman pertama kali dibuka
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

 const fetchDoctors = async () => {
    try {
      const res = await requestWithFallback([
        { method: 'get', url: '/admin/dokter' },
        { method: 'get', url: '/dokter' },
      ]);
      setDoctors(unpackCollection(res.data));
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await requestWithFallback([
        { method: 'get', url: '/admin/jadwal' },
        { method: 'get', url: '/jadwal' },
      ]);
      setSchedules(unpackCollection(res.data));
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});
    const clientErrors = validateJadwalForm(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    const payload = {
      dokter_id: Number(formData.dokter_id),
      hari: formData.hari,
      jam_mulai: formData.jam_mulai,
      jam_selesai: formData.jam_selesai,
      kapasitas: Number(formData.kapasitas),
    };
    setSubmitLoading(true);
    try {
      if (editingId) {
        await requestWithFallback([
          { method: 'put', url: `/admin/jadwal/${editingId}`, data: payload },
          { method: 'put', url: `/jadwal/${editingId}`, data: payload },
        ]);
      } else {
        await requestWithFallback([
          { method: 'post', url: '/admin/jadwal', data: payload },
          { method: 'post', url: '/jadwal', data: payload },
        ]);
      }
      await fetchSchedules();
      cancelForm();
      setNotice(editingId ? 'Jadwal berhasil diperbarui.' : 'Jadwal berhasil ditambahkan.');
    } catch (err) {
      const fieldErrors = normalizeFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setSubmitError(normalizeErrorMessage(err, 'Gagal menyimpan jadwal.'));
      console.error('Error saving schedule:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const editSchedule = (sch) => {
    setEditingId(sch.id);
    setFormData({
      dokter_id: sch.dokter_id,
      hari: sch.hari,
      jam_mulai: String(sch.jam_mulai || '').substring(0, 5),
      jam_selesai: String(sch.jam_selesai || '').substring(0, 5),
      kapasitas: sch.kapasitas
    });
    setErrors({});
    setSubmitError('');
    setShowForm(true);
  };

  const deleteSchedule = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      await requestWithFallback([
        { method: 'delete', url: `/admin/jadwal/${deleteTarget.id}` },
        { method: 'delete', url: `/jadwal/${deleteTarget.id}` },
      ]);
      await fetchSchedules();
      setDeleteTarget(null);
      setNotice('Jadwal berhasil dihapus.');
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setSubmitError('Gagal menghapus jadwal.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ dokter_id: '', hari: '', jam_mulai: '', jam_selesai: '', kapasitas: 10 });
    setErrors({});
    setSubmitError('');
  };

  return (
    <AdminLayout title="Manajemen Jadwal">
      <button className="btn" onClick={() => setShowForm(true)}>Tambah Jadwal</button>
      {notice ? <p>{notice}</p> : null}

      <AdminCrudModal
        open={showForm}
        title={editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}
        onClose={cancelForm}
      >
        <form className="form" onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
          {submitError ? <p className="form-error">{submitError}</p> : null}
          <div className="form-group">
            <label>Dokter</label>
            <select name="dokter_id" value={formData.dokter_id} onChange={handleChange} required>
              <option value="">-- Pilih dokter --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.nama}</option>
              ))}
            </select>
            {errors.dokter_id ? <small className="form-error">{errors.dokter_id[0]}</small> : null}
          </div>
          
          <div className="form-group">
            <label>Hari</label>
            <select name="hari" value={formData.hari} onChange={handleChange} required>
              <option value="">-- Pilih Hari --</option>
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            {errors.hari ? <small className="form-error">{errors.hari[0]}</small> : null}
          </div>

          <div className="form-group">
            <label>Mulai</label>
            <input type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleChange} required />
            {errors.jam_mulai ? <small className="form-error">{errors.jam_mulai[0]}</small> : null}
          </div>

          <div className="form-group">
            <label>Selesai</label>
            <input type="time" name="jam_selesai" value={formData.jam_selesai} onChange={handleChange} required />
            {errors.jam_selesai ? <small className="form-error">{errors.jam_selesai[0]}</small> : null}
          </div>

          <div className="form-group">
            <label>Kapasitas</label>
            <input type="number" name="kapasitas" value={formData.kapasitas} onChange={handleChange} required min="1" max="500" />
            {errors.kapasitas ? <small className="form-error">{errors.kapasitas[0]}</small> : null}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={submitLoading}>
              {submitLoading ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Simpan'}
            </button>
            <button type="button" className="btn" onClick={cancelForm} disabled={submitLoading}>Batal</button>
          </div>
        </form>
      </AdminCrudModal>

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
                  <button className="btn small danger" onClick={() => setDeleteTarget(sch)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AdminCrudModal
        open={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Jadwal"
        onClose={() => setDeleteTarget(null)}
        size="sm"
      >
        <p>
          Hapus jadwal untuk <strong>{deleteTarget?.dokter?.nama || 'dokter ini'}</strong>?
        </p>
        <div className="form-actions">
          <button type="button" className="btn small danger" onClick={deleteSchedule} disabled={deleteLoading}>
            {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
          <button type="button" className="btn" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
            Batal
          </button>
        </div>
      </AdminCrudModal>
    </AdminLayout>
  );
}