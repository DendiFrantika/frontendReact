import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';

export default function Riwayat(){
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/pasien/riwayat');
        setHistory(res.data);
      } catch (err) {
        console.error('Error fetching history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Riwayat Berobat</h1>
        {loading && <p>Memuat riwayat...</p>}
        {!loading && history.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Dokter</th>
                <th>Spesialis</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td>{h.date}</td>
                  <td>{h.doctorName}</td>
                  <td>{h.specialty}</td>
                  <td>{h.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && history.length === 0 && <p>Tidak ada riwayat.</p>}
      </div>
    </div>
  );
}
