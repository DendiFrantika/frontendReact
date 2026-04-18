import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import '../admin/Dashboard.css';
import './pasien-pages.css';
import { unwrapList, normalizeQueueRow } from './pasien-helpers';

export default function Antrian() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQueue = useCallback(async () => {
    setError(null);
    try {
      const res = await axiosInstance.get('/pasien/antrian');
      const list = unwrapList(res.data).map(normalizeQueueRow);
      setQueue(list);
    } catch (err) {
      console.error('Error fetching queue', err);
      setQueue([]);
      setError(
        err.response?.data?.message ??
          'Gagal memuat antrian. Silakan coba lagi.'
      );
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await fetchQueue();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchQueue]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQueue();
    setRefreshing(false);
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <header className="pasien-page-header">
          <h1>Antrian</h1>
          <p>Status antrian kunjungan Anda</p>
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

        {error && (
          <div className="pasien-banner pasien-banner--error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Memuat daftar antrian…</div>
        ) : queue.length > 0 ? (
          <div className="pasien-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nama dokter</th>
                  <th>Waktu</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q, idx) => (
                  <tr key={q.id}>
                    <td>{idx + 1}</td>
                    <td>{q.doctorName}</td>
                    <td>{q.time}</td>
                    <td>
                      <span className="pasien-status">{q.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="pasien-empty">Belum ada data antrian.</div>
        )}
      </div>
    </div>
  );
}
