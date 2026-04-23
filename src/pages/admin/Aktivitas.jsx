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
        const res = await axiosInstance.get('/admin/aktivitas-hari-ini');
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data) ? res.data.data : [];
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
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const mins  = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days  = Math.floor(diffMs / 86400000);
    if (mins < 1)   return 'Baru saja';
    if (mins < 60)  return `${mins} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    return `${days} hari yang lalu`;
  };

  const getBadgeConfig = (type) => {
    switch (type) {
      case 'pendaftaran_baru': return { label: 'Pendaftaran Baru', color: '#3b82f6' };
      case 'jadwal_periksa':   return { label: 'Jadwal Periksa',   color: '#f59e0b' };
      case 'rekam_medis':      return { label: 'Rekam Medis',      color: '#10b981' };
      default:                 return { label: 'Aktivitas',        color: '#94a3b8' };
    }
  };

  // Status badge warna sesuai nilai status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'confirmed': return { label: 'Confirmed', color: '#10b981' };
      case 'pending':   return { label: 'Pending',   color: '#f59e0b' };
      case 'cancelled': return { label: 'Cancelled', color: '#ef4444' };
      case 'done':      return { label: 'Selesai',   color: '#6366f1' };
      default:          return { label: status,      color: '#94a3b8' };
    }
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at)
  );

  const indexOfLastItem    = currentPage * itemsPerPage;
  const indexOfFirstItem   = indexOfLastItem - itemsPerPage;
  const currentActivities  = sortedActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages         = Math.ceil(sortedActivities.length / itemsPerPage);

  return (
    <AdminLayout title="Aktivitas Hari Ini">
      <div className="akt-wrapper">

        {/* LOADING */}
        {loading && (
          <div className="akt-loading">
            <div className="akt-spinner" />
            <p>Memuat aktivitas...</p>
          </div>
        )}

        {/* DATA */}
        {!loading && activities.length > 0 && (
          <div className="akt-card">

            {/* HEADER */}
            <div className="akt-card-header">
              <div>
                <h4 className="akt-title">Aktivitas Hari Ini</h4>
                <p className="akt-subtitle">Pantau semua aktivitas sistem hari ini</p>
              </div>
              <span className="akt-count-badge">{sortedActivities.length} aktivitas</span>
            </div>

            {/* LIST */}
            <div className="akt-list">
              {currentActivities.map((a, idx) => {
                const badge  = getBadgeConfig(a.type);
                const statusCfg = a.status ? getStatusConfig(a.status) : null;
                return (
                  <div key={a.id || idx} className="akt-item">

                    <div className="akt-item-left">
                      {/* Type Badge */}
                      <span
                        className="akt-type-badge"
                        style={{
                          background  : `${badge.color}18`,
                          color       : badge.color,
                          borderColor : `${badge.color}40`
                        }}
                      >
                        {badge.label}
                      </span>

                      {/* Status Badge */}
                      {statusCfg && (
                        <span
                          className="akt-status-badge"
                          style={{
                            background  : `${statusCfg.color}18`,
                            color       : statusCfg.color,
                            borderColor : `${statusCfg.color}40`
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      )}
                    </div>

                    <div className="akt-item-body">
                      <p className="akt-description">{a.description ?? '-'}</p>
                      <span className="akt-time">{formatDate(a.timestamp || a.created_at)}</span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="akt-pagination">
                <small className="akt-pagination-info">
                  Menampilkan {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedActivities.length)} dari {sortedActivities.length}
                </small>
                <div className="akt-pagination-controls">
                  <button
                    className="akt-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >←</button>
                  <span className="akt-page-info">{currentPage} / {totalPages}</span>
                  <button
                    className="akt-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >→</button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* EMPTY */}
        {!loading && activities.length === 0 && (
          <div className="akt-empty">
            <p className="akt-empty-title">Belum ada aktivitas hari ini</p>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}