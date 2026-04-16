import React from 'react';
import Sidebar from '../../components/Sidebar';

export default function Pengaturan() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Pengaturan Admin</h1>
        <p>Halaman untuk konfigurasi dan preferensi.</p>
      </div>
    </div>
  );
}