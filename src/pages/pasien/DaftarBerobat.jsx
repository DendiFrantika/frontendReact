import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import '../admin/Dashboard.css';
import './pasien-pages.css';
import { unwrapList, normalizeDoctor, normalizeSchedule } from './pasien-helpers';

export default function DaftarBerobat() {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({ doctorId: '', scheduleId: '' });
  const [saving, setSaving] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState(null);

  const loadDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/pasien/dokters');
      const list = unwrapList(res.data).map(normalizeDoctor).filter((d) => d.id);
      setDoctors(list);
    } catch (err) {
      console.error('Error fetching doctors', err);
      setDoctors([]);
      setError(
        err.response?.data?.message ??
          'Gagal memuat daftar dokter. Pastikan Anda sudah login sebagai pasien.'
      );
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleDoctorChange = async (e) => {
    const id = e.target.value;
    setFormData((prev) => ({ ...prev, doctorId: id, scheduleId: '' }));
    setBanner(null);
    if (!id) {
      setSchedules([]);
      return;
    }
    setLoadingSchedules(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/pasien/dokter/${id}/jadwal`);
      const list = unwrapList(res.data)
        .filter((s) => {
          const dokterId = String(s?.dokter_id ?? s?.doctor_id ?? s?.dokter?.id ?? '');
          return !dokterId || dokterId === String(id);
        })
        .map((s, i) => normalizeSchedule(s, i))
        .filter((s) => s.id);
      setSchedules(list);
      if (!list.length) {
        setBanner({
          type: 'error',
          text: 'Dokter ini belum memiliki jadwal yang tersedia.',
        });
      }
    } catch (err) {
      console.error('Error fetching schedules', err);
      setSchedules([]);
      setError(
        err.response?.data?.message ?? 'Gagal memuat jadwal untuk dokter ini.'
      );
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    setSaving(true);
    try {
      const dokter_id = Number(formData.doctorId);
      const jadwal_id = Number(formData.scheduleId);
      await axiosInstance.post('/pasien/daftar', {
        dokter_id,
        jadwal_id,
      });
      setBanner({ type: 'success', text: 'Pendaftaran berhasil. Lihat antrian di menu Antrian.' });
      setFormData({ doctorId: '', scheduleId: '' });
      setSchedules([]);
    } catch (err) {
      console.error('Error creating appointment', err);
      const msg =
        err.response?.data?.message ??
        (typeof err.response?.data === 'string'
          ? err.response.data
          : 'Pendaftaran gagal. Periksa data dan coba lagi.');
      setBanner({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <header className="pasien-page-header">
          <h1>Daftar berobat</h1>
          <p>Pilih dokter dan jadwal kunjungan</p>
        </header>

        {error && (
          <div className="pasien-banner pasien-banner--error" role="alert">
            {error}
          </div>
        )}

        {banner && (
          <div
            className={`pasien-banner pasien-banner--${banner.type === 'success' ? 'success' : 'error'}`}
            role="status"
          >
            {banner.text}{' '}
            {banner.type === 'success' && (
              <Link to="/pasien/antrian">Buka antrian</Link>
            )}
          </div>
        )}

        {loadingDoctors ? (
          <div className="loading">Memuat daftar dokter…</div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="doctorId">Dokter</label>
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleDoctorChange}
                required
                disabled={saving || !doctors.length}
              >
                <option value="">— Pilih dokter —</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="scheduleId">Jadwal</label>
              <select
                id="scheduleId"
                name="scheduleId"
                value={formData.scheduleId}
                onChange={handleChange}
                required
                disabled={
                  saving || !formData.doctorId || !schedules.length || loadingSchedules
                }
              >
                <option value="">
                  {loadingSchedules
                    ? 'Memuat jadwal…'
                    : formData.doctorId
                      ? '— Pilih jadwal —'
                      : 'Pilih dokter terlebih dahulu'}
                </option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn primary"
                disabled={
                  saving ||
                  !formData.doctorId ||
                  !formData.scheduleId ||
                  loadingSchedules
                }
              >
                {saving ? 'Mendaftar…' : 'Kirim pendaftaran'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
