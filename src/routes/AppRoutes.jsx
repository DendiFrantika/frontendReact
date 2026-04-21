import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';

// Landing
import Home from '../pages/landing/Home';
import Layanan from '../pages/landing/Layanan';
import Jadwal from '../pages/landing/Jadwal';
import Tentang from '../pages/landing/Tentang';
import Kontak from '../pages/landing/Kontak';

// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Admin
import AdminDashboard from '../pages/admin/Dashboard';
import Pasien from '../pages/admin/Pasien';
import Dokter from '../pages/admin/Dokter';
import JadwalAdmin from '../pages/admin/Jadwal';
import Pendaftaran from '../pages/admin/Pendaftaran';
import RekamMedis from '../pages/admin/RekamMedis';
import Laporan from '../pages/admin/Laporan';
import LaporanPasien from '../pages/admin/LaporanPasien';
import LaporanRekamMedis from '../pages/admin/LaporanRekamMedis';
import LaporanDokter from '../pages/admin/LaporanDokter';
import LaporanPendaftaran from '../pages/admin/LaporanPendaftaran';
import Pengaturan from '../pages/admin/Pengaturan';
import Aktivitas from '../pages/admin/Aktivitas';
import AlurAdminKasir from '../pages/admin/AlurAdminKasir';

// Pasien
import PasienDashboard from '../pages/pasien/Dashboard';
import Profil from '../pages/shared/Profil';
import DaftarBerobat from '../pages/pasien/DaftarBerobat';
import Riwayat from '../pages/pasien/Riwayat';
import Antrian from '../pages/pasien/Antrian';

// Dokter
import DashboardDokter from '../pages/dokter/page';
import AntrianDokter from '../pages/dokter/antrian/page';
import Diagnosis from '../pages/dokter/diagnosis/page';
import JadwalDokter from '../pages/dokter/jadwal/page';
import RiwayatDokter from '../pages/dokter/riwayat/page';
import RekamMedisDokter from "../pages/dokter/RekamMedis";
import ProfileDokter from '../pages/dokter/ProfileDokter';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Home />} />
      <Route path="/layanan" element={<Layanan />} />
      <Route path="/jadwal" element={<Jadwal />} />
      <Route path="/tentang" element={<Tentang />} />
      <Route path="/kontak" element={<Kontak />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/alur-kerja" element={<PrivateRoute role="admin"><AlurAdminKasir /></PrivateRoute>} />
      <Route path="/admin/pasien" element={<PrivateRoute role="admin"><Pasien /></PrivateRoute>} />
      <Route path="/admin/dokter" element={<PrivateRoute role="admin"><Dokter /></PrivateRoute>} />
      <Route path="/admin/jadwal" element={<PrivateRoute role="admin"><JadwalAdmin /></PrivateRoute>} />
      <Route path="/admin/pendaftaran" element={<PrivateRoute role="admin"><Pendaftaran /></PrivateRoute>} />
      <Route path="/admin/rekam-medis" element={<PrivateRoute role="admin"><RekamMedis /></PrivateRoute>} />
      <Route path="/admin/laporan" element={<PrivateRoute role="admin"><Laporan /></PrivateRoute>} />
      <Route path="/admin/laporan/pasien" element={<PrivateRoute role="admin"><LaporanPasien /></PrivateRoute>} />
      <Route path="/admin/laporan/rekam-medis" element={<PrivateRoute role="admin"><LaporanRekamMedis /></PrivateRoute>} />
      <Route path="/admin/laporan/dokter" element={<PrivateRoute role="admin"><LaporanDokter /></PrivateRoute>} />
      <Route path="/admin/laporan/pendaftaran" element={<PrivateRoute role="admin"><LaporanPendaftaran /></PrivateRoute>} />
      <Route path="/admin/aktivitas" element={<PrivateRoute role="admin"><Aktivitas /></PrivateRoute>} />
      <Route path="/admin/pengaturan" element={<PrivateRoute role="admin"><Pengaturan /></PrivateRoute>} />

      {/* Pasien */}
      <Route path="/pasien" element={<PrivateRoute role="pasien"><PasienDashboard /></PrivateRoute>} />
      <Route path="/pasien/profil" element={<PrivateRoute role="pasien"><Profil /></PrivateRoute>} />
      <Route path="/pasien/daftar-berobat" element={<PrivateRoute role="pasien"><DaftarBerobat /></PrivateRoute>} />
      <Route path="/pasien/riwayat" element={<PrivateRoute role="pasien"><Riwayat /></PrivateRoute>} />
      <Route path="/pasien/antrian" element={<PrivateRoute role="pasien"><Antrian /></PrivateRoute>} />

      {/* Dokter */}
      <Route path="/dokter" element={<PrivateRoute role="dokter"><DashboardDokter /></PrivateRoute>} />
      <Route path="/dokter/profil" element={<PrivateRoute role="dokter"><Profil /></PrivateRoute>} />
      <Route path="/dokter/antrian" element={<PrivateRoute role="dokter"><AntrianDokter /></PrivateRoute>} />
      <Route path="/dokter/diagnosis" element={<PrivateRoute role="dokter"><Diagnosis /></PrivateRoute>} />
      <Route path="/dokter/jadwal" element={<PrivateRoute role="dokter"><JadwalDokter /></PrivateRoute>} />
      <Route path="/dokter/riwayat" element={<PrivateRoute role="dokter"><RiwayatDokter /></PrivateRoute>} />
      <Route path="/dokter/rekam-medis/:pendaftaran_id" element={<PrivateRoute role="dokter"><RekamMedisDokter /></PrivateRoute>} />
      <Route path="/dokter/profile" element={<PrivateRoute role="dokter"><ProfileDokter /></PrivateRoute>} />
      

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
