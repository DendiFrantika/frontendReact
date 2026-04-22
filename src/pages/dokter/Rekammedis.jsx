import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DokterLayout from './DokterLayout';
import axiosInstance from '../../api/axios';

const ICD10_DATA = [
  // ── Karies Gigi ──
  { code: 'K02.0', desc: 'Karies gigi terbatas pada email' },
  { code: 'K02.1', desc: 'Karies gigi pada dentin' },
  { code: 'K02.2', desc: 'Karies gigi pada sementum' },
  { code: 'K02.3', desc: 'Karies gigi yang terhenti' },
  { code: 'K02.8', desc: 'Karies gigi lainnya' },
  { code: 'K02.9', desc: 'Karies gigi, tidak spesifik' },

  // ── Penyakit Pulpa & Periapikal ──
  { code: 'K04.0', desc: 'Pulpitis' },
  { code: 'K04.1', desc: 'Nekrosis pulpa' },
  { code: 'K04.2', desc: 'Degenerasi pulpa' },
  { code: 'K04.4', desc: 'Periodontitis apikal akut akibat pulpa' },
  { code: 'K04.5', desc: 'Periodontitis apikal kronis (granuloma apikal)' },
  { code: 'K04.6', desc: 'Abses periapikal dengan sinus' },
  { code: 'K04.7', desc: 'Abses periapikal tanpa sinus' },
  { code: 'K04.8', desc: 'Kista radikular (kista periapikal)' },

  // ── Penyakit Gingiva & Periodontal ──
  { code: 'K05.0', desc: 'Gingivitis akut' },
  { code: 'K05.1', desc: 'Gingivitis kronis' },
  { code: 'K05.2', desc: 'Periodontitis akut' },
  { code: 'K05.3', desc: 'Periodontitis kronis' },
  { code: 'K05.4', desc: 'Periodontosis' },
  { code: 'K05.5', desc: 'Penyakit periodontal lainnya' },
  { code: 'K05.6', desc: 'Penyakit periodontal, tidak spesifik' },

  // ── Kelainan Perkembangan Gigi ──
  { code: 'K00.0', desc: 'Anodontia (tidak ada gigi)' },
  { code: 'K00.1', desc: 'Gigi supernumerari (gigi berlebih)' },
  { code: 'K00.2', desc: 'Kelainan ukuran dan bentuk gigi' },
  { code: 'K00.3', desc: 'Gigi mottled (fluorosis gigi)' },
  { code: 'K00.4', desc: 'Gangguan pembentukan gigi' },
  { code: 'K00.6', desc: 'Gangguan erupsi gigi' },
  { code: 'K00.7', desc: 'Sindrom erupsi gigi' },

  // ── Gigi Impaksi & Maloklusi ──
  { code: 'K01.0', desc: 'Gigi terpendam (embedded)' },
  { code: 'K01.1', desc: 'Gigi impaksi' },
  { code: 'K07.0', desc: 'Anomali ukuran rahang' },
  { code: 'K07.1', desc: 'Anomali hubungan rahang-tengkorak' },
  { code: 'K07.2', desc: 'Anomali hubungan lengkung gigi (maloklusi)' },
  { code: 'K07.3', desc: 'Anomali posisi gigi' },
  { code: 'K07.4', desc: 'Maloklusi, tidak spesifik' },
  { code: 'K07.5', desc: 'Kelainan dentofasial fungsional' },
  { code: 'K07.6', desc: 'Gangguan sendi temporomandibular (TMJ)' },

  // ── Penyakit Jaringan Keras Gigi ──
  { code: 'K03.0', desc: 'Atrisi gigi berlebihan' },
  { code: 'K03.1', desc: 'Abrasi gigi' },
  { code: 'K03.2', desc: 'Erosi gigi' },
  { code: 'K03.3', desc: 'Resorpsi patologis gigi' },
  { code: 'K03.4', desc: 'Hipersementosis' },
  { code: 'K03.5', desc: 'Ankylosis gigi' },
  { code: 'K03.6', desc: 'Deposit pada gigi (kalkulus/karang gigi)' },
  { code: 'K03.7', desc: 'Perubahan warna pasca erupsi gigi' },

  // ── Penyakit Mukosa Mulut ──
  { code: 'K12.0', desc: 'Stomatitis aftosa rekuren (sariawan)' },
  { code: 'K12.1', desc: 'Stomatitis lainnya' },
  { code: 'K12.2', desc: 'Selulitis dan abses rongga mulut' },
  { code: 'K13.0', desc: 'Penyakit bibir' },
  { code: 'K13.1', desc: 'Gigitan pipi dan bibir' },
  { code: 'K13.2', desc: 'Leukoplakia dan lesi putih mukosa mulut' },
  { code: 'K13.3', desc: 'Leukoplakia berbulu (hairy leukoplakia)' },
  { code: 'K13.4', desc: 'Granuloma dan lesi mukosa mulut' },
  { code: 'K13.5', desc: 'Fibrosis submukosa mulut' },
  { code: 'K13.6', desc: 'Hiperplasia iritasi mukosa mulut' },

  // ── Penyakit Kelenjar Ludah ──
  { code: 'K11.0', desc: 'Atrofi kelenjar ludah' },
  { code: 'K11.1', desc: 'Hipertrofi kelenjar ludah' },
  { code: 'K11.2', desc: 'Sialoadenitis (radang kelenjar ludah)' },
  { code: 'K11.3', desc: 'Abses kelenjar ludah' },
  { code: 'K11.4', desc: 'Fistula kelenjar ludah' },
  { code: 'K11.5', desc: 'Sialolithiasis (batu kelenjar ludah)' },
  { code: 'K11.6', desc: 'Mukokel kelenjar ludah' },
  { code: 'K11.7', desc: 'Gangguan sekresi kelenjar ludah (xerostomia)' },

  // ── Prosedur / Tindakan Gigi ──
  { code: 'Z01.2', desc: 'Pemeriksaan gigi rutin' },
  { code: 'Z29.8', desc: 'Profilaksis gigi (scaling/pembersihan karang gigi)' },
  { code: 'Z46.3', desc: 'Pemasangan/penyesuaian gigi tiruan (protesa gigi)' },
  { code: 'Z96.5', desc: 'Implan gigi' },
];

