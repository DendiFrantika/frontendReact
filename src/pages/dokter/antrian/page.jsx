import React, { useState, useEffect } from 'react';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

export default function Antrian() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/dokter/antrian');
      setQueue(res.data);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/dokter/antrian/${id}`, { status });
      fetchQueue();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <DokterLayout title="Antrian Pasien">
      {loading ? (
        <p>Memuat antrian...</p>
      ) : (
        <div className="queue-list">
          {queue.length > 0 ? (
            queue.map((item) => (
              <div key={item.id} className="queue-item">
                <div className="patient-info">
                  <h3>{item.patientName}</h3>
                  <p>Waktu: {new Date(item.appointmentTime).toLocaleString()}</p>
                  <p>Status: {item.status}</p>
                </div>
                <div className="actions">
                  {item.status === 'waiting' && (
                    <>
                      <button
                        className="btn primary"
                        onClick={() => updateStatus(item.id, 'in_progress')}
                      >
                        Mulai Pemeriksaan
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => updateStatus(item.id, 'cancelled')}
                      >
                        Batal
                      </button>
                    </>
                  )}
                  {item.status === 'in_progress' && (
                    <button
                      className="btn success"
                      onClick={() => updateStatus(item.id, 'completed')}
                    >
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>Tidak ada antrian saat ini.</p>
          )}
        </div>
      )}
    </DokterLayout>
  );
}
