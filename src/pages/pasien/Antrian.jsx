import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import '../admin/Dashboard.css';
import './pasien-pages.css';

const STATUS_LABELS = {
  pending:    { label: 'Menunggu Konfirmasi', color: '#b45309', bg: '#fef3c7' },
  confirmed:  { label: 'Dikonfirmasi',        color: '#1d4ed8', bg: '#dbeafe' },
  checked_in: { label: 'Sedang Dilayani',     color: '#6d28d9', bg: '#ede9fe' },
  completed:  { label: 'Selesai',             color: '#065f46', bg: '#d1fae5' },
  cancelled:  { label: 'Dibatalkan',          color: '#991b1b', bg: '#fee2e2' },
};

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] ?? { label: status, color: '#374151', bg: '#f3f4f6' };
  return (
    <span className="pasien-status" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

export default function Antrian() {
  const [antrian, setAntrian] = useState(null); // objek tunggal, bukan array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAntrian = useCallback(async () => {
    setError(null);
    try {
      const res = await axiosInstance.get('/pasien/antrian');
      // Backend mengembalikan { data: {...} } atau objek langsung
      const data = res.data?.data ?? res.data;
      setAntrian(data?.id ? data : null);
    } catch (err) {
      // 404 = tidak ada antrian aktif, bukan error
      if (err.response?.status === 404) {
        setAntrian(null);
      } else {
        console.error('Error fetching antrian', err);
        setError(err.response?.data?.message ?? 'Gagal memuat antrian. Silakan coba lagi.');
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await fetchAntrian();
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [fetchAntrian]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAntrian();
    setRefreshing(false);
  };

  // Ambil nama dokter dari nested object
  const namaDokter = antrian?.dokter?.nama
    ?? antrian?.dokter?.name
    ?? antrian?.dokter_id
    ?? '—';

  // Ambil info jadwal
  const jadwal = antrian?.jadwal_dokter;
  const hariJadwal = jadwal?.hari ?? jadwal?.day ?? '';
  const jamJadwal  = antrian?.jam_kunjungan ?? jadwal?.jam_mulai ?? '—';

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <header className="pasien-page-header">
          <h1>Antrian</h1>
          <p>Status antrian kunjungan Anda</p>
        </header>

        {error && (
          <div className="pasien-banner pasien-banner--error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Memuat antrian…</div>
        ) : antrian ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>

            {/* Kartu nomor antrian */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 12,
              padding: '24px 28px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600, marginBottom: 4 }}>
                Nomor Antrian
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#1d4ed8', letterSpacing: 2 }}>
                {antrian.no_antrian ?? '—'}
              </div>
              <div style={{ marginTop: 12 }}>
                <StatusBadge status={antrian.status} />
              </div>
            </div>

            {/* Detail kunjungan */}
            <div style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              fontSize: 14,
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Detail Kunjungan</div>
              {[
                ['Dokter',   namaDokter],
                ['Tanggal',  antrian.tanggal_pendaftaran ?? '—'],
                ['Jam',      `${hariJadwal ? hariJadwal + ' · ' : ''}${jamJadwal}`],
                ['Keluhan',  antrian.keluhan ?? '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ minWidth: 80, color: '#6b7280', fontWeight: 600 }}>{label}</span>
                  <span style={{ color: '#111827' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Petunjuk berdasarkan status */}
            {antrian.status === 'pending' && (
              <div className="pasien-banner pasien-banner--info" role="status" style={{ margin: 0 }}>
                Pendaftaran Anda sedang menunggu konfirmasi dari petugas.
              </div>
            )}
            {antrian.status === 'confirmed' && (
              <div className="pasien-banner pasien-banner--success" role="status" style={{ margin: 0 }}>
                Pendaftaran dikonfirmasi. Harap datang sesuai jadwal dan lakukan check-in di loket.
              </div>
            )}
            {antrian.status === 'checked_in' && (
              <div className="pasien-banner pasien-banner--success" role="status" style={{ margin: 0 }}>
                Anda sedang dalam proses pelayanan. Silakan menunggu dipanggil oleh dokter.
              </div>
            )}
          </div>
        ) : (
          <div className="pasien-empty">
            Anda tidak memiliki antrian aktif saat ini.
          </div>
        )}
      </div>
    </div>
  );
}