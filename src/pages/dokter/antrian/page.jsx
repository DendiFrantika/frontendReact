import React, { useState, useEffect, useCallback } from 'react'; // ✅ tambah useCallback
import { useNavigate } from 'react-router-dom'; // ✅ tambah useNavigate
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext'; // ✅ sesuaikan path auth context kamu

export default function Antrian() {
  const { user } = useAuth(); // ✅ ambil user dari context
  const navigate = useNavigate(); // ✅ sekarang bisa dipakai

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');       // ✅ tambah state error
  const [updating, setUpdating] = useState(null); // ✅ tambah state updating

  const dokterId = user?.id;

  const fetchQueue = useCallback(async () => {
    if (!dokterId) {
      setError('Informasi dokter tidak tersedia. Silakan login ulang.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/dokter/antrian');
      setQueue(res.data);
    } catch (err) {
      console.error('Error fetching queue:', err);
      setError('Gagal memuat antrian.');
    } finally {
      setLoading(false);
    }
  }, [dokterId]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await axiosInstance.put(`/dokter/pendaftaran/${id}/status`, { status });
      setQueue(prev =>
        prev
          .map(item => item.id === id ? { ...item, status } : item)
          .filter(item => item.status === 'checked_in')
      );
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(null); // ✅ reset setelah selesai
    }
  };

  return (
    <DokterLayout title="Antrian Pasien">
      {error && <p className="error-text">{error}</p>} {/* ✅ tampilkan error */}
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
                        disabled={updating === item.id} // ✅ disable saat loading
                      >
                        Mulai Pemeriksaan
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => updateStatus(item.id, 'cancelled')}
                        disabled={updating === item.id}
                      >
                        Batal
                      </button>
                    </>
                  )}
                  {item.status === 'in_progress' && (
                    <button
                      className="btn success"
                      onClick={() => updateStatus(item.id, 'completed')}
                      disabled={updating === item.id}
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