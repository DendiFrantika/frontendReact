import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminCrudModal from '../../components/AdminCrudModal';
import axiosInstance from '../../api/axios';
import './Pendaftaran.css';

const STATUS_LABELS = {
  pending:    { label: 'Pending',      color: '#b45309', bg: '#fef3c7' },
  confirmed:  { label: 'Dikonfirmasi', color: '#1d4ed8', bg: '#dbeafe' },
  checked_in: { label: 'Check-in',     color: '#6d28d9', bg: '#ede9fe' },
  completed:  { label: 'Selesai',      color: '#065f46', bg: '#d1fae5' },
  cancelled:  { label: 'Dibatalkan',   color: '#991b1b', bg: '#fee2e2' },
};

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] ?? { label: status, color: '#374151', bg: '#f3f4f6' };
  return (
    <span className="pnd-badge" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
}

export default function Pendaftaran() {
  const [list, setList]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate]   = useState('');
  const [notice, setNotice]           = useState('');
  const [error, setError]             = useState('');

  const [detail, setDetail]                   = useState(null);
  const [detailLoading, setDetailLoading]     = useState(false);
  const [verifyTarget, setVerifyTarget]       = useState(null);
  const [verifyStatus, setVerifyStatus]       = useState('confirmed');
  const [verifyLoading, setVerifyLoading]     = useState(false);

  /* ── fetch utama — params langsung dari state, bukan dari deps memoized ── */
  const fetchList = useCallback(async (status = '', date = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (status) params.status            = status;
      if (date)   params.tanggal_pendaftaran = date;   // sesuai kolom di Laravel

      const res = await axiosInstance.get('/admin/pendaftaran', { params });
      setList(unwrap(res.data));
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memuat data pendaftaran.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── jalankan fetch setiap kali filter berubah ── */
  useEffect(() => {
    fetchList(filterStatus, filterDate);
  }, [fetchList, filterStatus, filterDate]);

  /* ── handler filter ── */
  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleFilterDate = (e) => {
    setFilterDate(e.target.value);
  };

  const handleReset = () => {
    setFilterStatus('');
    setFilterDate('');
  };

  /* ── detail ── */
  const handleDetail = async (id) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await axiosInstance.get(`/admin/pendaftaran/${id}`);
      setDetail(res.data?.data ?? res.data);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memuat detail.');
    } finally {
      setDetailLoading(false);
    }
  };

  /* ── verifikasi ── */
  const handleVerify = async () => {
    if (!verifyTarget) return;
    setVerifyLoading(true);
    try {
      await axiosInstance.post(`/admin/pendaftaran/${verifyTarget.id}/verifikasi`, {
        status: verifyStatus,
      });
      setVerifyTarget(null);
      setNotice(`Pendaftaran berhasil di-${verifyStatus === 'confirmed' ? 'konfirmasi' : 'tolak'}.`);
      fetchList(filterStatus, filterDate);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memverifikasi pendaftaran.');
    } finally {
      setVerifyLoading(false);
    }
  };

  /* ── update status ── */
  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/pendaftaran/${id}`, { status });
      setNotice('Status berhasil diperbarui.');
      fetchList(filterStatus, filterDate);
      if (detail?.id === id) handleDetail(id);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memperbarui status.');
    }
  };

  /* ── batalkan ── */
  const handleCancel = async (id) => {
    if (!window.confirm('Batalkan pendaftaran ini?')) return;
    try {
      await axiosInstance.delete(`/admin/pendaftaran/${id}`);
      setNotice('Pendaftaran dibatalkan.');
      fetchList(filterStatus, filterDate);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal membatalkan pendaftaran.');
    }
  };

  const hasActiveFilter = filterStatus || filterDate;

  return (
    <AdminLayout title="">

      {/* ── PAGE HEADER ── */}
      <div className="pnd-page-header">
        <div>
          <h1 className="pnd-page-title">Pendaftaran</h1>
          <p className="pnd-page-sub">Kelola dan verifikasi data pendaftaran pasien</p>
        </div>
      </div>

      {/* ── NOTICE / ERROR ── */}
      {notice && (
        <div className="pnd-notice">{notice}</div>
      )}
      {error && (
        <div className="pnd-error">{error}</div>
      )}

      {/* ── TOOLBAR ── */}
      <div className="pnd-toolbar">
        <div className="pnd-toolbar-left">
          <div className="pnd-filter-group">
            <label className="pnd-filter-label">Status</label>
            <select
              className="pnd-select"
              value={filterStatus}
              onChange={handleFilterStatus}
            >
              <option value="">Semua Status</option>
              {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="pnd-filter-group">
            <label className="pnd-filter-label">Tanggal</label>
            <input
              type="date"
              className="pnd-input-date"
              value={filterDate}
              onChange={handleFilterDate}
            />
          </div>

          {hasActiveFilter && (
            <button className="pnd-btn-reset" onClick={handleReset}>
              Reset filter
            </button>
          )}
        </div>

        <div className="pnd-toolbar-right">
          <span className="pnd-count">
            {loading ? '...' : `${list.length} pendaftaran`}
          </span>
        </div>
      </div>

      {/* ── TABEL ── */}
      {loading ? (
        <div className="pnd-loading">Memuat data pendaftaran...</div>
      ) : (
        <div className="pnd-table-wrap">
          <table className="pnd-table">
            <thead>
              <tr>
                <th>No</th>
                <th>No. Antrian</th>
                <th>Pasien</th>
                <th>Dokter</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Keluhan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="pnd-empty">
                      {hasActiveFilter
                        ? 'Tidak ada data untuk filter yang dipilih'
                        : 'Belum ada data pendaftaran'}
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((item, i) => (
                  <tr key={item.id}>
                    <td className="pnd-td-num">{i + 1}</td>
                    <td className="pnd-td-antrian">{item.no_antrian ?? '-'}</td>
                    <td>{item.pasien?.nama ?? item.pasien_id}</td>
                    <td>{item.dokter?.nama ?? item.dokter_id}</td>
                    <td className="pnd-td-nowrap">{item.tanggal_pendaftaran}</td>
                    <td className="pnd-td-nowrap">{item.jam_kunjungan}</td>
                    <td className="pnd-td-keluhan">{item.keluhan ?? '-'}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <div className="pnd-aksi">
                        <button
                          className="pnd-btn-detail"
                          onClick={() => handleDetail(item.id)}
                        >
                          Detail
                        </button>

                        {item.status === 'pending' && (
                          <button
                            className="pnd-btn-action pnd-action-blue"
                            onClick={() => { setVerifyTarget(item); setVerifyStatus('confirmed'); }}
                          >
                            Verifikasi
                          </button>
                        )}
                        {item.status === 'confirmed' && (
                          <button
                            className="pnd-btn-action pnd-action-purple"
                            onClick={() => handleUpdateStatus(item.id, 'checked_in')}
                          >
                            Check-in
                          </button>
                        )}
                        {item.status === 'checked_in' && (
                          <button
                            className="pnd-btn-action pnd-action-green"
                            onClick={() => handleUpdateStatus(item.id, 'completed')}
                          >
                            Selesai
                          </button>
                        )}
                        {!['completed', 'cancelled'].includes(item.status) && (
                          <button
                            className="pnd-btn-action pnd-action-red"
                            onClick={() => handleCancel(item.id)}
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL DETAIL ── */}
      <AdminCrudModal
        open={detailLoading || Boolean(detail)}
        title="Detail Pendaftaran"
        onClose={() => setDetail(null)}
      >
        {detailLoading ? (
          <div className="pnd-loading">Memuat detail...</div>
        ) : detail ? (
          <div className="pnd-modal-body">
            <div className="pnd-modal-heading">
              <p className="pnd-modal-kategori">Pendaftaran</p>
              <h2 className="pnd-modal-title">Detail Pendaftaran</h2>
            </div>

            <div className="pnd-detail-grid">
              {[
                ['No. Antrian',   detail.no_antrian],
                ['Status',        <StatusBadge status={detail.status} />],
                ['Pasien',        detail.pasien?.nama ?? detail.pasien_id],
                ['Dokter',        detail.dokter?.nama ?? detail.dokter_id],
                ['Tanggal',       detail.tanggal_pendaftaran],
                ['Jam',           detail.jam_kunjungan],
                ['Keluhan',       detail.keluhan],
                ['Jadwal Dokter', detail.jadwal_dokter?.hari ?? detail.jadwal_dokter_id],
              ].map(([label, val]) => (
                <div key={label} className="pnd-detail-row">
                  <span className="pnd-detail-label">{label}</span>
                  <span className="pnd-detail-val">{val ?? '-'}</span>
                </div>
              ))}
            </div>

            {detail.rekam_medis && (
              <div className="pnd-rekam-medis">
                <p className="pnd-rekam-title">Rekam Medis</p>
                <div className="pnd-detail-row">
                  <span className="pnd-detail-label">Diagnosis</span>
                  <span className="pnd-detail-val">{detail.rekam_medis.diagnosis ?? '-'}</span>
                </div>
                <div className="pnd-detail-row">
                  <span className="pnd-detail-label">Catatan</span>
                  <span className="pnd-detail-val">{detail.rekam_medis.catatan ?? '-'}</span>
                </div>
              </div>
            )}

            <div className="pnd-modal-actions">
              <button className="pnd-btn-secondary" onClick={() => setDetail(null)}>Tutup</button>
            </div>
          </div>
        ) : null}
      </AdminCrudModal>

      {/* ── MODAL VERIFIKASI ── */}
      <AdminCrudModal
        open={Boolean(verifyTarget)}
        title="Verifikasi Pendaftaran"
        onClose={() => setVerifyTarget(null)}
        size="sm"
      >
        {verifyTarget && (
          <div className="pnd-modal-body">
            <div className="pnd-modal-heading">
              <p className="pnd-modal-kategori">Tindakan</p>
              <h2 className="pnd-modal-title">Verifikasi Pendaftaran</h2>
            </div>

            <div className="pnd-detail-grid" style={{ marginBottom: 16 }}>
              <div className="pnd-detail-row">
                <span className="pnd-detail-label">Pasien</span>
                <span className="pnd-detail-val">{verifyTarget.pasien?.nama ?? verifyTarget.pasien_id}</span>
              </div>
              <div className="pnd-detail-row">
                <span className="pnd-detail-label">No. Antrian</span>
                <span className="pnd-detail-val">{verifyTarget.no_antrian}</span>
              </div>
            </div>

            <div className="pnd-form-group">
              <label className="pnd-form-label">Keputusan <span>*</span></label>
              <select
                className="pnd-select"
                value={verifyStatus}
                onChange={(e) => setVerifyStatus(e.target.value)}
              >
                <option value="confirmed">Konfirmasi</option>
                <option value="rejected">Tolak</option>
              </select>
            </div>

            <div className="pnd-modal-actions">
              <button
                className="pnd-btn-primary"
                onClick={handleVerify}
                disabled={verifyLoading}
              >
                {verifyLoading ? 'Memproses...' : 'Simpan'}
              </button>
              <button
                className="pnd-btn-secondary"
                onClick={() => setVerifyTarget(null)}
                disabled={verifyLoading}
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </AdminCrudModal>

    </AdminLayout>
  );
}