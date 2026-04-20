import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import laporanService from '../../services/laporan-service';

const initialFilters = {
  tanggal_mulai: '',
  tanggal_akhir: '',
};

const LaporanPendaftaran = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await laporanService.getRegistrationReport(params);
      setLaporan(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil laporan pendaftaran. Silakan coba lagi.');
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

  const totalRegistrations = laporan.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return (
    <AdminLayout title="Laporan Pendaftaran">
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Filter Laporan Pendaftaran</h2>
          <Link to="/admin/laporan" className="view-all">Kembali ke semua laporan →</Link>
        </div>

        <p>Filter laporan pendaftaran berdasarkan rentang tanggal pendaftaran.</p>

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

          <div className="form-actions">
            <button type="button" className="btn" onClick={fetchLaporan}>
              Terapkan Filter
            </button>
            <button type="button" className="btn danger" onClick={resetFilters}>
              Reset Filter
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="dashboard-section" style={{ marginTop: '20px', padding: '20px', boxShadow: 'none', background: 'transparent' }}>
          <h3>Hasil Laporan Pendaftaran</h3>
          {loading ? (
            <p>Memuat laporan...</p>
          ) : (
            <>
              <div className="stats-grid" style={{ gap: '16px', marginBottom: '20px' }}>
                <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
                  <div className="stat-icon">🗂️</div>
                  <div className="stat-info">
                    <h3>Total Pendaftaran</h3>
                    <p className="stat-value">{totalRegistrations.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table-report" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporan.length > 0 ? (
                      laporan.map((item, index) => (
                        <tr key={item.status || index}>
                          <td>{item.status || '-'}</td>
                          <td>{item.total ?? 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '24px' }}>
                          Tidak ada data laporan pendaftaran yang sesuai filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default LaporanPendaftaran;
