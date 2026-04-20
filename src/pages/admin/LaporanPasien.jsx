import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import laporanService from '../../services/laporan-service';

const initialFilters = {
  tanggal_mulai: '',
  tanggal_akhir: '',
  jenis_kelamin: '',
  status_pernikahan: '',
  search: '',
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const LaporanPasien = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [laporan, setLaporan] = useState([]);
  const [summary, setSummary] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await laporanService.getPatientReport(params);
      setLaporan(response.data || []);
      setSummary(response.summary || null);
      setTotal(response.total || 0);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data laporan pasien. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    setExporting(true);
    setError('');

    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const fileData = await laporanService.exportPatientPdf({ ...params, tipe: 'pasien' });
      downloadBlob(fileData, 'laporan-pasien.pdf');
    } catch (err) {
      console.error(err);
      setError('Gagal mengekspor laporan pasien ke PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout title="Laporan Pasien">
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Ringkasan Laporan</h2>
          <Link to="/admin/laporan" className="view-all">Kembali ke semua laporan →</Link>
        </div>

        <p>Gunakan filter di bawah ini untuk melihat laporan pasien berdasarkan periode, jenis kelamin, status pernikahan, dan pencarian.</p>

        <div className="form">
          <div className="form-group">
            <label htmlFor="tanggal_mulai">Tanggal Mulai</label>
            <input
              id="tanggal_mulai"
              name="tanggal_mulai"
              type="date"
              value={filters.tanggal_mulai}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tanggal_akhir">Tanggal Akhir</label>
            <input
              id="tanggal_akhir"
              name="tanggal_akhir"
              type="date"
              value={filters.tanggal_akhir}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="jenis_kelamin">Jenis Kelamin</label>
            <select
              id="jenis_kelamin"
              name="jenis_kelamin"
              value={filters.jenis_kelamin}
              onChange={handleChange}
            >
              <option value="">Semua</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status_pernikahan">Status Pernikahan</label>
            <select
              id="status_pernikahan"
              name="status_pernikahan"
              value={filters.status_pernikahan}
              onChange={handleChange}
            >
              <option value="">Semua</option>
              <option value="Belum Menikah">Belum Menikah</option>
              <option value="Menikah">Menikah</option>
              <option value="Duda">Duda</option>
              <option value="Janda">Janda</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="search">Cari</label>
            <input
              id="search"
              name="search"
              type="search"
              placeholder="Nama, NIK, No. pendaftaran, email, telepon"
              value={filters.search}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={fetchLaporan}>
              Terapkan Filter
            </button>
            <button type="button" className="btn" onClick={handleExportPdf} disabled={exporting}>
              {exporting ? 'Mengekspor PDF…' : 'Export PDF'}
            </button>
            <button type="button" className="btn danger" onClick={resetFilters}>
              Reset Filter
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="dashboard-section" style={{ padding: '20px 0 0 0', boxShadow: 'none', background: 'transparent' }}>
          <div className="stats-grid" style={{ gap: '16px', marginBottom: '20px' }}>
            <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total Pasien</h3>
                <p className="stat-value">{total.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#2ecc71' }}>
              <div className="stat-icon">📆</div>
              <div className="stat-info">
                <h3>Pasien Baru Hari Ini</h3>
                <p className="stat-value">{summary?.pasien_baru_hari_ini ?? 0}</p>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#9b59b6' }}>
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>Pasien Baru Bulan Ini</h3>
                <p className="stat-value">{summary?.pasien_baru_bulan_ini ?? 0}</p>
              </div>
            </div>
          </div>

          {summary?.jenis_kelamin ? (
            <div className="dashboard-section" style={{ padding: '20px', marginBottom: '20px' }}>
              <h3>Distribusi Jenis Kelamin</h3>
              <div className="activity-list">
                {summary.jenis_kelamin.map((item) => (
                  <div key={item.jenis_kelamin || item.label} className="activity-item" style={{ background: '#fff' }}>
                    <span className="activity-icon">🧾</span>
                    <div className="activity-info">
                      <p>{item.jenis_kelamin || 'Lainnya'}</p>
                      <span className="time">Total: {item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="dashboard-section">
            <h2>Hasil Laporan Pasien</h2>
            {loading ? (
              <p>Memuat data laporan...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table-report" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>No. Identitas</th>
                      <th>No. Pendaftaran</th>
                      <th>Email</th>
                      <th>Telepon</th>
                      <th>Jenis Kelamin</th>
                      <th>Status Pernikahan</th>
                      <th>Pendaftaran</th>
                      <th>Rekam Medis</th>
                      <th>Dibuat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporan.length > 0 ? (
                      laporan.map((item) => (
                        <tr key={item.id || item.no_identitas || item.no_telepon}>
                          <td>{item.nama || '-'}</td>
                          <td>{item.no_identitas || '-'}</td>
                          <td>{item.no_pendaftaran || '-'}</td>
                          <td>{item.email || '-'}</td>
                          <td>{item.no_telepon || '-'}</td>
                          <td>{item.jenis_kelamin || '-'}</td>
                          <td>{item.status_pernikahan || '-'}</td>
                          <td>{item.pendaftaran_count ?? item.pendaftaran?.length ?? 0}</td>
                          <td>{item.rekam_medis_count ?? item.rekam_medis?.length ?? 0}</td>
                          <td>{formatDate(item.created_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '24px' }}>
                          Tidak ada data pasien yang sesuai filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LaporanPasien;
