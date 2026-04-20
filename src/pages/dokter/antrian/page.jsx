import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import './Antrian.css';

const STATUS_CONFIG = {
  pending:    { label: 'Menunggu',     badge: 'warning' },
  confirmed:  { label: 'Dikonfirmasi', badge: 'info'    },
  checked_in: { label: 'Hadir',        badge: 'info'    },
  completed:  { label: 'Selesai',      badge: 'success' },
  cancelled:  { label: 'Dibatalkan',   badge: 'danger'  },
};

export default function Antrian() {
  const { user } = useAuth();

  const [queue,    setQueue]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error,    setError]    = useState('');

  const dokterId = user?.id;
  const navigate = useNavigate();

  // ── Fetch: GET /dokter/pendaftaran/dokter/{dokter_id} ────────────────────
  // Memanggil PendaftaranController@getByDokter
  const fetchQueue = useCallback(async (pageNum = 1) => {
    if (!dokterId) {
      setError('Informasi dokter tidak tersedia. Silakan login ulang.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/dokter/pendaftaran/dokter/${dokterId}`, {
        params: { page: pageNum, status: 'checked_in' },
      });

      // Response paginate() Laravel: { data:[...], current_page, last_page }
      const payload = res.data;
      const items   = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload) ? payload : [];

      const checkedInItems = items.filter(item => item.status === 'checked_in');
      setQueue(checkedInItems);
      setLastPage(payload.last_page    ?? 1);
      setPage(payload.current_page ?? pageNum);
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message;
      setError(msg ? `Gagal memuat antrian: ${msg}` : 'Gagal memuat data antrian.');
    } finally {
      setLoading(false);
    }
  }, [dokterId]);

  useEffect(() => { fetchQueue(1); }, [fetchQueue]);

  // ── Update status: PUT /dokter/pendaftaran/{id}/status ───────────────────
  // Memanggil PendaftaranController@updateStatusDokter
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
      const msg = err?.response?.data?.message ?? err?.message;
      alert(msg ? `Gagal memperbarui status: ${msg}` : 'Gagal memperbarui status.');
    } finally {
      setUpdating(null);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const checkedInCount = queue.length;
  const formatTanggal = v => v
    ? new Date(v).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '-';

  return (
    <DokterLayout title="Antrian Pasien">

      {/* ── Summary Cards ── */}
      <div className="antrian-summary">
        <div className="summary-card checked_in">
          <span className="summary-num">{checkedInCount}</span>
          <span className="summary-label">Check-in Siap Selesai</span>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="antrian-error">
          <span>⚠️ {error}</span>
          <button onClick={() => fetchQueue(page)}>Coba Lagi</button>
        </div>
      )}

      {/* ── Loading / Empty / List ── */}
      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Memuat data antrian...</p>
        </div>

      ) : queue.length === 0 ? (
        <div className="antrian-empty">
          <div className="empty-icon">🗂️</div>
          <p>Tidak ada pasien dengan status check-in saat ini.</p>
        </div>

      ) : (
        <>
          <div className="queue-list">
            {queue.map((item, index) => {
              const st         = STATUS_CONFIG[item.status] ?? { label: item.status, badge: 'neutral' };
              const isUpdating = updating === item.id;

              // Relasi eager-loaded: with(['pasien', 'jadwalDokter'])
              const namaPasien = item.pasien?.nama ?? item.pasien?.name ?? 'Pasien';
              const noRM       = item.pasien?.no_rm ?? null;
              const jadwal     = item.jadwal_dokter ?? item.jadwalDokter ?? null;

              return (
                <div key={item.id} className={`queue-item ${isUpdating ? 'updating' : ''}`}>

                  {/* no_antrian dari model Pendaftaran */}
                  <div className="queue-number">
                    <span className="no-antrian">{item.no_antrian ?? `#${index + 1}`}</span>
                  </div>

                  {/* Data dari tabel pendaftarans */}
                  <div className="patient-info">
                    <h3>{namaPasien}</h3>

                    {noRM && (
                      <p className="info-row">
                        <span>🪪</span>
                        <span>No. RM: {noRM}</span>
                      </p>
                    )}

                    {/* tanggal_pendaftaran — cast: date */}
                    <p className="info-row">
                      <span>📅</span>
                      <span>{formatTanggal(item.tanggal_pendaftaran)}</span>
                    </p>

                    {/* jam_kunjungan */}
                    <p className="info-row">
                      <span>🕐</span>
                      <span>Jam: {item.jam_kunjungan ?? '-'}</span>
                    </p>

                    {/* keluhan */}
                    {item.keluhan && (
                      <p className="info-row keluhan">
                        <span>📋</span>
                        <span>Keluhan: {item.keluhan}</span>
                      </p>
                    )}

                    {/* jadwal_dokter_id → relasi jadwalDokter */}
                    {jadwal && (
                      <p className="info-row">
                        <span>🏥</span>
                        <span>{jadwal.hari} · {jadwal.jam_mulai}–{jadwal.jam_selesai}</span>
                      </p>
                    )}
                  </div>

                  {/* Status + Aksi */}
                  <div className="queue-right">
                    <span className={`badge ${st.badge}`}>{st.label}</span>

                    <div className="actions">
                      {isUpdating && <span className="updating-text">Memperbarui...</span>}

                      {/* pending → confirmed atau cancelled */}
                      {!isUpdating && item.status === 'pending' && (
                        <>
                          <button className="btn small primary"
                            onClick={() => updateStatus(item.id, 'confirmed')}>
                            ✓ Konfirmasi
                          </button>
                          <button className="btn small danger"
                            onClick={() => updateStatus(item.id, 'cancelled')}>
                            ✕ Batal
                          </button>
                        </>
                      )}

                      {/* confirmed → checked_in atau cancelled */}
                      {!isUpdating && item.status === 'confirmed' && (
                        <>
                          <button className="btn small primary"
                            onClick={() => updateStatus(item.id, 'checked_in')}>
                            👤 Check-in
                          </button>
                          <button className="btn small danger"
                            onClick={() => updateStatus(item.id, 'cancelled')}>
                            ✕ Batal
                          </button>
                        </>
                      )}

                      {/* checked_in → completed */}
                      {!isUpdating && item.status === 'checked_in' && (
                        <>
                          <button className="btn small outline"
                            onClick={() => {
                              const pasienId = item.pasien?.id ?? item.pasien_id;
                              if (pasienId) {
                                navigate(`/dokter/diagnosis?pasienId=${pasienId}`);
                              } else {
                                alert('ID pasien tidak tersedia untuk diagnosis.');
                              }
                            }}>
                            🩺 Diagnosis
                          </button>
                          <button className="btn small success"
                            onClick={() => updateStatus(item.id, 'completed')}>
                            ✓ Selesai
                          </button>
                        </>
                      )}

                      {/* completed — read only */}
                      {!isUpdating && item.status === 'completed' && (
                        <span className="done-text">✅ Selesai</span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="pagination">
              <button className="btn small outline"
                disabled={page <= 1}
                onClick={() => fetchQueue(page - 1)}>
                ← Sebelumnya
              </button>
              <span className="page-info">Halaman {page} / {lastPage}</span>
              <button className="btn small outline"
                disabled={page >= lastPage}
                onClick={() => fetchQueue(page + 1)}>
                Berikutnya →
              </button>
            </div>
          )}
        </>
      )}

    </DokterLayout>
  );
}