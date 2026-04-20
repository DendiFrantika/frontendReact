'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';
import './Aktivitas.css';

export default function Aktivitas() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/admin/recent-activities');
        const data = Array.isArray(res.data) ? res.data : [];
        setActivities(data);
      } catch (err) {
        console.error('Error fetching activities', err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (mins < 60) return `${mins} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    return `${days} hari yang lalu`;
  };

  const getBadgeConfig = (type) => {
    switch (type) {
      case 'pendaftaran': return { color: 'primary', icon: '📋', label: 'Pendaftaran' };
      case 'rekam_medis': return { color: 'success', icon: '🩺', label: 'Rekam Medis' };
      case 'pasien_baru': return { color: 'info', icon: '👤', label: 'Pasien Baru' };
      default: return { color: 'secondary', icon: '📌', label: 'Aktivitas' };
    }
  };

  // SORT + PAGINATION
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = sortedActivities.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);

  return (
    <AdminLayout title="Aktivitas Admin">
      <div className="container-fluid">

        {/* LOADING */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Memuat aktivitas...</p>
          </div>
        )}

        {/* DATA */}
        {!loading && activities.length > 0 && (
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-4">

              {/* HEADER */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold mb-0">Aktivitas Terbaru</h4>
                  <small className="text-muted">
                    Pantau semua aktivitas sistem secara real-time
                  </small>
                </div>
                <span className="badge bg-light text-dark border">
                  {sortedActivities.length} aktivitas
                </span>
              </div>

              {/* LIST */}
              <div className="activity-list-modern">
                {currentActivities.map((a, idx) => {
                  const badge = getBadgeConfig(a.type);

                  return (
                    <div key={a.id || idx} className="activity-modern-item">

                      <div className="activity-icon-circle">
                        {badge.icon}
                      </div>

                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                          <span className={`badge bg-${badge.color}`}>
                            {badge.label}
                          </span>

                          {a.status && (
                            <span className="badge bg-light text-dark border">
                              {a.status}
                            </span>
                          )}
                        </div>

                        <div className="activity-text">
                          {a.description}
                        </div>

                        <small className="text-muted">
                          {formatDate(a.timestamp || a.created_at)}
                        </small>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
                <small className="text-muted">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, sortedActivities.length)} dari {sortedActivities.length}
                </small>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-light border"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    ←
                  </button>

                  <span className="px-2 fw-semibold">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    className="btn btn-sm btn-light border"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    →
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && activities.length === 0 && (
          <div className="text-center py-5">
            <div style={{ fontSize: '2.5rem' }}>📭</div>
            <h6 className="text-muted mt-2">Belum ada aktivitas</h6>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}