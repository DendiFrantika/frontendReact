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

        <div className="pasien-toolbar">
          <button
            type="button"
            className="btn small"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            {refreshing ? 'Memuat…' : 'Segarkan'}
          </button>
        </div>

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
          <div className="pasien-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tgl. Daftar</th>
                  <th>No. Antrian</th>
                  <th>Dokter</th>
                  <th>Spesialis</th>
                  <th>Keluhan</th>
                  <th>Status</th>
                  <th>Rekam Medis</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <React.Fragment key={h.id}>

                    {/* ── Baris utama ── */}
                    <tr>
                      <td>
                        <div>{fmtDate(h.dateDaftar)}</div>
                        {h.time !== '-' && (
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{h.time}</div>
                        )}
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>{h.noAntrian}</td>
                      <td>{h.doctorName}</td>
                      <td>{h.specialty}</td>
                      <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.complaint}
                      </td>
                      <td>
                        <span style={{
                          ...(STATUS_COLOR[h.status] ?? STATUS_COLOR.waiting),
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          {STATUS_LABEL[h.status] ?? h.status}
                        </span>
                      </td>
                      <td>
                        {h.diagnosis ? (
                          <button
                            type="button"
                            onClick={() => setExpanded(expanded === h.id ? null : h.id)}
                            style={{
                              background: expanded === h.id ? '#eff6ff' : 'none',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#475569',
                            }}
                          >
                            {expanded === h.id ? '▲ Tutup' : '▼ Lihat'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Belum ada</span>
                        )}
                      </td>
                    </tr>

                    {/* ── Baris detail rekam medis ── */}
                    {expanded === h.id && (
                      <tr style={{ background: '#f8fafc' }}>
                        <td colSpan={7} style={{ padding: '16px 20px' }}>

                          {/* Header detail */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                              📋 Rekam Medis Singkat
                            </span>
                            {h.dateKunjungan && (
                              <span style={{ fontSize: '12px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '999px' }}>
                                Diperiksa: {fmtDate(h.dateKunjungan, { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                            )}
                            {h.dateDaftar && (
                              <span style={{ fontSize: '12px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '999px' }}>
                                Tgl. Daftar: {fmtDate(h.dateDaftar, { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                            )}
                          </div>

                          {/* Grid detail */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.05em' }}>
                                DIAGNOSIS
                              </div>
                              <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                                {h.diagnosis}
                              </div>
                            </div>

                            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.05em' }}>
                                TINDAKAN
                              </div>
                              <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                                {h.tindakan ?? '-'}
                              </div>
                            </div>

                            {h.catatan && (
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.05em' }}>
                                  CATATAN DOKTER
                                </div>
                                <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                                  {h.catatan}
                                </div>
                              </div>
                            )}
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