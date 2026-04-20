import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import laporanService from '../../services/laporan-service';
import dokterService from '../../services/dokter-service';
import pasienService from '../../services/pasien-service';

const initialFilters = {
  tanggal_mulai: '',
  tanggal_akhir: '',
  dokter_id: '',
  pasien_id: '',
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

const LaporanRekamMedis = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [laporan, setLaporan] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [error, setError] = useState('');

  const fetchOptions = useCallback(async () => {
    try {
      const [dokterRes, pasienRes] = await Promise.all([
        dokterService.getAll(),
        pasienService.getAll(),
      ]);
      setDoctors(Array.isArray(dokterRes) ? dokterRes : dokterRes.data || []);
      setPatients(Array.isArray(pasienRes) ? pasienRes : pasienRes.data || []);
    } catch (err) {
      console.error('Gagal memuat daftar dokter atau pasien', err);
    }
  }, []);

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await laporanService.getMedicalRecordReport(params);
      setLaporan(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil laporan rekam medis. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOptions();
    fetchLaporan();
  }, [fetchOptions, fetchLaporan]);

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

      const fileData = await laporanService.exportMedicalRecordPdf(params);
      downloadBlob(fileData, 'laporan-rekam-medis.pdf');
    } catch (err) {
      console.error(err);
      setError('Gagal mengekspor laporan rekam medis ke PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    setError('');

    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const fileData = await laporanService.exportMedicalRecordExcel(params);
      downloadBlob(fileData, 'laporan-rekam-medis.csv');
    } catch (err) {
      console.error(err);
      setError('Gagal mengekspor laporan rekam medis ke Excel.');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <AdminLayout title="Laporan Rekam Medis">
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Filter Rekam Medis</h2>
          <Link to="/admin/laporan" className="view-all">Kembali ke semua laporan →</Link>
        </div>

        <p>Filter data rekam medis berdasarkan tanggal kunjungan, dokter, atau pasien.</p>

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
            <label htmlFor="dokter_id">Dokter</label>
            <select
              id="dokter_id"
              name="dokter_id"
              value={filters.dokter_id}
              onChange={handleChange}
            >
              <option value="">Semua</option>
              {doctors.map((dokter) => (
                <option key={dokter.id} value={dokter.id}>
                  {dokter.nama || dokter.name || 'Dokter'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pasien_id">Pasien</label>
            <select
              id="pasien_id"
              name="pasien_id"
              value={filters.pasien_id}
              onChange={handleChange}
            >
              <option value="">Semua</option>
              {patients.map((pasien) => (
                <option key={pasien.id} value={pasien.id}>
                  {pasien.nama || pasien.name || 'Pasien'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={fetchLaporan}>
              Terapkan Filter
            </button>
            <button type="button" className="btn" onClick={handleExportPdf} disabled={exporting}>
              {exporting ? 'Mengekspor PDF…' : 'Export PDF'}
            </button>
            <button type="button" className="btn" onClick={handleExportExcel} disabled={exportingExcel}>
              {exportingExcel ? 'Mengekspor Excel…' : 'Export Excel'}
            </button>
            <button type="button" className="btn danger" onClick={resetFilters}>
              Reset Filter
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="dashboard-section" style={{ marginTop: '20px', padding: '20px', boxShadow: 'none', background: 'transparent' }}>
          <h3>Hasil Laporan Rekam Medis</h3>
          {loading ? (
            <p>Memuat laporan...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table-report" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Pasien</th>
                    <th>Dokter</th>
                    <th>Tanggal Kunjungan</th>
                    <th>Keluhan</th>
                    <th>Diagnosis</th>
                    <th>Resep / Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.length > 0 ? (
                    laporan.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{index + 1}</td>
                        <td>{item.pasien?.nama || item.pasien?.name || '-'}</td>
                        <td>{item.dokter?.nama || item.dokter?.name || '-'}</td>
                        <td>{formatDate(item.tanggal_kunjungan)}</td>
                        <td>{item.keluhan || item.keluhan_utama || item.keluhan_pasien || '-'}</td>
                        <td>{item.diagnosis || '-'}</td>
                        <td>{item.tindakan || item.resep || item.treatment || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                        Tidak ada data rekam medis yang sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default LaporanRekamMedis;
