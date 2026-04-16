import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';

export default function Antrian(){
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/pasien/antrian');
        setQueue(res.data);
      } catch (err) {
        console.error('Error fetching queue', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  let content;
  if (loading) {
    content = <p>Memuat daftar antrian...</p>;
  } else if (queue.length > 0) {
    content = (
      <table className="table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Dokter</th>
            <th>Waktu</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((q, idx) => (
            <tr key={q.id || idx}>
              <td>{idx + 1}</td>
              <td>{q.doctorName}</td>
              <td>{q.time}</td>
              <td>{q.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    content = <p>Tidak ada antrian.</p>;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Antrian</h1>
        {content}
      </div>
    </div>
  );
}
