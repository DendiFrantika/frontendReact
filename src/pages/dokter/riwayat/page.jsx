import React, { useState, useEffect } from 'react';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

export default function Riwayat() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      let response = null;
      let lastError = null;
      for (const url of ['/dokter/riwayat', '/riwayat', '/dokter/history']) {
        try {
          response = await axiosInstance.get(url);
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (!response) throw lastError;
      const raw = response.data;
      const rows = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setHistory(rows);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistory([]);
      setError(err?.response?.data?.message || 'Gagal memuat riwayat pemeriksaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DokterLayout title="Riwayat Pemeriksaan">
      {loading ? (
        <p>Memuat riwayat...</p>
      ) : error ? (
        <div className="pasien-banner pasien-banner--error" role="alert">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="pasien-empty">Belum ada data riwayat pemeriksaan.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Pasien</th>
              <th>Diagnosis</th>
              <th>Pengobatan</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{item.date || item.tanggal || item.visit_date || '-'}</td>
                <td>{item.patientName || item.patient_name || item.pasien?.nama || '-'}</td>
                <td>{item.diagnosis || item.keterangan || '-'}</td>
                <td>{item.treatment || item.tindakan || item.resep || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DokterLayout>
  );
}
