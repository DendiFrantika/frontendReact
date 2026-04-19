import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axiosInstance from '../../api/axios';

export default function Aktivitas() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/admin/recent-activities');
        setActivities(res.data);
      } catch (err) {
        console.error('Error fetching activities', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Format waktu
  const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Badge warna berdasarkan jenis aktivitas
  const getBadge = (text) => {
    if (!text) return 'secondary';

    if (text.toLowerCase().includes('tambah')) return 'success';
    if (text.toLowerCase().includes('hapus')) return 'danger';
    if (text.toLowerCase().includes('update')) return 'warning';

    return 'primary';
  };

  return (
    <AdminLayout title="Aktivitas Admin">
      <div className="container-fluid">

        {/* LOADING */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-2">Memuat aktivitas...</p>
          </div>
        )}

        {/* DATA */}
        {!loading && activities.length > 0 && (
          <div className="card shadow-sm border-0">
            <div className="card-body">

              <h5 className="mb-4">Log Aktivitas Terbaru</h5>

              <ul className="list-group list-group-flush">
                {activities.map((a, idx) => (
                  <li
                    key={a.id || idx}
                    className="list-group-item d-flex justify-content-between align-items-start"
                  >
                    <div>
                      <span className={`badge bg-${getBadge(a.description)} me-2`}>
                        Aktivitas
                      </span>

                      <span>{a.description}</span>

                      <div className="text-muted small mt-1">
                        {formatDate(a.timestamp)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && activities.length === 0 && (
          <div className="text-center py-5">
            <h6 className="text-muted">Tidak ada aktivitas terbaru</h6>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}