import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import './pasien-pages.css'; // Pastikan CSS terbaru sudah di-update
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
  const [pasienId, setPasienId] = useState(null);
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
      setError('Gagal memuat daftar dokter.');
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  useEffect(() => {
    const fetchPasienId = async () => {
      try {
        const res = await axiosInstance.get('/pasien/profile');
        const data = res.data?.data ?? res.data;
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
    try {
      const res = await axiosInstance.get(`/pasien/dokter/${id}/jadwal`);
      const list = unwrapList(res.data)
        .map((s, i) => normalizeSchedule(s, i))
        .filter((s) => s.id);
      setSchedules(list);
      if (!list.length) {
        setBanner({ type: 'error', text: 'Dokter ini belum memiliki jadwal tersedia.' });
      }
    } catch (err) {
      setError('Gagal memuat jadwal dokter.');
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
    setSaving(true);
    try {
      const selectedSchedule = schedules.find(s => String(s.id) === String(formData.scheduleId));
      if (!selectedSchedule || !pasienId) throw new Error('Data tidak lengkap');

      const namaHari = selectedSchedule.label.split('·')[0].trim();
      const payload = {
        pasien_id: pasienId,
        dokter_id: Number(formData.doctorId),
        jadwal_dokter_id: Number(formData.scheduleId),
        tanggal_pendaftaran: getNextDateForDay(namaHari),
        jam_kunjungan: selectedSchedule.jam?.slice(0, 5),
        keluhan: formData.keluhan || 'Konsultasi umum',
      };

      await axiosInstance.post('/pasien/daftar', payload);
      setBanner({ type: 'success', text: 'Pendaftaran berhasil dikirim!' });
      setFormData({ doctorId: '', scheduleId: '', keluhan: '' });
      setSchedules([]);
    } catch (err) {
      setBanner({ type: 'error', text: err.response?.data?.message || 'Pendaftaran gagal.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <header className="pasien-page-header">
          <h1>Daftar Berobat</h1>
          <p>Silakan lengkapi formulir pendaftaran di bawah ini.</p>
        </header>

        {/* Notifikasi Banner */}
        {banner && (
          <div className={`pasien-banner pasien-banner--${banner.type}`}>
            <span>{banner.text}</span>
            {banner.type === 'success' && <Link to="/pasien/appointments">Lihat Jadwal Saya →</Link>}
          </div>
        )}

        {loadingDoctors ? (
          <div className="loading">Memuat data dokter...</div>
        ) : (
          <div className="pasien-form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="doctorId">Pilih Dokter</label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleDoctorChange}
                  required
                  disabled={saving}
                >
                  <option value="">— Pilih dokter spesialis —</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="scheduleId">Jadwal Tersedia</label>
                <select
                  id="scheduleId"
                  name="scheduleId"
                  value={formData.scheduleId}
                  onChange={handleChange}
                  required
                  disabled={saving || !formData.doctorId || loadingSchedules}
                >
                  <option value="">
                    {loadingSchedules ? 'Sedang memuat jadwal...' : '— Pilih hari & jam —'}
                  </option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="keluhan">Keluhan Utama</label>
                <input
                  id="keluhan"
                  name="keluhan"
                  type="text"
                  placeholder="Contoh: Batuk berdahak sejak 2 hari lalu"
                  value={formData.keluhan}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={saving || !formData.scheduleId}
              >
                {saving ? 'Memproses...' : 'Kirim Pendaftaran'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}