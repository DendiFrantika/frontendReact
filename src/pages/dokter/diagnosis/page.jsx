import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

export default function Diagnosis() {
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [meta,     setMeta]     = useState(null);
  const [selected, setSelected] = useState(null); // detail modal
  const navigate = useNavigate();

  useEffect(() => { fetchRecords(page); }, [page]);

  const fetchRecords = async (p = 1) => {
    setLoading(true);
    try {
      const res  = await axiosInstance.get(`/dokter/rekam-medis?page=${p}`);
      const body = res.data;
      // Laravel paginate returns { data: [...], current_page, last_page, total, ... }
      setRecords(body.data ?? []);
      setMeta({
        current: body.current_page,
        last:    body.last_page,
        total:   body.total,
        from:    body.from,
        to:      body.to,
      });
    } catch (err) {
      console.error('Error fetching rekam medis:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

  // Client-side search filter
  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.pasien?.nama?.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q) ||
      r.keluhan_utama?.toLowerCase().includes(q)
    );
  });

  // Parse diagnosis string menjadi array chip
  const parseDiagnosis = (str) => {
    if (!str) return [];
    return str.split(';').map((s) => s.trim()).filter(Boolean);
  };

  // Parse resep JSON string
  const parseResep = (str) => {
    try { return JSON.parse(str) ?? []; }
    catch { return []; }
  };

  return (
    <DokterLayout title="Diagnosis Pasien">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        .dx * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        /* ── Header bar ── */
        .dx-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 22px;
        }
        .dx-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
        .dx-sub   { font-size: 13px; color: #6B7280; margin: 2px 0 0; }

        .dx-search {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #E5E7EB; border-radius: 10px;
          padding: 9px 14px; min-width: 260px;
        }
        .dx-search input {
          border: none; outline: none; font-size: 14px;
          color: #111827; font-family: inherit; width: 100%; background: transparent;
        }
        .dx-search .ico { color: #9CA3AF; flex-shrink: 0; font-size: 15px; }

        /* ── Stat pills ── */
        .dx-stats { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
        .dx-pill {
          background: #fff; border: 1.5px solid #E5E7EB; border-radius: 10px;
          padding: 10px 18px; font-size: 13px; color: #6B7280;
        }
        .dx-pill strong { font-size: 20px; font-weight: 700; color: #111827; display: block; }

        /* ── Table card ── */
        .dx-card {
          background: #fff; border: 1.5px solid #E5E7EB;
          border-radius: 14px; overflow: hidden;
        }
        .dx-table { width: 100%; border-collapse: collapse; }
        .dx-table thead tr { background: #F9FAFB; border-bottom: 1.5px solid #E5E7EB; }
        .dx-table th {
          padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700;
          color: #6B7280; text-transform: uppercase; letter-spacing: .6px; white-space: nowrap;
        }
        .dx-table tbody tr {
          border-bottom: 1px solid #F3F4F6; transition: background .12s; cursor: pointer;
        }
        .dx-table tbody tr:last-child { border-bottom: none; }
        .dx-table tbody tr:hover { background: #F9FAFB; }
        .dx-table td { padding: 14px 16px; font-size: 14px; color: #374151; vertical-align: top; }

        .patient-name { font-weight: 700; color: #111827; }
        .patient-meta { font-size: 12px; color: #9CA3AF; margin-top: 2px; }

        .diag-chip {
          display: inline-flex; align-items: center; gap: 4px;
          background: #EEF2FF; color: #4338CA; border-radius: 6px;
          padding: 2px 8px; font-size: 11px; font-weight: 600;
          margin: 2px 2px 2px 0; white-space: nowrap;
        }
        .diag-more {
          display: inline-block; background: #F3F4F6; color: #6B7280;
          border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 600;
        }

        .keluhan-text {
          max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font-size: 13px; color: #6B7280;
        }

        .btn-detail {
          padding: 6px 14px; background: none; border: 1.5px solid #C7D2FE;
          border-radius: 7px; color: #6366F1; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all .15s; white-space: nowrap;
        }
        .btn-detail:hover { background: #EEF2FF; border-color: #6366F1; }

        /* ── Pagination ── */
        .dx-page {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-top: 1.5px solid #F3F4F6; flex-wrap: wrap; gap: 10px;
        }
        .dx-page .info { font-size: 13px; color: #6B7280; }
        .dx-page .btns { display: flex; gap: 6px; }
        .pg-btn {
          padding: 7px 14px; border: 1.5px solid #E5E7EB; border-radius: 7px;
          background: #fff; font-size: 13px; font-weight: 600; color: #374151;
          cursor: pointer; font-family: inherit; transition: all .15s;
        }
        .pg-btn:hover:not(:disabled) { border-color: #6366F1; color: #6366F1; }
        .pg-btn:disabled { opacity: .4; cursor: default; }
        .pg-btn.active  { background: #6366F1; color: #fff; border-color: #6366F1; }

        /* ── Empty state ── */
        .dx-empty {
          text-align: center; padding: 64px 20px; color: #9CA3AF;
        }
        .dx-empty .ico { font-size: 48px; margin-bottom: 12px; }
        .dx-empty p { margin: 0; font-size: 14px; }

        /* ── Modal overlay ── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.45);
          z-index: 200; display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .modal-box {
          background: #fff; border-radius: 18px; width: 100%; max-width: 640px;
          max-height: 88vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,.18);
        }
        .modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 0; margin-bottom: 4px;
        }
        .modal-head h3 { margin: 0; font-size: 17px; font-weight: 700; color: #111827; }
        .modal-close {
          background: #F3F4F6; border: none; border-radius: 8px; width: 32px; height: 32px;
          cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
          color: #6B7280; transition: background .12s;
        }
        .modal-close:hover { background: #E5E7EB; }
        .modal-body { padding: 16px 24px 24px; }

        .modal-section { margin-bottom: 18px; }
        .modal-section:last-child { margin-bottom: 0; }
        .modal-section h5 {
          font-size: 10px; font-weight: 700; color: #9CA3AF; text-transform: uppercase;
          letter-spacing: .7px; margin: 0 0 8px;
        }
        .modal-section p { font-size: 14px; color: #374151; margin: 0; line-height: 1.6; white-space: pre-wrap; }

        .resep-item {
          background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 9px;
          padding: 10px 14px; margin-bottom: 8px; font-size: 13px;
        }
        .resep-item:last-child { margin-bottom: 0; }
        .resep-item .rname { font-weight: 700; color: #111827; margin-bottom: 3px; }
        .resep-item .rmeta { color: #6B7280; }

        .divider { border: none; border-top: 1px solid #F3F4F6; margin: 16px 0; }

        @media (max-width: 640px) {
          .dx-header { flex-direction: column; align-items: stretch; }
          .dx-search  { min-width: unset; }
          .dx-table th:nth-child(3),
          .dx-table td:nth-child(3) { display: none; }
        }
      `}</style>

      <div className="dx">
        {/* Header */}
        <div className="dx-header">
          <div>
            <h2 className="dx-title">Rekam Medis Pasien</h2>
            <p className="dx-sub">Seluruh data rekam medis yang Anda buat</p>
          </div>
          <div className="dx-search">
            <span className="ico">🔍</span>
            <input
              placeholder="Cari nama pasien atau diagnosis…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Stat pills */}
        {meta && (
          <div className="dx-stats">
            <div className="dx-pill"><strong>{meta.total}</strong>Total Rekam Medis</div>
            <div className="dx-pill"><strong>{meta.from ?? 0}–{meta.to ?? 0}</strong>Ditampilkan</div>
            <div className="dx-pill"><strong>{meta.last}</strong>Total Halaman</div>
          </div>
        )}

        {/* Table */}
        <div className="dx-card">
          {loading ? (
            <div className="dx-empty">
              <div className="ico">⏳</div>
              <p>Memuat data rekam medis…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="dx-empty">
              <div className="ico">📋</div>
              <p>{search ? 'Tidak ada hasil pencarian.' : 'Belum ada rekam medis.'}</p>
            </div>
          ) : (
            <>
              <table className="dx-table">
                <thead>
                  <tr>
                    <th>Pasien</th>
                    <th>Diagnosis</th>
                    <th>Keluhan Utama</th>
                    <th>Tanggal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rm) => {
                    const diagChips = parseDiagnosis(rm.diagnosis);
                    return (
                      <tr key={rm.id} onClick={() => setSelected(rm)}>
                        <td>
                          <div className="patient-name">{rm.pasien?.nama ?? '-'}</div>
                          <div className="patient-meta">{rm.pasien?.jenis_kelamin ?? '-'}</div>
                        </td>
                        <td>
                          {diagChips.slice(0, 2).map((d, i) => (
                            <span key={i} className="diag-chip">{d}</span>
                          ))}
                          {diagChips.length > 2 && (
                            <span className="diag-more">+{diagChips.length - 2}</span>
                          )}
                          {diagChips.length === 0 && <span style={{ color: '#9CA3AF' }}>-</span>}
                        </td>
                        <td>
                          <div className="keluhan-text" title={rm.keluhan_utama}>
                            {rm.keluhan_utama || '-'}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{fmt(rm.tanggal_kunjungan)}</td>
                        <td>
                          <button
                            className="btn-detail"
                            onClick={(e) => { e.stopPropagation(); setSelected(rm); }}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {meta && meta.last > 1 && (
                <div className="dx-page">
                  <span className="info">
                    Halaman {meta.current} dari {meta.last}
                  </span>
                  <div className="btns">
                    <button className="pg-btn" disabled={meta.current <= 1}
                      onClick={() => setPage((p) => p - 1)}>← Sebelumnya</button>
                    {Array.from({ length: meta.last }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - meta.current) <= 2)
                      .map((p) => (
                        <button key={p} className={`pg-btn ${p === meta.current ? 'active' : ''}`}
                          onClick={() => setPage(p)}>{p}</button>
                      ))}
                    <button className="pg-btn" disabled={meta.current >= meta.last}
                      onClick={() => setPage((p) => p + 1)}>Berikutnya →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Detail Rekam Medis</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Pasien info */}
              <div className="modal-section">
                <h5>Pasien</h5>
                <p>
                  <strong>{selected.pasien?.nama ?? '-'}</strong>
                  {selected.pasien?.jenis_kelamin ? ` · ${selected.pasien.jenis_kelamin}` : ''}
                  {selected.tanggal_kunjungan ? ` · ${fmt(selected.tanggal_kunjungan)}` : ''}
                </p>
              </div>

              <hr className="divider" />

              <div className="modal-section">
                <h5>Keluhan Utama</h5>
                <p>{selected.keluhan_utama || '-'}</p>
              </div>

              {selected.anamnesis && (
                <div className="modal-section">
                  <h5>Anamnesis</h5>
                  <p>{selected.anamnesis}</p>
                </div>
              )}

              {selected.pemeriksaan_fisik && (
                <div className="modal-section">
                  <h5>Pemeriksaan Fisik &amp; Vital Signs</h5>
                  <p>{selected.pemeriksaan_fisik}</p>
                </div>
              )}

              {selected.hasil_laboratorium && (
                <div className="modal-section">
                  <h5>Hasil Laboratorium</h5>
                  <p>{selected.hasil_laboratorium}</p>
                </div>
              )}

              <hr className="divider" />

              <div className="modal-section">
                <h5>Diagnosis ICD-10</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                  {parseDiagnosis(selected.diagnosis).map((d, i) => (
                    <span key={i} className="diag-chip" style={{ fontSize: 12 }}>{d}</span>
                  ))}
                  {!selected.diagnosis && <p style={{ color: '#9CA3AF', margin: 0 }}>-</p>}
                </div>
              </div>

              {selected.tindakan && (
                <div className="modal-section">
                  <h5>Tindakan Medis</h5>
                  <p>{selected.tindakan}</p>
                </div>
              )}

              {/* Resep */}
              {selected.resep && (
                <div className="modal-section">
                  <h5>Resep Obat</h5>
                  {parseResep(selected.resep).length > 0 ? (
                    parseResep(selected.resep).map((obat, i) => (
                      <div key={i} className="resep-item">
                        <div className="rname">{obat.nama_obat}</div>
                        <div className="rmeta">
                          {[obat.dosis, obat.satuan].filter(Boolean).join(' ')}
                          {obat.frekuensi ? ` · ${obat.frekuensi}` : ''}
                          {obat.waktu     ? ` · ${obat.waktu}`     : ''}
                          {obat.durasi    ? ` · ${obat.durasi} hari` : ''}
                        </div>
                        {obat.catatan && (
                          <div className="rmeta" style={{ fontStyle: 'italic', marginTop: 3 }}>
                            {obat.catatan}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#9CA3AF', margin: 0, fontSize: 14 }}>-</p>
                  )}
                </div>
              )}

              {selected.catatan_dokter && (
                <>
                  <hr className="divider" />
                  <div className="modal-section">
                    <h5>Catatan Dokter</h5>
                    <p>{selected.catatan_dokter}</p>
                  </div>
                </>
              )}

              {/* Tombol ke halaman rekam medis lengkap */}
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  style={{
                    padding: '10px 20px', background: '#F3F4F6', border: 'none',
                    borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 13, fontWeight: 700, color: '#374151',
                  }}
                  onClick={() => setSelected(null)}
                >
                  Tutup
                </button>
                <button
                  style={{
                    padding: '10px 20px', background: '#4F46E5', border: 'none',
                    borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                  }}
                  onClick={() => {
                    setSelected(null);
                    navigate(`/dokter/rekam-medis/${selected.pendaftaran_id}`);
                  }}
                >
                  Lihat Halaman Penuh →
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </DokterLayout>
  );
}