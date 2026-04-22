import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import './AlurAdminKasir.css';

const STEPS = [
  { num: 1, title: 'Login' },
  { num: 2, title: 'Pengelolaan data master' },
  { num: 3, title: 'Registrasi / verifikasi pasien' },
  { num: 4, title: 'Nomor antrean & dashboard dokter' },
  { num: 5, title: 'Pemeriksaan dokter' },
  { num: 6, title: 'Billing & pembayaran' },
  { num: 7, title: 'Penyelesaian transaksi' },
  { num: 8, title: 'Invoice & laporan' },
];

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
          <span>Untuk dokumentasi &amp; orientasi pengguna</span>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="alur-body">

          {/* LEFT — VERTICAL FLOW */}
          <div className="alur-flow" aria-label="Alur proses Admin–Kasir">

            {/* Step 1 */}
            <div className="alur-step-row">
              <div className="alur-step-dot">1</div>
              <article className="alur-step">
                <span className="alur-step-title">Login</span>
                <p className="alur-step-body">
                  Admin–kasir melakukan autentikasi ke sistem. Setelah berhasil, menu
                  dan hak akses sesuai peran admin ditampilkan.
                </p>
              </article>
            </div>

            <div className="alur-spacer" />

            {/* Step 2 */}
            <div className="alur-step-row">
              <div className="alur-step-dot">2</div>
              <article className="alur-step">
                <span className="alur-step-title">Pengelolaan data master</span>
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
            </div>

            <div className="alur-spacer" />

            {/* Step 3 */}
            <div className="alur-step-row">
              <div className="alur-step-dot">3</div>
              <article className="alur-step">
                <span className="alur-step-title">Registrasi / verifikasi pasien</span>
                <p className="alur-step-body">
                  Admin–kasir mendaftarkan atau memverifikasi identitas pasien, baik yang
                  datang langsung ke klinik maupun yang sudah mendaftar secara daring.
                </p>
                <div className="alur-links">
                  <Link to="/admin/pendaftaran">Pendaftaran</Link>
                </div>
              </article>
            </div>

            <div className="alur-spacer" />

            {/* Step 4 */}
            <div className="alur-step-row">
              <div className="alur-step-dot">4</div>
              <article className="alur-step">
                <span className="alur-step-title">Nomor antrean &amp; dashboard dokter</span>
                <p className="alur-step-body">
                  Sistem membuat nomor antrean untuk kunjungan. Nomor dan status antrean
                  ditampilkan pada sisi dokter sebagai acuan urutan layanan.
                </p>
              </article>
            </div>

            <div className="alur-spacer" />

            {/* Step 5 */}
            <div className="alur-step-row">
              <div className="alur-step-dot">5</div>
              <article className="alur-step">
                <span className="alur-step-title">Pemeriksaan dokter</span>
                <p className="alur-step-body">
                  Pasien dilayani oleh dokter. Dokter mencatat tindakan medis dan resep
                  obat yang menjadi dasar tagihan di langkah berikutnya.
                </p>
                <div className="alur-links">
                  <Link to="/admin/rekam-medis">Rekam medis (admin)</Link>
                </div>
              </article>
            </div>

            <div className="alur-spacer" />

            {/* Step 6 */}
            <div className="alur-step-row">
              <div className="alur-step-dot">6</div>
              <article className="alur-step">
                <span className="alur-step-title">Billing &amp; pembayaran</span>
                <p className="alur-step-body">
                  Admin–kasir menyusun tagihan dari tindakan medis dan obat sesuai input
                  dokter, lalu memproses pembayaran sesuai metode yang berlaku di klinik.
                </p>
              </article>
            </div>

            <div className="alur-spacer" />

            {/* Step 7 */}
            <div className="alur-step-row">
              <div className="alur-step-dot">7</div>
              <article className="alur-step">
                <span className="alur-step-title">Penyelesaian transaksi</span>
                <p className="alur-step-body">
                  Setelah pembayaran dikonfirmasi, sistem memperbarui stok obat dan
                  menyimpan data transaksi keuangan untuk audit dan laporan.
                </p>
              </article>
            </div>

            <div className="alur-spacer" />

            {/* Step 8 */}
            <div className="alur-step-row">
              <div className="alur-step-dot">8</div>
              <article className="alur-step">
                <span className="alur-step-title">Invoice &amp; laporan</span>
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

          </div>
          {/* END LEFT */}

          {/* RIGHT — STICKY SIDEBAR */}
          <aside className="alur-sidebar">
            <p className="alur-sidebar-title">Ringkasan Alur</p>
            <ul className="alur-sidebar-list">
              {STEPS.map(s => (
                <li key={s.num}>
                  <span className="alur-sidebar-num">{s.num}</span>
                  {s.title}
                </li>
              ))}
            </ul>
            <hr className="alur-sidebar-divider" />
            <p className="alur-sidebar-info">
              8 tahap · Hanya dokumentasi frontend
            </p>
          </aside>

        </div>
        {/* END TWO-COLUMN */}

        <p className="alur-note" role="note">
          <strong>Catatan:</strong> Halaman ini hanya dokumentasi alur di frontend.
          Modul obat, tarif tindakan, billing, stok, dan cetak invoice diimplementasikan
          terpisah di aplikasi / backend sesuai kebijakan klinik Anda.
        </p>

      </div>
    </AdminLayout>
  );
}