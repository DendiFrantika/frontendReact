import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import '../admin/Dashboard.css';
import './pasien-pages.css';
import { unwrapList, normalizeHistoryRow } from './pasien-helpers';
import { Link } from 'react-router-dom';

export default function Riwayat() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    setError(null);
    try {
      let res = null;
      let lastError = null;
      for (const url of [
        '/pasien/appointments',
        '/pasien/riwayat',
        '/riwayat',
        '/pasien/history',
      ]) {
        try {
          res = await axiosInstance.get(url);
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (!res) throw lastError;
      const list = unwrapList(res.data).map(normalizeHistoryRow);
      setHistory(list);
    } catch (err) {
      console.error('Error fetching history', err);
      setHistory([]);
      setError(
        err.response?.data?.message ??
          'Gagal memuat riwayat. Silakan coba lagi.'
      );
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await fetchHistory();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const selesaiCount = history.filter((item) => String(item.status).toLowerCase().includes('selesai')).length;
  const latestVisit = history[0]?.date || 'Belum ada';

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <header className="pasien-page-header">
          <h1>Riwayat berobat</h1>
          <p>Riwayat kunjungan dan status pemeriksaan</p>
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
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
          <div className="pasien-banner pasien-banner--error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Memuat riwayat…</div>
        ) : history.length > 0 ? (
          <div className="pasien-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Dokter</th>
                  <th>Spesialis</th>
                  <th>Keluhan</th>
                  <th>Diagnosis</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.date}</td>
                    <td>{h.doctorName}</td>
                    <td>{h.specialty}</td>
                    <td>{h.complaint}</td>
                    <td>{h.diagnosis}</td>
                    <td>
                      <span className="pasien-status">{h.status}</span>
                    </td>
                  </tr>
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
