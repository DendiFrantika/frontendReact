import React, { useState, useEffect } from 'react';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

export default function Riwayat() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/dokter/riwayat');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DokterLayout title="Riwayat Pemeriksaan">
      {loading ? (
        <p>Memuat riwayat...</p>
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
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.patientName}</td>
                <td>{item.diagnosis}</td>
                <td>{item.treatment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DokterLayout>
  );
}
