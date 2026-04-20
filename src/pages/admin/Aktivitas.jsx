import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';

export default function Aktivitas() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/admin/aktivitas-hari-ini');

        // Backend kini mengembalikan array langsung (bukan object bersarang)
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

  const formatDate = (date) =>
    new Date(date).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  // Warna badge berdasarkan type yang dikirim backend
  const getBadgeConfig = (type) => {
    switch (type) {
      case 'pendaftaran': return { color: 'primary',  icon: '📋', label: 'Pendaftaran' };
      case 'rekam_medis': return { color: 'success',  icon: '🩺', label: 'Rekam Medis' };
      case 'pasien_baru': return { color: 'info',     icon: '👤', label: 'Pasien Baru' };
      default:            return { color: 'secondary', icon: '📌', label: 'Aktivitas'  };
    }
  };

  return (
    <AdminLayout title="Aktivitas Admin">
      <div className="container-fluid">

        {/* LOADING */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Memuat aktivitas...</p>
          </div>
        )}

        {/* DATA */}
        {!loading && activities.length > 0 && (
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-4">Log Aktivitas Hari Ini</h5>
              <ul className="list-group list-group-flush">
                {activities.map((a, idx) => {
                  const badge = getBadgeConfig(a.type);
                  return (
                    <li
                      key={a.id || idx}
                      className="list-group-item d-flex justify-content-between align-items-start py-3"
                    >
                      <div className="d-flex gap-3 align-items-start">
                        <span style={{ fontSize: '1.25rem' }}>{badge.icon}</span>
                        <div>
                          <span className={`badge bg-${badge.color} me-2`}>
                            {badge.label}
                          </span>
                          <span>{a.description}</span>
                          {a.status && (
                            <span className="badge bg-light text-dark border ms-2">
                              {a.status}
                            </span>
                          )}
                          <div className="text-muted small mt-1">
                            {formatDate(a.timestamp)}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && activities.length === 0 && (
          <div className="text-center py-5">
            <p style={{ fontSize: '2rem' }}>📭</p>
            <h6 className="text-muted">Tidak ada aktivitas hari ini</h6>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}