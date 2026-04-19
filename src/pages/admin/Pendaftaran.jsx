import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminCrudModal from '../../components/AdminCrudModal';
import axiosInstance from '../../api/axios';

const STATUS_LABELS = {
  pending:    { label: 'Pending',     color: '#b45309', bg: '#fef3c7' },
  confirmed:  { label: 'Dikonfirmasi', color: '#1d4ed8', bg: '#dbeafe' },
  checked_in: { label: 'Check-in',    color: '#6d28d9', bg: '#ede9fe' },
  completed:  { label: 'Selesai',     color: '#065f46', bg: '#d1fae5' },
  cancelled:  { label: 'Dibatalkan',  color: '#991b1b', bg: '#fee2e2' },
};

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] ?? { label: status, color: '#374151', bg: '#f3f4f6' };
  return (
    <span style={{
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      whiteSpace: 'nowrap',
    }}>
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
  const [list, setList]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [notice, setNotice]         = useState('');
  const [error, setError]           = useState('');

  // Detail modal
  const [detail, setDetail]         = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Verifikasi modal
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('confirmed');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate)   params.tanggal = filterDate;
      const res = await axiosInstance.get('/admin/pendaftaran', { params });
      setList(unwrap(res.data));
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memuat data pendaftaran.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDate]);

  useEffect(() => { fetchList(); }, [fetchList]);

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

  const handleVerify = async () => {
    if (!verifyTarget) return;
    setVerifyLoading(true);
    try {
      await axiosInstance.post(`/admin/pendaftaran/${verifyTarget.id}/verifikasi`, {
        status: verifyStatus,
      });
      setVerifyTarget(null);
      setNotice(`Pendaftaran berhasil di-${verifyStatus === 'confirmed' ? 'konfirmasi' : 'tolak'}.`);
      fetchList();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memverifikasi pendaftaran.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/pendaftaran/${id}`, { status });
      setNotice('Status berhasil diperbarui.');
      fetchList();
      if (detail?.id === id) handleDetail(id);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memperbarui status.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Batalkan pendaftaran ini?')) return;
    try {
      await axiosInstance.delete(`/admin/pendaftaran/${id}`);
      setNotice('Pendaftaran dibatalkan.');
      fetchList();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal membatalkan pendaftaran.');
    }
  };

  return (
    <AdminLayout title="Pendaftaran">
      <div style={{ padding: '0 0 32px' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Filter Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
            >
              <option value="">Semua Status</option>
              {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Filter Tanggal</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
            />
          </div>
          <button
            onClick={() => { setFilterStatus(''); setFilterDate(''); }}
            style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', fontSize: 14, cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>

        {notice && (
          <div style={{ padding: '10px 16px', background: '#d1fae5', color: '#065f46', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {notice}
          </div>
        )}
        {error && (
          <div style={{ padding: '10px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Tabel */}
        {loading ? (
          <p style={{ color: '#6b7280' }}>Memuat data pendaftaran…</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['No', 'No. Antrian', 'Pasien', 'Dokter', 'Tanggal', 'Jam', 'Keluhan', 'Status', 'Aksi'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
                      Tidak ada data pendaftaran
                    </td>
                  </tr>
                ) : list.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{i + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.no_antrian ?? '-'}</td>
                    <td style={{ padding: '10px 12px' }}>{item.pasien?.nama ?? item.pasien_id}</td>
                    <td style={{ padding: '10px 12px' }}>{item.dokter?.nama ?? item.dokter_id}</td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.tanggal_pendaftaran}</td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.jam_kunjungan}</td>
                    <td style={{ padding: '10px 12px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.keluhan}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleDetail(item.id)}
                          style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #d1d5db', background: '#f9fafb', fontSize: 12, cursor: 'pointer' }}
                        >
                          Detail
                        </button>
                        {item.status === 'pending' && (
                          <button
                            onClick={() => { setVerifyTarget(item); setVerifyStatus('confirmed'); }}
                            style={{ padding: '4px 10px', borderRadius: 5, border: 'none', background: '#dbeafe', color: '#1d4ed8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Verifikasi
                          </button>
                        )}
                        {item.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'checked_in')}
                            style={{ padding: '4px 10px', borderRadius: 5, border: 'none', background: '#ede9fe', color: '#6d28d9', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Check-in
                          </button>
                        )}
                        {item.status === 'checked_in' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'completed')}
                            style={{ padding: '4px 10px', borderRadius: 5, border: 'none', background: '#d1fae5', color: '#065f46', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Selesai
                          </button>
                        )}
                        {!['completed', 'cancelled'].includes(item.status) && (
                          <button
                            onClick={() => handleCancel(item.id)}
                            style={{ padding: '4px 10px', borderRadius: 5, border: 'none', background: '#fee2e2', color: '#991b1b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      <AdminCrudModal
        open={detailLoading || Boolean(detail)}
        title="Detail Pendaftaran"
        onClose={() => setDetail(null)}
      >
        {detailLoading ? (
          <p style={{ color: '#6b7280' }}>Memuat detail…</p>
        ) : detail ? (
          <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              <div key={label} style={{ display: 'flex', gap: 8 }}>
                <span style={{ minWidth: 130, color: '#6b7280', fontWeight: 600 }}>{label}</span>
                <span>{val ?? '-'}</span>
              </div>
            ))}
            {detail.rekam_medis && (
              <div style={{ marginTop: 8, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Rekam Medis</div>
                <div><span style={{ color: '#6b7280' }}>Diagnosis: </span>{detail.rekam_medis.diagnosis ?? '-'}</div>
                <div><span style={{ color: '#6b7280' }}>Catatan: </span>{detail.rekam_medis.catatan ?? '-'}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => setDetail(null)}
                style={{ padding: '7px 18px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer' }}
              >
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </AdminCrudModal>

      {/* Modal Verifikasi */}
      <AdminCrudModal
        open={Boolean(verifyTarget)}
        title="Verifikasi Pendaftaran"
        onClose={() => setVerifyTarget(null)}
        size="sm"
      >
        {verifyTarget && (
          <div style={{ fontSize: 14 }}>
            <p>
              Pasien: <strong>{verifyTarget.pasien?.nama ?? verifyTarget.pasien_id}</strong><br />
              No. Antrian: <strong>{verifyTarget.no_antrian}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
              <label style={{ fontWeight: 600, color: '#374151' }}>Keputusan</label>
              <select
                value={verifyStatus}
                onChange={(e) => setVerifyStatus(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
              >
                <option value="confirmed">Konfirmasi</option>
                <option value="rejected">Tolak</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleVerify}
                disabled={verifyLoading}
                style={{ padding: '7px 18px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                {verifyLoading ? 'Memproses…' : 'Simpan'}
              </button>
              <button
                onClick={() => setVerifyTarget(null)}
                disabled={verifyLoading}
                style={{ padding: '7px 18px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer' }}
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