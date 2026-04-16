import React from 'react';
import Sidebar from '../../components/Sidebar';

export default function Analytics() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Analytics</h1>
        <p>Visualisasi data dan metrik untuk admin.</p>
      </div>
    </div>
  );
}