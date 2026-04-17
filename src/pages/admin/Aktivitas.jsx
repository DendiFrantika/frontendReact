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

  return (
    <AdminLayout title="Aktivitas Admin">
      {loading ? (
        <p>Memuat aktivitas...</p>
      ) : activities.length > 0 ? (
        <ul>
          {activities.map((a, idx) => (
            <li key={a.id || idx}>
              {a.description} &ndash; {new Date(a.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>Tidak ada aktivitas terbaru.</p>
      )}
    </AdminLayout>
  );
}