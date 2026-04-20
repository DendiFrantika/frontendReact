import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const reportCards = [
  {
    icon: '👥',
    title: 'Laporan Pasien',
    description: 'Ringkasan pasien, pendaftaran, dan rekam medis.',
    link: '/admin/laporan/pasien',
  },
  {
    icon: '🩺',
    title: 'Laporan Rekam Medis',
    description: 'Lihat data kunjungan dan diagnosis pasien.',
    link: '/admin/laporan/rekam-medis',
  },
  {
    icon: '👨‍⚕️',
    title: 'Laporan Dokter',
    description: 'Analisis jumlah pasien per dokter.',
    link: '/admin/laporan/dokter',
  },
  {
    icon: '🗓️',
    title: 'Laporan Pendaftaran',
    description: 'Statistik pendaftaran dan status antrian.',
    link: '/admin/laporan/pendaftaran',
  },
];

export default function Laporan() {
  return (
    <AdminLayout title="Laporan">
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Menu Laporan</h2>
        </div>
        <p>Pilih jenis laporan yang ingin ditampilkan. Contoh: laporan pasien berisi ringkasan dan daftar pasien berdasarkan filter.</p>

        <div className="quick-actions">
          {reportCards.map((card) => (
            <Link key={card.title} to={card.link} className="action-btn">
              <div className="action-icon">{card.icon}</div>
              <strong>{card.title}</strong>
              <span style={{ marginTop: '8px', display: 'block', fontSize: '0.95rem', color: '#7f8c8d' }}>{card.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