const TINDAKAN_OPTS = [
  'Pemeriksaan Fisik Umum', 'Pengukuran Tekanan Darah',
  'Pengukuran Berat & Tinggi Badan', 'EKG (Elektrokardiogram)',
  'Injeksi Intramuskular', 'Injeksi Intravena', 'Pemasangan Infus',
  'Perawatan Luka', 'Jahit Luka', 'Nebulisasi',
  'Tes Gula Darah', 'Tes Asam Urat', 'Tes Kolesterol',
  'Pemeriksaan Mata', 'Pemeriksaan Telinga',
  'Konsultasi Gizi', 'Surat Rujukan',
];

const SATUAN    = ['Tablet', 'Kapsul', 'Ml', 'Mg', 'Sachet', 'Tetes', 'Ampul', 'Botol'];
const FREKUENSI = ['1x sehari', '2x sehari', '3x sehari', 'Setiap 4 jam', 'Setiap 6 jam', 'Setiap 8 jam', 'Jika perlu (prn)'];
const WAKTU     = ['Sebelum makan', 'Sesudah makan', 'Saat makan', 'Sebelum tidur', 'Pagi hari', 'Malam hari'];

const emptyResep = () => ({
  id: Date.now() + Math.random(), nama_obat: '', dosis: '', satuan: 'Tablet',
  frekuensi: '3x sehari', waktu: 'Sesudah makan', durasi: '', catatan: '',
});

