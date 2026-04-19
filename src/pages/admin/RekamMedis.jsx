import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import rekamMedisService from '../../services/rekam-medis-service';
import pendaftaranService from '../../services/pendaftaran-service';
import apiService from '../../services/api-service';

// ===================== MODAL FORM =====================
function ModalForm({ mode, data, onClose, onSave }) {
  const [pasienList, setPasienList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [form, setForm] = useState({
    pasien_id: data?.pasien_id ? String(data.pasien_id) : '',
    dokter_id: data?.dokter_id ? String(data.dokter_id) : '',
    pendaftaran_id:     data?.pendaftaran_id     ?? '',
    tanggal_kunjungan: data?.tanggal_kunjungan
  ? String(data.tanggal_kunjungan).split('T')[0]
  : '',
    keluhan_utama:      data?.keluhan_utama      ?? '',
    diagnosis:          data?.diagnosis          ?? '',
    anamnesis:          data?.anamnesis          ?? '',
    pemeriksaan_fisik:  data?.pemeriksaan_fisik  ?? '',
    hasil_laboratorium: data?.hasil_laboratorium ?? '',
    resep:              data?.resep              ?? '',
    tindakan:           data?.tindakan           ?? '',
    catatan_dokter:     data?.catatan_dokter     ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Ambil daftar pasien dan dokter untuk dropdown
    apiService.get('/admin/pasien').then(r => setPasienList(r.data?.data || []));
    apiService.get('/admin/dokter').then(r => setDokterList(r.data?.data || []));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async () => {
  setSaving(true);
  try {
    const payload = {
      ...form,
      pasien_id: Number(form.pasien_id),
      dokter_id: Number(form.dokter_id),
      pendaftaran_id: form.pendaftaran_id ? Number(form.pendaftaran_id) : null,
    };

    console.log('ID yang diedit:', data?.id);
    console.log('Payload dikirim:', JSON.stringify(payload, null, 2));

    if (mode === 'add') {
      await rekamMedisService.create(payload);
    } else {
      const updateResult = await rekamMedisService.update(Number(data.id), payload);
      console.log('Update result:', updateResult);
    }
    onSave();
  } catch (err) {
    console.error('Status:', err?.response?.status);
    console.error('Message:', err?.response?.data?.message);
    console.error('Errors:', JSON.stringify(err?.response?.data?.errors, null, 2));
    setErrors(err?.response?.data?.errors || {});
  } finally {
    setSaving(false);
  }
};

  return (
    <div style={overlayStyle}>
  <div style={modalStyle}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    }}>
      <h2 style={{ margin: 0, fontSize: '18px' }}>
        {mode === 'add'
          ? '➕ Tambah Rekam Medis'
          : '✏️ Edit Rekam Medis'}
      </h2>

      <button
        onClick={onClose}
        style={btnCloseStyle}
        type="button"
      >
        ✕
      </button>
    </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Pasien */}
          <div style={fieldGroup}>
            <label style={labelStyle}>Pasien *</label>
            <select name="pasien_id" value={form.pasien_id} onChange={handleChange} style={inputStyle}>
              <option value="">-- Pilih Pasien --</option>
              {pasienList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
            {errors.pasien_id && <span style={errStyle}>{errors.pasien_id[0]}</span>}
          </div>

          {/* Dokter */}
          <div style={fieldGroup}>
            <label style={labelStyle}>Dokter *</label>
            <select name="dokter_id" value={form.dokter_id} onChange={handleChange} style={inputStyle}>
              <option value="">-- Pilih Dokter --</option>
              {dokterList.map(d => <option key={d.id} value={d.id}>{d.nama} - {d.spesialisasi}</option>)}
            </select>
            {errors.dokter_id && <span style={errStyle}>{errors.dokter_id[0]}</span>}
          </div>

          {/* Tanggal Kunjungan */}
          <div style={fieldGroup}>
            <label style={labelStyle}>Tanggal Kunjungan *</label>
            <input type="date" name="tanggal_kunjungan" value={form.tanggal_kunjungan} onChange={handleChange} style={inputStyle} />
            {errors.tanggal_kunjungan && <span style={errStyle}>{errors.tanggal_kunjungan[0]}</span>}
          </div>

          {/* Pendaftaran ID */}
          <div style={fieldGroup}>
            <label style={labelStyle}>ID Pendaftaran</label>
            <input type="number" name="pendaftaran_id" value={form.pendaftaran_id} onChange={handleChange} style={inputStyle} placeholder="Opsional" />
          </div>

          {/* Keluhan Utama */}
          <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Keluhan Utama *</label>
            <textarea name="keluhan_utama" value={form.keluhan_utama} onChange={handleChange} style={textareaStyle} rows={2} />
            {errors.keluhan_utama && <span style={errStyle}>{errors.keluhan_utama[0]}</span>}
          </div>

          {/* Diagnosis */}
          <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Diagnosis *</label>
            <textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} style={textareaStyle} rows={2} />
            {errors.diagnosis && <span style={errStyle}>{errors.diagnosis[0]}</span>}
          </div>

          {/* Anamnesis */}
          <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Anamnesis</label>
            <textarea name="anamnesis" value={form.anamnesis} onChange={handleChange} style={textareaStyle} rows={2} />
          </div>

          {/* Pemeriksaan Fisik */}
          <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Pemeriksaan Fisik</label>
            <textarea name="pemeriksaan_fisik" value={form.pemeriksaan_fisik} onChange={handleChange} style={textareaStyle} rows={2} />
          </div>

          {/* Hasil Lab */}
          <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Hasil Laboratorium</label>
            <textarea name="hasil_laboratorium" value={form.hasil_laboratorium} onChange={handleChange} style={textareaStyle} rows={2} />
          </div>

          {/* Resep */}
          <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Resep</label>
            <textarea name="resep" value={form.resep} onChange={handleChange} style={textareaStyle} rows={2} />
          </div>

          {/* Tindakan */}
          <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Tindakan</label>
            <textarea name="tindakan" value={form.tindakan} onChange={handleChange} style={textareaStyle} rows={2} />
          </div>

          {/* Catatan Dokter */}
          <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Catatan Dokter</label>
            <textarea name="catatan_dokter" value={form.catatan_dokter} onChange={handleChange} style={textareaStyle} rows={2} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Batal</button>
          <button onClick={handleSubmit} disabled={saving} style={btnPrimaryStyle}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== MODAL DETAIL =====================
function ModalDetail({ data, onClose }) {
  const rows = [
    ['Pasien',              data.pasien?.nama],
    ['Dokter',              data.dokter?.nama + (data.dokter?.spesialisasi ? ` (${data.dokter.spesialisasi})` : '')],
    ['Tanggal Kunjungan',   data.tanggal_kunjungan],
    ['Keluhan Utama',       data.keluhan_utama],
    ['Diagnosis',           data.diagnosis],
    ['Anamnesis',           data.anamnesis],
    ['Pemeriksaan Fisik',   data.pemeriksaan_fisik],
    ['Hasil Laboratorium',  data.hasil_laboratorium],
    ['Resep',               data.resep],
    ['Tindakan',            data.tindakan],
    ['Catatan Dokter',      data.catatan_dokter],
  ];

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>🔍 Detail Rekam Medis</h2>
          <button onClick={onClose} style={btnCloseStyle}>✕</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '8px 12px', fontWeight: '600', color: '#6B7280', width: '35%', fontSize: '13px' }}>{label}</td>
                <td style={{ padding: '8px 12px', fontSize: '14px', color: '#111827' }}>{value || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN PAGE =====================
export default function RekamMedis() {
  const [activeTab, setActiveTab] = useState('rekamMedis');

  const [rekamMedisData, setRekamMedisData] = useState([]);
  const [antrianData,    setAntrianData]    = useState([]);
  const [riwayatData,    setRiwayatData]    = useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Modal state
  const [modalForm,   setModalForm]   = useState(null); // { mode: 'add'|'edit', data }
  const [modalDetail, setModalDetail] = useState(null); // data item
  const [deleteId,    setDeleteId]    = useState(null);
  const [deleting,    setDeleting]    = useState(false);

  const fetchData = async (tab = activeTab) => {
  setLoading(true);
  setError(null);
  try {
    if (tab === 'rekamMedis') {
  const result = await rekamMedisService.getAll();
  const items = result.data ?? result.rekam_medis ?? result;
  // Spread array baru agar React mendeteksi perubahan
  setRekamMedisData([...( Array.isArray(items) ? items : [] )]);

    } else if (tab === 'antrian') {
      const result = await pendaftaranService.getAll();
      const semua  = result.data || result;
      setAntrianData(semua.filter(p =>
        ['pending', 'confirmed', 'checked_in'].includes(p.status)
      ));

    } else if (tab === 'riwayat') {
      const result = await pendaftaranService.getAll();
      const semua  = result.data || result;
      setRiwayatData(semua.filter(p =>
        ['completed', 'cancelled'].includes(p.status)
      ));
    }
  } catch (err) {
    setError(err.message || 'Gagal mengambil data');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  const handleDelete = async () => {
  if (deleteId === null) return;

  setDeleting(true);
  try {
    await rekamMedisService.delete(deleteId);

    // 🔥 langsung hapus dari state (tanpa fetch ulang)
    setRekamMedisData(prev =>
      prev.filter(item => item.id !== deleteId)
    );

    setDeleteId(null);

  } catch (err) {
    console.error(err);
    alert('Gagal menghapus data');
  } finally {
    setDeleting(false);
  }
};

  const statusBadge = (status) => {
    const map = {
      pending:    { label: 'Menunggu',     bg: '#FEF3C7', color: '#92400E' },
      confirmed:  { label: 'Dikonfirmasi', bg: '#DBEAFE', color: '#1E40AF' },
      checked_in: { label: 'Hadir',        bg: '#D1FAE5', color: '#065F46' },
      completed:  { label: 'Selesai',      bg: '#E0E7FF', color: '#3730A3' },
      cancelled:  { label: 'Dibatalkan',   bg: '#FEE2E2', color: '#991B1B' },
    };
    const s = map[status] || { label: status, bg: '#F3F4F6', color: '#374151' };
    return (
      <span style={{ backgroundColor: s.bg, color: s.color, padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
        {s.label}
      </span>
    );
  };

  return (
    <AdminLayout title="Rekam Medis">

      {/* MODAL FORM TAMBAH/EDIT */}
      {modalForm && (
  <ModalForm
    mode={modalForm.mode}
    data={modalForm.data}
    onClose={() => setModalForm(null)}
    onSave={async () => {
    setModalForm(null);

    setTimeout(async () => {
      await fetchData('rekamMedis');
    }, 300);
  }}
  />
)}

      {/* MODAL DETAIL */}
      {modalDetail && (
        <ModalDetail data={modalDetail} onClose={() => setModalDetail(null)} />
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteId !== null && (
  <div style={overlayStyle}>
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '28px',
      width: '360px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
      <h3>Hapus Rekam Medis?</h3>
      <p style={{ color: '#6B7280' }}>
        Data tidak bisa dikembalikan
      </p>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={() => setDeleteId(null)} style={btnSecondaryStyle}>
          Batal
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ ...btnPrimaryStyle, backgroundColor: '#EF4444' }}
        >
          {deleting ? 'Menghapus...' : 'Ya, Hapus'}
        </button>
      </div>
    </div>
  </div>
)}

      {/* TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #E5E7EB' }}>
        {[
          { key: 'rekamMedis', label: '🗂️ Rekam Medis' },
          { key: 'antrian',    label: '🕐 Antrian Aktif' },
          { key: 'riwayat',    label: '📋 Riwayat Kunjungan' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', border: 'none', cursor: 'pointer',
            fontWeight: activeTab === tab.key ? '700' : '400',
            borderBottom: activeTab === tab.key ? '3px solid #3B82F6' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === tab.key ? '#3B82F6' : '#6B7280',
            fontSize: '14px', marginBottom: '-2px',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Memuat data...</p>}
      {error   && <div style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>⚠️ {error}</div>}

      {/* ==================== TAB: REKAM MEDIS ==================== */}
      {!loading && !error && activeTab === 'rekamMedis' && (
        <div>
          {/* Header + Tombol Tambah */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
              Total: <strong>{rekamMedisData.length}</strong> data rekam medis
            </p>
            <button onClick={() => setModalForm({ mode: 'add', data: null })} style={btnPrimaryStyle}>
              ➕ Tambah Rekam Medis
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB' }}>
                  <th style={thStyle}>No</th>
                  <th style={thStyle}>Pasien</th>
                  <th style={thStyle}>Dokter</th>
                  <th style={thStyle}>Spesialisasi</th>
                  <th style={thStyle}>Tanggal Kunjungan</th>
                  <th style={thStyle}>Diagnosis</th>
                  <th style={thStyle}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rekamMedisData.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Tidak ada data rekam medis</td></tr>
                ) : (
                  rekamMedisData.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '600' }}>{item.pasien?.nama ?? '-'}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.pasien?.no_pendaftaran ?? ''}</div>
                      </td>
                      <td style={tdStyle}>{item.dokter?.nama ?? '-'}</td>
                      <td style={tdStyle}>
                        <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '999px', fontSize: '12px' }}>
                          {item.dokter?.spesialisasi ?? '-'}
                        </span>
                      </td>
                      <td style={tdStyle}>{item.tanggal_kunjungan ?? '-'}</td>
                      <td style={tdStyle}>{item.diagnosis ?? '-'}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setModalDetail(item)} style={btnActionStyle('#3B82F6')}>🔍 Detail</button>
                          <button onClick={() => setModalForm({ mode: 'edit', data: item })} style={btnActionStyle('#F59E0B')}>✏️ Edit</button>
                          <button onClick={() => setDeleteId(Number(item.id))} style={btnActionStyle('#EF4444')}>🗑️ Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB: ANTRIAN ==================== */}
      {!loading && !error && activeTab === 'antrian' && (
        <div style={{ overflowX: 'auto' }}>
          <p style={{ color: '#6B7280', marginBottom: '12px', fontSize: '14px' }}>
            Total antrian aktif: <strong>{antrianData.length}</strong>
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                <th style={thStyle}>No Antrian</th>
                <th style={thStyle}>Pasien</th>
                <th style={thStyle}>Dokter</th>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>Jam Kunjungan</th>
                <th style={thStyle}>Keluhan</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {antrianData.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Tidak ada antrian aktif saat ini</td></tr>
              ) : (
                antrianData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ ...tdStyle, fontWeight: '700', color: '#3B82F6' }}>{item.no_antrian ?? '-'}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '600' }}>{item.pasien?.nama ?? '-'}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.pasien?.no_pendaftaran ?? ''}</div>
                    </td>
                    <td style={tdStyle}>
                      <div>{item.dokter?.nama ?? '-'}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.dokter?.spesialisasi ?? ''}</div>
                    </td>
                    <td style={tdStyle}>{item.tanggal_pendaftaran ?? '-'}</td>
                    <td style={tdStyle}>{item.jam_kunjungan ?? '-'}</td>
                    <td style={tdStyle}>{item.keluhan ?? '-'}</td>
                    <td style={tdStyle}>{statusBadge(item.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== TAB: RIWAYAT ==================== */}
      {!loading && !error && activeTab === 'riwayat' && (
        <div style={{ overflowX: 'auto' }}>
          <p style={{ color: '#6B7280', marginBottom: '12px', fontSize: '14px' }}>
            Total riwayat: <strong>{riwayatData.length}</strong> kunjungan
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                <th style={thStyle}>No Antrian</th>
                <th style={thStyle}>Pasien</th>
                <th style={thStyle}>Dokter</th>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>Jam Kunjungan</th>
                <th style={thStyle}>Keluhan</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {riwayatData.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Tidak ada riwayat kunjungan</td></tr>
              ) : (
                riwayatData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={tdStyle}>{item.no_antrian ?? '-'}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '600' }}>{item.pasien?.nama ?? '-'}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.pasien?.no_pendaftaran ?? ''}</div>
                    </td>
                    <td style={tdStyle}>
                      <div>{item.dokter?.nama ?? '-'}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.dokter?.spesialisasi ?? ''}</div>
                    </td>
                    <td style={tdStyle}>{item.tanggal_pendaftaran ?? '-'}</td>
                    <td style={tdStyle}>{item.jam_kunjungan ?? '-'}</td>
                    <td style={tdStyle}>{item.keluhan ?? '-'}</td>
                    <td style={tdStyle}>{statusBadge(item.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </AdminLayout>
  );
}

// ===================== STYLES =====================
const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #D1D5DB', fontSize: '13px', color: '#374151' };
const tdStyle = { padding: '10px 16px', verticalAlign: 'top', fontSize: '14px', color: '#374151' };
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { background: '#fff', borderRadius: '12px', padding: '28px', width: '700px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' };
const textareaStyle = { ...inputStyle, resize: 'vertical', fontFamily: 'inherit' };
const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#374151' };
const fieldGroup = { display: 'flex', flexDirection: 'column' };
const errStyle = { color: '#EF4444', fontSize: '12px', marginTop: '2px' };
const btnPrimaryStyle = { padding: '8px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };
const btnSecondaryStyle = { padding: '8px 18px', backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };
const btnCloseStyle = { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6B7280' };
const btnActionStyle = (color) => ({ padding: '4px 10px', backgroundColor: color, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' });