import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import '../admin/Dashboard.css';
import './pasien-pages.css';
import { unwrapList, normalizeDoctor, normalizeSchedule } from './pasien-helpers';

function getNextDateForDay(namaHari) {
  const hariMap = {
    'minggu': 0, 'senin': 1, 'selasa': 2, 'rabu': 3,
    'kamis': 4, 'jumat': 5, 'sabtu': 6,
  };
  const target = hariMap[namaHari?.toLowerCase()];
  if (target === undefined) return null;

  const today = new Date();
  const todayDay = today.getDay();
  let diff = target - todayDay;
  if (diff <= 0) diff += 7;

  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result.toISOString().split('T')[0];
}

export default function DaftarBerobat() {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [pasienId, setPasienId] = useState(null); // ✅ state pasienId
  const [formData, setFormData] = useState({ doctorId: '', scheduleId: '', keluhan: '' });
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
    const fetchPasienId = async () => {
      try {
        const res = await axiosInstance.get('/pasien/profile');
        const data = res.data?.data ?? res.data;
        console.log('Profile response:', data); // ← lihat struktur, tentukan field yang benar
        const id = data?.id ?? data?.pasien_id ?? null;
        setPasienId(id);
      } catch (err) {
        console.error('Gagal ambil pasien id:', err);
      }
    };
    fetchPasienId();
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

    let payload = null;

    try {
      const jadwal_id = Number(formData.scheduleId);

      const selectedSchedule = schedules.find(
        (s) => Number(s.id) === jadwal_id
      );

      if (!selectedSchedule) {
        throw new Error('Jadwal tidak ditemukan');
      }

      if (!pasienId) {
        setBanner({ type: 'error', text: 'Data pasien tidak ditemukan. Silakan login ulang.' });
        setSaving(false);
        return;
      }

      const namaHari = selectedSchedule.label.split('·')[0].trim();
      const tanggalOtomatis = getNextDateForDay(namaHari);
      const jamFormatted = selectedSchedule.jam?.slice(0, 5);

      payload = {
        pasien_id: pasienId,
        dokter_id: Number(formData.doctorId),
        jadwal_dokter_id: jadwal_id,
        tanggal_pendaftaran: tanggalOtomatis,
        jam_kunjungan: jamFormatted,
        keluhan: formData.keluhan || 'Konsultasi umum',
      };

      if (!payload.tanggal_pendaftaran || !payload.jam_kunjungan) {
        setBanner({
          type: 'error',
          text: 'Tidak dapat menentukan tanggal/jam jadwal. Hubungi admin.',
        });
        setSaving(false);
        return;
      }

      console.log('Payload:', payload);

      await axiosInstance.post('/pasien/daftar', payload);

      setBanner({
        type: 'success',
        text: 'Pendaftaran berhasil. Lihat antrian di menu Antrian.',
      });

      setFormData({ doctorId: '', scheduleId: '', keluhan: '' });
      setSchedules([]);

    } catch (err) {
      console.error('ERROR detail:', JSON.stringify(err.response?.data, null, 2));
      console.error('Payload yang dikirim:', payload);
      setBanner({
        type: 'error',
        text:
          err.response?.data?.message ||
          JSON.stringify(err.response?.data?.errors) ||
          'Pendaftaran gagal',
      });
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

            <div className="form-group">
              <label htmlFor="keluhan">Keluhan</label>
              <input
                id="keluhan"
                name="keluhan"
                type="text"
                placeholder="Konsultasi umum"
                value={formData.keluhan}
                onChange={handleChange}
                disabled={saving}
              />
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