export default function RekamMedis() {
  const { pendaftaran_id } = useParams();
  const navigate           = useNavigate();

  const [pendaftaran, setPendaftaran] = useState(null);
  const [existing,    setExisting]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [tab,         setTab]         = useState('pemeriksaan');

  const [form, setForm] = useState({
    keluhan_utama: '', anamnesis: '', pemeriksaan_fisik: '',
    hasil_laboratorium: '', catatan_dokter: '',
    tekanan_darah: '', nadi: '', suhu: '',
    respirasi: '', berat_badan: '', tinggi_badan: '',
  });

  const [diagSearch,   setDiagSearch]   = useState('');
  const [icd10Results, setIcd10Results] = useState([]);
  const [showDrop,     setShowDrop]     = useState(false);
  const [selectedDiag, setSelectedDiag] = useState([]);
  const [selectedTind, setSelectedTind] = useState([]);
  const [resepList,    setResepList]    = useState([emptyResep()]);

  const dropRef = useRef(null);

  // ── Load pendaftaran detail + cek rekam medis yang sudah ada ──
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Ambil data rekam medis (jika sudah ada)
        const rmRes  = await axiosInstance.get(`/dokter/rekam-medis/pendaftaran/${pendaftaran_id}`);
        const rmData = rmRes.data?.data;
        setExisting(rmData);

        if (rmData) {
          // ── Sudah ada → mode baca saja ──
          setForm({
            keluhan_utama:      rmData.keluhan_utama      || '',
            anamnesis:          rmData.anamnesis           || '',
            pemeriksaan_fisik:  rmData.pemeriksaan_fisik  || '',
            hasil_laboratorium: rmData.hasil_laboratorium || '',
            catatan_dokter:     rmData.catatan_dokter     || '',
            // Vital tidak dipisah dari pemeriksaan_fisik di read mode
            tekanan_darah: '', nadi: '', suhu: '',
            respirasi: '', berat_badan: '', tinggi_badan: '',
          });

          // Parse resep JSON string → array untuk ditampilkan
          if (rmData.resep_parsed?.length) {
            setResepList(
              rmData.resep_parsed.map((r, i) => ({ ...emptyResep(), ...r, id: i }))
            );
          } else if (rmData.resep) {
            // fallback: coba parse manual
            try {
              const parsed = JSON.parse(rmData.resep);
              if (Array.isArray(parsed) && parsed.length) {
                setResepList(parsed.map((r, i) => ({ ...emptyResep(), ...r, id: i })));
              }
            } catch (_) { /* biarkan default */ }
          }
        }

        // 2. Ambil data pendaftaran untuk banner pasien
        //    Kita ambil dari list antrian, filter by id
        try {
          const antrianRes  = await axiosInstance.get('/dokter/antrian');
          const antrianList = antrianRes.data?.data ?? [];
          const pend = antrianList.find((a) => String(a.id) === String(pendaftaran_id));
          if (pend) {
            setPendaftaran(pend);
          } else if (rmData?.pendaftaran) {
            // Jika sudah completed, relasi mungkin ada di rekam medis
            setPendaftaran(rmData.pendaftaran);
          }
        } catch (_) {
          // Jika antrian sudah completed dan tidak muncul, coba ambil dari rekam medis
          if (rmData) {
            setPendaftaran({
              no_antrian: rmData.pendaftaran?.no_antrian ?? '-',
              keluhan:    rmData.keluhan_utama ?? '-',
              pasien:     rmData.pasien,
            });
          }
        }

      } catch (err) {
        console.error('Error loading rekam medis:', err);
      } finally {
        setLoading(false);
      }
    };

    if (pendaftaran_id) init();
  }, [pendaftaran_id]);

  // ── ICD-10 autocomplete ──
  useEffect(() => {
    if (diagSearch.length < 2) { setIcd10Results([]); return; }
    const q = diagSearch.toLowerCase();
    setIcd10Results(
      ICD10_DATA.filter(
        (i) => i.code.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
      ).slice(0, 8)
    );
    setShowDrop(true);
  }, [diagSearch]);

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Resep helpers ──
  const addResep    = () => setResepList((p) => [...p, emptyResep()]);
  const removeResep = (id) => setResepList((p) => p.filter((r) => r.id !== id));
  const upResep     = (id, field, val) =>
    setResepList((p) => p.map((r) => r.id === id ? { ...r, [field]: val } : r));

  // ── Submit ──
  const handleSave = async () => {
    if (!form.keluhan_utama.trim()) { alert('Keluhan utama wajib diisi.'); return; }
    if (selectedDiag.length === 0)  { alert('Pilih minimal satu diagnosis ICD-10.'); return; }

    setSaving(true);
    try {
      // ✅ FIX UTAMA: diagnosis dikirim sebagai array of { code, desc }
      //               tindakan dikirim sebagai array of string
      //               sesuai validasi storeFromDokter di backend
      await axiosInstance.post('/dokter/rekam-medis', {
        pendaftaran_id,
        ...form,
        diagnosis: selectedDiag,                              // array [{ code, desc }, ...]
        tindakan:  selectedTind,                              // array ['Perawatan Luka', ...]
        resep:     resepList.filter((r) => r.nama_obat.trim()), // array obat
      });

      alert('Rekam medis berhasil disimpan. Status pasien: Selesai.');
      navigate('/dokter/antrian');
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join('\n')
        : e.response?.data?.message ?? 'Gagal menyimpan. Coba lagi.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = !!existing;

  const TABS = [
    { id: 'pemeriksaan', label: '🩺 Pemeriksaan'       },
    { id: 'diagnosis',   label: '📋 Diagnosis ICD-10'  },
    { id: 'tindakan',    label: '⚕️ Tindakan Medis'    },
    { id: 'resep',       label: '💊 E-Resep'           },
  ];

  if (loading) return (
    <DokterLayout title="Rekam Medis">
      <p style={{ padding: 48, color: '#9CA3AF', textAlign: 'center' }}>Memuat data…</p>
    </DokterLayout>
  );

  const pasien = pendaftaran?.pasien;

  return (
    <DokterLayout title={isReadOnly ? 'Detail Rekam Medis' : 'Input Rekam Medis'}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .rm * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        .rm-banner {
          background: linear-gradient(120deg, #4F46E5 0%, #7C3AED 100%);
          border-radius: 16px; padding: 20px 26px; color: #fff;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
        }
        .rm-banner .pname { font-size: 20px; font-weight: 700; }
        .rm-banner .pmeta { font-size: 13px; opacity: .8; margin-top: 3px; }
        .rm-banner .ktag  {
          background: rgba(255,255,255,.18); border-radius: 20px;
          padding: 6px 14px; font-size: 13px;
        }
        .ro-banner {
          background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 10px;
          padding: 10px 16px; font-size: 13px; color: #92400E; font-weight: 600;
          margin-bottom: 16px;
        }

        .rm-tabs {
          display: flex; gap: 4px; background: #F3F4F6;
          border-radius: 12px; padding: 4px; margin-bottom: 20px;
        }
        .rm-tab {
          flex: 1; padding: 10px 6px; border-radius: 9px; border: none;
          background: none; cursor: pointer; font-size: 13px; font-weight: 600;
          color: #6B7280; transition: all .15s; font-family: inherit;
        }
        .rm-tab.active { background: #fff; color: #4F46E5; box-shadow: 0 1px 4px rgba(0,0,0,.1); }

        .rm-card {
          background: #fff; border: 1.5px solid #E5E7EB;
          border-radius: 14px; padding: 22px 24px; margin-bottom: 14px;
        }
        .rm-card h4 { margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #374151; }

        .vitals-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .vbox { border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 12px 14px; }
        .vbox label {
          font-size: 10px; font-weight: 700; color: #9CA3AF;
          text-transform: uppercase; letter-spacing: .6px; display: block;
        }
        .vbox input {
          width: 100%; border: none; outline: none; font-size: 18px; font-weight: 700;
          color: #111827; background: transparent; font-family: inherit; margin-top: 4px;
        }
        .vbox input:disabled { color: #6B7280; }
        .vbox .unit { font-size: 11px; color: #9CA3AF; margin-top: 2px; }

        .fg { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
        .fg:last-child { margin-bottom: 0; }
        .fg label { font-size: 13px; font-weight: 600; color: #374151; }
        .fg input, .fg select, .fg textarea {
          border: 1.5px solid #E5E7EB; border-radius: 8px; padding: 10px 12px;
          font-size: 14px; color: #111827; font-family: inherit; outline: none;
          transition: border-color .15s;
        }
        .fg input:focus, .fg select:focus, .fg textarea:focus {
          border-color: #6366F1; box-shadow: 0 0 0 3px #EEF2FF;
        }
        .fg input:disabled, .fg select:disabled, .fg textarea:disabled {
          background: #F9FAFB; color: #6B7280; cursor: default;
        }
        .fg textarea { resize: vertical; min-height: 90px; }

        .icd-wrap { position: relative; }
        .icd-drop {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 50;
          background: #fff; border: 1.5px solid #E5E7EB; border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,.1); max-height: 250px; overflow-y: auto;
        }
        .icd-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; cursor: pointer; font-size: 13px; transition: background .1s;
        }
        .icd-item:hover { background: #F5F3FF; }
        .icd-code {
          background: #EEF2FF; color: #4F46E5; border-radius: 5px;
          padding: 2px 8px; font-size: 11px; font-weight: 700; white-space: nowrap;
        }
        .diag-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
        .diag-chip {
          display: flex; align-items: center; gap: 6px;
          background: #EEF2FF; color: #4338CA; border-radius: 20px;
          padding: 5px 12px; font-size: 12px; font-weight: 600;
        }
        .diag-chip button {
          background: none; border: none; cursor: pointer;
          color: #6366F1; font-size: 15px; line-height: 1; padding: 0;
        }

        .tind-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px; }
        .tind-item {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px;
          cursor: pointer; transition: all .15s; font-size: 13px; color: #374151;
        }
        .tind-item.sel { border-color: #6366F1; background: #EEF2FF; color: #4338CA; font-weight: 600; }
        .tind-item input[type=checkbox] { accent-color: #6366F1; width: 15px; height: 15px; flex-shrink: 0; }

        .resep-card {
          position: relative; border: 1.5px solid #E5E7EB;
          border-radius: 12px; padding: 20px 20px 16px; margin-bottom: 12px;
        }
        .resep-num {
          position: absolute; top: -11px; left: 14px;
          background: #6366F1; color: #fff; border-radius: 10px;
          font-size: 11px; font-weight: 700; padding: 2px 10px;
        }
        .resep-del {
          position: absolute; top: 10px; right: 12px;
          background: none; border: none; cursor: pointer;
          color: #EF4444; font-size: 18px; line-height: 1; padding: 0;
        }
        .r-grid2 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; }
        .r-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px; }

        .btn-add-resep {
          width: 100%; padding: 12px; border: 2px dashed #C7D2FE;
          border-radius: 11px; background: #F5F3FF; color: #6366F1;
          font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
          transition: all .15s;
        }
        .btn-add-resep:hover { background: #EEF2FF; border-color: #6366F1; }

        .rm-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; }
        .btn {
          padding: 11px 26px; border-radius: 9px; font-size: 14px; font-weight: 700;
          cursor: pointer; border: none; transition: all .15s; font-family: inherit;
        }
        .btn-cancel { background: #F3F4F6; color: #374151; }
        .btn-cancel:hover { background: #E5E7EB; }
        .btn-save   { background: #4F46E5; color: #fff; }
        .btn-save:hover   { background: #4338CA; }
        .btn-save:disabled { opacity: .5; cursor: not-allowed; }

        @media (max-width: 640px) {
          .vitals-grid, .tind-grid, .r-grid2, .r-grid3 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="rm" style={{ maxWidth: 880 }}>

        {/* Patient banner */}
        <div className="rm-banner">
          <div>
            <div className="pname">{pasien?.nama ?? '—'}</div>
            <div className="pmeta">
              No. Antrian: {pendaftaran?.no_antrian ?? '-'}&nbsp;·&nbsp;
              {pasien?.jenis_kelamin ?? '-'}
            </div>
          </div>
          <div className="ktag">Keluhan: {pendaftaran?.keluhan ?? existing?.keluhan_utama ?? '-'}</div>
        </div>

        {isReadOnly && (
          <div className="ro-banner">
            ⚠️ Rekam medis untuk kunjungan ini sudah tersimpan — ditampilkan dalam mode baca saja.
          </div>
        )}

        {/* Tabs */}
        <div className="rm-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`rm-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Pemeriksaan ── */}
        {tab === 'pemeriksaan' && (
          <>
            <div className="rm-card">
              <h4>Tanda-Tanda Vital</h4>
              <div className="vitals-grid">
                {[
                  { key: 'tekanan_darah', label: 'Tekanan Darah', unit: 'mmHg', ph: '120/80' },
                  { key: 'nadi',          label: 'Nadi',          unit: 'bpm',  ph: '80'     },
                  { key: 'suhu',          label: 'Suhu',          unit: '°C',   ph: '36.5'   },
                  { key: 'respirasi',     label: 'Respirasi',     unit: 'x/min',ph: '20'     },
                  { key: 'berat_badan',   label: 'Berat Badan',   unit: 'kg',   ph: '60'     },
                  { key: 'tinggi_badan',  label: 'Tinggi Badan',  unit: 'cm',   ph: '165'    },
                ].map(({ key, label, unit, ph }) => (
                  <div className="vbox" key={key}>
                    <label>{label}</label>
                    <input
                      value={form[key]}
                      placeholder={isReadOnly ? '-' : ph}
                      disabled={isReadOnly}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                    <div className="unit">{unit}</div>
                  </div>
                ))}
              </div>
              {isReadOnly && (
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 10, marginBottom: 0 }}>
                  * Data vital signs tersimpan dalam catatan pemeriksaan fisik di bawah.
                </p>
              )}
            </div>

            <div className="rm-card">
              <h4>Anamnesis &amp; Pemeriksaan</h4>
              <div className="fg">
                <label>Keluhan Utama *</label>
                <input
                  value={form.keluhan_utama}
                  disabled={isReadOnly}
                  placeholder="Keluhan utama pasien…"
                  onChange={(e) => setForm((f) => ({ ...f, keluhan_utama: e.target.value }))}
                />
              </div>
              <div className="fg">
                <label>Anamnesis</label>
                <textarea
                  value={form.anamnesis}
                  disabled={isReadOnly}
                  placeholder="Riwayat penyakit, riwayat keluarga, riwayat alergi…"
                  onChange={(e) => setForm((f) => ({ ...f, anamnesis: e.target.value }))}
                />
              </div>
              <div className="fg">
                <label>Pemeriksaan Fisik</label>
                <textarea
                  value={form.pemeriksaan_fisik}
                  disabled={isReadOnly}
                  placeholder="Hasil pemeriksaan fisik…"
                  onChange={(e) => setForm((f) => ({ ...f, pemeriksaan_fisik: e.target.value }))}
                />
              </div>
              <div className="fg">
                <label>Hasil Laboratorium</label>
                <textarea
                  value={form.hasil_laboratorium}
                  disabled={isReadOnly}
                  placeholder="Hasil lab / penunjang jika ada…"
                  onChange={(e) => setForm((f) => ({ ...f, hasil_laboratorium: e.target.value }))}
                />
              </div>
              <div className="fg">
                <label>Catatan Dokter</label>
                <textarea
                  value={form.catatan_dokter}
                  disabled={isReadOnly}
                  placeholder="Catatan tambahan dokter…"
                  onChange={(e) => setForm((f) => ({ ...f, catatan_dokter: e.target.value }))}
                />
              </div>
            </div>
          </>
        )}

        {/* ── TAB: Diagnosis ICD-10 ── */}
        {tab === 'diagnosis' && (
          <div className="rm-card">
            <h4>Diagnosis ICD-10</h4>
            {isReadOnly ? (
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.9 }}>
                {existing?.diagnosis ?? '-'}
              </div>
            ) : (
              <>
                <div className="icd-wrap" ref={dropRef}>
                  <div className="fg" style={{ marginBottom: 0 }}>
                    <label>Cari Kode / Nama Diagnosis</label>
                    <input
                      value={diagSearch}
                      placeholder="Contoh: I10 atau hipertensi…"
                      onChange={(e) => setDiagSearch(e.target.value)}
                      onFocus={() => icd10Results.length && setShowDrop(true)}
                    />
                  </div>
                  {showDrop && icd10Results.length > 0 && (
                    <div className="icd-drop">
                      {icd10Results.map((item) => (
                        <div
                          key={item.code}
                          className="icd-item"
                          onMouseDown={() => {
                            if (!selectedDiag.find((d) => d.code === item.code)) {
                              setSelectedDiag((p) => [...p, item]);
                            }
                            setDiagSearch('');
                            setShowDrop(false);
                          }}
                        >
                          <span className="icd-code">{item.code}</span>
                          <span>{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedDiag.length > 0 ? (
                  <div className="diag-chips">
                    {selectedDiag.map((d) => (
                      <div key={d.code} className="diag-chip">
                        <span>{d.code} – {d.desc}</span>
                        <button
                          onClick={() =>
                            setSelectedDiag((p) => p.filter((x) => x.code !== d.code))
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 10 }}>
                    Belum ada diagnosis dipilih.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── TAB: Tindakan Medis ── */}
        {tab === 'tindakan' && (
          <div className="rm-card">
            <h4>Tindakan Medis</h4>
            {isReadOnly ? (
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.9 }}>
                {existing?.tindakan || '-'}
              </div>
            ) : (
              <div className="tind-grid">
                {TINDAKAN_OPTS.map((t) => {
                  const checked = selectedTind.includes(t);
                  return (
                    <div
                      key={t}
                      className={`tind-item ${checked ? 'sel' : ''}`}
                      onClick={() =>
                        setSelectedTind((p) =>
                          checked ? p.filter((x) => x !== t) : [...p, t]
                        )
                      }
                    >
                      <input type="checkbox" readOnly checked={checked} />
                      {t}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: E-Resep ── */}
        {tab === 'resep' && (
          <>
            {resepList.map((r, idx) => (
              <div className="resep-card" key={r.id}>
                <span className="resep-num">Obat #{idx + 1}</span>
                {!isReadOnly && resepList.length > 1 && (
                  <button className="resep-del" onClick={() => removeResep(r.id)}>×</button>
                )}

                <div className="r-grid2">
                  <div className="fg" style={{ marginBottom: 0 }}>
                    <label>Nama Obat</label>
                    <input
                      value={r.nama_obat}
                      disabled={isReadOnly}
                      placeholder="Nama obat / generik"
                      onChange={(e) => upResep(r.id, 'nama_obat', e.target.value)}
                    />
                  </div>
                  <div className="fg" style={{ marginBottom: 0 }}>
                    <label>Dosis</label>
                    <input
                      value={r.dosis}
                      disabled={isReadOnly}
                      placeholder="500"
                      onChange={(e) => upResep(r.id, 'dosis', e.target.value)}
                    />
                  </div>
                  <div className="fg" style={{ marginBottom: 0 }}>
                    <label>Satuan</label>
                    <select
                      value={r.satuan}
                      disabled={isReadOnly}
                      onChange={(e) => upResep(r.id, 'satuan', e.target.value)}
                    >
                      {SATUAN.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="r-grid3">
                  <div className="fg" style={{ marginBottom: 0 }}>
                    <label>Frekuensi</label>
                    <select
                      value={r.frekuensi}
                      disabled={isReadOnly}
                      onChange={(e) => upResep(r.id, 'frekuensi', e.target.value)}
                    >
                      {FREKUENSI.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="fg" style={{ marginBottom: 0 }}>
                    <label>Waktu Konsumsi</label>
                    <select
                      value={r.waktu}
                      disabled={isReadOnly}
                      onChange={(e) => upResep(r.id, 'waktu', e.target.value)}
                    >
                      {WAKTU.map((w) => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                  <div className="fg" style={{ marginBottom: 0 }}>
                    <label>Durasi (hari)</label>
                    <input
                      value={r.durasi}
                      disabled={isReadOnly}
                      placeholder="5"
                      type="number"
                      min="1"
                      onChange={(e) => upResep(r.id, 'durasi', e.target.value)}
                    />
                  </div>
                </div>

                <div className="fg" style={{ marginTop: 10, marginBottom: 0 }}>
                  <label>Catatan</label>
                  <input
                    value={r.catatan}
                    disabled={isReadOnly}
                    placeholder="Catatan khusus (opsional)"
                    onChange={(e) => upResep(r.id, 'catatan', e.target.value)}
                  />
                </div>
              </div>
            ))}

            {!isReadOnly && (
              <button className="btn-add-resep" onClick={addResep}>+ Tambah Obat</button>
            )}
          </>
        )}

        {/* Action bar */}
        <div className="rm-actions" style={{ marginTop: 20 }}>
          <button className="btn btn-cancel" onClick={() => navigate('/dokter/antrian')}>
            {isReadOnly ? 'Kembali' : 'Batal'}
          </button>
          {!isReadOnly && (
            <button className="btn btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan…' : '💾 Simpan & Selesai'}
            </button>
          )}
        </div>

      </div>
    </DokterLayout>
  );
}