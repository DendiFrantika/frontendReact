import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import '../admin/Dashboard.css';
import './pasien-pages.css';
import { Link } from 'react-router-dom';

const normalizeHistory = (item) => ({
  id:             item.id,
  dateDaftar:     item.tanggal_pendaftaran ?? null,
  dateKunjungan:  item.rekam_medis?.tanggal_kunjungan ?? null,
  time:           item.jam_kunjungan?.substring(0, 5) ?? '-',
  doctorName:     item.dokter?.nama ?? '-',
  specialty:      item.dokter?.spesialisasi ?? '-',
  complaint:      item.keluhan ?? '-',
  status:         item.status ?? '-',
  noAntrian:      item.no_antrian ?? '-',
  diagnosis:      item.rekam_medis?.diagnosis ?? null,
  tindakan:       item.rekam_medis?.tindakan ?? null,
  catatan:        item.rekam_medis?.catatan_dokter ?? null,
});

const STATUS_COLOR = {
  completed:   { background: '#dcfce7', color: '#166534' },
  checked_in:  { background: '#dbeafe', color: '#1e40af' },
  cancelled:   { background: '#fee2e2', color: '#991b1b' },
  pending:     { background: '#fef9c3', color: '#854d0e' },
  waiting:     { background: '#f1f5f9', color: '#475569' },
  in_progress: { background: '#fde8d8', color: '#9a3412' },
};

const STATUS_LABEL = {
  completed:   'Selesai',
  checked_in:  'Check-in',
  cancelled:   'Dibatalkan',
  pending:     'Menunggu',
  waiting:     'Antrian',
  in_progress: 'Dalam Pemeriksaan',
};

const fmtDate = (iso, opts = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', opts) : '-';

export default function Riwayat() {
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded,   setExpanded]   = useState(null);

  const fetchHistory = useCallback(async () => {
    setError(null);
    try {
      const res = await axiosInstance.get('/pasien/appointments');
      const raw = res.data?.data ?? res.data ?? [];
      setHistory(raw.map(normalizeHistory));
    } catch (err) {
      console.error('Error fetching history', err);
      setHistory([]);
      setError(err.response?.data?.message ?? 'Gagal memuat riwayat. Silakan coba lagi.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchHistory();
      setLoading(false);
    })();
  }, [fetchHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const selesaiCount = history.filter(h => h.status === 'completed').length;
  const latestVisit  = history[0]?.dateDaftar
    ? fmtDate(history[0].dateDaftar, { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Belum ada';

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">

        <header className="pasien-page-header">
          <h1>Riwayat Berobat</h1>
          <p>Riwayat kunjungan dan rekam medis singkat</p>
        </header>


        {/* ── Statistik ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          <div className="pasien-table-wrap" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Total kunjungan</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{history.length}</div>
          </div>
          <div className="pasien-table-wrap" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Selesai diperiksa</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{selesaiCount}</div>
          </div>
          <div className="pasien-table-wrap" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Kunjungan terakhir</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{latestVisit}</div>
          </div>
        </div>

        {error && (
          <div className="pasien-banner pasien-banner--error" role="alert">{error}</div>
        )}

        {loading ? (
          <div className="loading">Memuat riwayat…</div>
        ) : history.length > 0 ? (
          
            <div className="pasien-table-container">
  <table className="pasien-table">
    <thead>
      <tr>
        <th>Tanggal & Jam</th>
        <th>Antrian</th>
        <th>Informasi Dokter</th>
        <th>Keluhan</th>
        <th>Status</th>
        <th className="text-center">Rekam Medis</th>
      </tr>
    </thead>
    <tbody>
      {history.map((h) => (
        <React.Fragment key={h.id}>
          {/* Baris Utama */}
          <tr className={expanded === h.id ? 'row-active' : ''}>
            <td>
              <div className="font-bold">{fmtDate(h.dateDaftar)}</div>
              <div className="text-muted">{h.time} WIB</div>
            </td>
            <td>
              <span className="badge-antrian">#{h.noAntrian}</span>
            </td>
            <td>
              <div className="font-bold">{h.doctorName}</div>
              <div className="text-muted">{h.specialty}</div>
            </td>
            <td className="cell-complaint">
              {h.complaint}
            </td>
            <td>
              <span 
                className="status-badge" 
                style={{
                  backgroundColor: (STATUS_COLOR[h.status] ?? STATUS_COLOR.waiting).background,
                  color: (STATUS_COLOR[h.status] ?? STATUS_COLOR.waiting).color
                }}
              >
                {STATUS_LABEL[h.status] ?? h.status}
              </span>
            </td>
            <td className="text-center">
              {h.diagnosis ? (
                <button
                  type="button"
                  className={`btn-toggle ${expanded === h.id ? 'active' : ''}`}
                  onClick={() => setExpanded(expanded === h.id ? null : h.id)}
                >
                  {expanded === h.id ? '▲ Tutup' : '▼ Lihat Detail'}
                </button>
              ) : (
                <span className="text-disabled italic">Belum tersedia</span>
              )}
            </td>
          </tr>

          {/* Baris Detail (Rekam Medis) */}
          {expanded === h.id && (
            <tr className="detail-row">
              <td colSpan={6}>
                <div className="detail-container">
                  <div className="detail-header">
                    <span className="icon">📋</span>
                    <strong>Ringkasan Rekam Medis</strong>
                    {h.dateKunjungan && (
                      <span className="visit-tag">Kunjungan: {fmtDate(h.dateKunjungan, true)}</span>
                    )}
                  </div>
                  
                  <div className="detail-grid">
                    <div className="detail-card">
                      <label>Diagnosis</label>
                      <p>{h.diagnosis}</p>
                    </div>
                    <div className="detail-card">
                      <label>Tindakan</label>
                      <p>{h.tindakan || '-'}</p>
                    </div>
                    {h.catatan && (
                      <div className="detail-card">
                        <label>Catatan Dokter</label>
                        <p>{h.catatan}</p>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </tbody>
  </table>
</div>
          
        ) : (
          <div className="pasien-empty">
            <strong style={{ display: 'block', marginBottom: '8px', color: '#334155' }}>
              Belum ada riwayat berobat.
            </strong>
            <p style={{ margin: '0 0 10px' }}>
              Setelah kunjungan pertama selesai, riwayat pemeriksaan akan muncul di sini.
            </p>
            <Link to="/pasien/daftar-berobat">Buat pendaftaran baru</Link>
          </div>
        )}

      </div>
    </div>
  );
}