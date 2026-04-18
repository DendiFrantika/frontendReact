import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import './AlurAdminKasir.css';

/**
 * Diagram alur operasional Admin–Kasir (konten statis, tanpa panggilan API).
 * Menggambarkan proses sesuai narasi sistem informasi klinik.
 */
export default function AlurAdminKasir() {
  return (
    <AdminLayout title="Alur kerja Admin–Kasir">
      <div className="alur-flow-page">
        <p className="alur-intro">
          Bagan berikut merangkum alur operasional dan administrasi untuk peran
          admin–kasir: dari login, pengelolaan master data, layanan front office,
          integrasi dengan pemeriksaan dokter, hingga billing dan pelaporan.
        </p>

        <div className="alur-legend" role="note">
          <span>Hanya tampilan frontend</span>
          <span>Tidak mengubah data</span>
          <span>Untuk dokumentasi & orientasi pengguna</span>
        </div>

        <div className="alur-flow" aria-label="Alur proses Admin–Kasir">
          <article className="alur-step">
            <h2 className="alur-step-title">
              <span className="alur-step-num" aria-hidden="true">
                1
              </span>
              Login
            </h2>
            <p className="alur-step-body">
              Admin–kasir melakukan autentikasi ke sistem. Setelah berhasil, menu
              dan hak akses sesuai peran admin ditampilkan.
            </p>
          </article>

          <div className="alur-arrow" aria-hidden="true">
            ↓
          </div>

          <article className="alur-step">
            <h2 className="alur-step-title">
              <span className="alur-step-num" aria-hidden="true">
                2
              </span>
              Pengelolaan data master
            </h2>
            <p className="alur-step-body">
              Penyiapan dan pemeliharaan referensi yang dipakai seluruh alur klinik:
            </p>
            <ul className="alur-step-list">
              <li>Data dokter</li>
              <li>Data pasien</li>
              <li>Data obat</li>
              <li>Tarif tindakan medis</li>
            </ul>
            <div className="alur-links">
              <Link to="/admin/dokter">Dokter</Link>
              <Link to="/admin/pasien">Pasien</Link>
              <Link to="/admin/jadwal">Jadwal</Link>
            </div>
          </article>

          <div className="alur-arrow" aria-hidden="true">
            ↓
          </div>

          <article className="alur-step">
            <h2 className="alur-step-title">
              <span className="alur-step-num" aria-hidden="true">
                3
              </span>
              Registrasi / verifikasi pasien
            </h2>
            <p className="alur-step-body">
              Admin–kasir mendaftarkan atau memverifikasi identitas pasien, baik yang
              datang langsung ke klinik maupun yang sudah mendaftar secara daring
              (online).
            </p>
            <div className="alur-links">
              <Link to="/admin/pendaftaran">Pendaftaran</Link>
            </div>
          </article>

          <div className="alur-arrow" aria-hidden="true">
            ↓
          </div>

          <article className="alur-step">
            <h2 className="alur-step-title">
              <span className="alur-step-num" aria-hidden="true">
                4
              </span>
              Nomor antrean & dashboard dokter
            </h2>
            <p className="alur-step-body">
              Sistem membuat nomor antrean untuk kunjungan. Nomor dan status antrean
              ditampilkan pada sisi dokter (dashboard / antrean) sebagai acuan urutan
              layanan.
            </p>
          </article>

          <div className="alur-arrow" aria-hidden="true">
            ↓
          </div>

          <article className="alur-step">
            <h2 className="alur-step-title">
              <span className="alur-step-num" aria-hidden="true">
                5
              </span>
              Pemeriksaan dokter
            </h2>
            <p className="alur-step-body">
              Pasien dilayani oleh dokter. Dokter mencatat tindakan medis dan resep
              obat yang menjadi dasar tagihan di langkah berikutnya.
            </p>
            <div className="alur-links">
              <Link to="/admin/rekam-medis">Rekam medis (admin)</Link>
            </div>
          </article>

          <div className="alur-arrow" aria-hidden="true">
            ↓
          </div>

          <article className="alur-step">
            <h2 className="alur-step-title">
              <span className="alur-step-num" aria-hidden="true">
                6
              </span>
              Billing & pembayaran
            </h2>
            <p className="alur-step-body">
              Admin–kasir menyusun tagihan dari tindakan medis dan obat sesuai input
              dokter, lalu memproses pembayaran sesuai metode yang berlaku di klinik.
            </p>
          </article>

          <div className="alur-arrow" aria-hidden="true">
            ↓
          </div>

          <article className="alur-step">
            <h2 className="alur-step-title">
              <span className="alur-step-num" aria-hidden="true">
                7
              </span>
              Penyelesaian transaksi
            </h2>
            <p className="alur-step-body">
              Setelah pembayaran dikonfirmasi, sistem memperbarui stok obat dan
              menyimpan data transaksi keuangan untuk audit dan laporan.
            </p>
          </article>

          <div className="alur-arrow" aria-hidden="true">
            ↓
          </div>

          <article className="alur-step">
            <h2 className="alur-step-title">
              <span className="alur-step-num" aria-hidden="true">
                8
              </span>
              Invoice & laporan
            </h2>
            <p className="alur-step-body">
              Admin–kasir dapat mencetak invoice untuk pasien serta mengakses laporan
              keuangan dan operasional klinik untuk pengambilan keputusan.
            </p>
            <div className="alur-links">
              <Link to="/admin/laporan">Laporan</Link>
              <Link to="/admin/analytics">Analytics</Link>
            </div>
          </article>
        </div>

        <p className="alur-note" role="note">
          <strong>Catatan:</strong> Halaman ini hanya dokumentasi alur di frontend.
          Modul obat, tarif tindakan, billing, stok, dan cetak invoice diimplementasikan
          terpisah di aplikasi / backend sesai kebijakan klinik Anda.
        </p>
      </div>
    </AdminLayout>
  );
}
