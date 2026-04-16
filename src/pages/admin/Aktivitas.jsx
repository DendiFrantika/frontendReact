import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
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
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Aktivitas Admin</h1>
        {loading ? (
          <p>Memuat aktivitas...</p>
        ) : (
          activities.length > 0 ? (
            <ul>
              {activities.map((a, idx) => (
                <li key={a.id || idx}>
                  {a.description} &ndash; {new Date(a.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>Tidak ada aktivitas terbaru.</p>
          )
        )}
      </div>
    </div>
  );
}