import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const cardStyle = {
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
  border: '1px solid #e5e7eb',
  maxWidth: '680px',
  padding: '32px',
  marginBottom: '24px',
};

const inputStyle = (disabled) => ({
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  background: disabled ? '#f9fafb' : '#fff',
  fontSize: '14px',
  boxSizing: 'border-box',
});

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 600,
  color: '#374151',
  fontSize: '14px',
};

export default function Profil() {
  const { user, login } = useAuth();

  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [editMode,  setEditMode]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [message,   setMessage]   = useState(null);

  const [formData, setFormData] = useState({
    nama: '', email: '', no_telepon: '', alamat: '',
    tanggal_lahir: '', jenis_kelamin: '', golongan_darah: '',
    no_identitas: '', no_pendaftaran: '',
    status_pernikahan: '', pekerjaan: '',
    berat_badan: '', tinggi_badan: '', alergi: '',
  });

  const [pwForm,   setPwForm]   = useState({ password_lama: '', password_baru: '', password_baru_confirmation: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState(null);
  const [pwMode,   setPwMode]   = useState(false);

  // ── Fetch profil ──
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/pasien/profile');
        const d = res.data?.data ?? res.data;
        setProfile(d);
        setFormData({
          nama:              d?.nama             ?? '',
          email:             d?.email            ?? '',
          no_telepon:        d?.no_telepon       ?? '',
          alamat:            d?.alamat           ?? '',
          tanggal_lahir:     d?.tanggal_lahir?.substring(0, 10) ?? '',
          jenis_kelamin:     d?.jenis_kelamin    ?? '',
          golongan_darah:    d?.golongan_darah   ?? '',
          no_identitas:      d?.no_identitas     ?? '',
          no_pendaftaran:    d?.no_pendaftaran   ?? '',
          status_pernikahan: d?.status_pernikahan ?? '',
          pekerjaan:         d?.pekerjaan        ?? '',
          berat_badan:       d?.berat_badan      ?? '',
          tinggi_badan:      d?.tinggi_badan     ?? '',
          alergi:            d?.alergi           ?? '',
        });
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Simpan profil ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await axiosInstance.put('/pasien/profile', {
        nama:              formData.nama,
        no_telepon:        formData.no_telepon,
        alamat:            formData.alamat,
        status_pernikahan: formData.status_pernikahan,
        pekerjaan:         formData.pekerjaan,
        berat_badan:       formData.berat_badan  || null,
        tinggi_badan:      formData.tinggi_badan || null,
        alergi:            formData.alergi,
      });
      const updated = res.data?.data ?? res.data;
      setProfile(updated);
      login({ ...user, nama: formData.nama, name: formData.nama }, user.role);
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui profil.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Ubah password ──
  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.password_baru !== pwForm.password_baru_confirmation) {
      setPwMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await axiosInstance.post('/auth/change-password', {
        current_password:      pwForm.password_lama,
        password:              pwForm.password_baru,
        password_confirmation: pwForm.password_baru_confirmation,
      });
      setPwMsg({ type: 'success', text: 'Password berhasil diubah.' });
      setPwForm({ password_lama: '', password_baru: '', password_baru_confirmation: '' });
      setPwMode(false);
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Gagal mengubah password.' });
    } finally {
      setPwSaving(false);
    }
  };

  const Alert = ({ msg }) => msg ? (
    <div style={{
      padding: '10px 14px', marginBottom: '16px', borderRadius: '8px',
      backgroundColor: msg.type === 'success' ? '#d4edda' : '#f8d7da',
      color: msg.type === 'success' ? '#155724' : '#721c24',
      fontSize: '14px',
    }}>
      {msg.text}
    </div>
  ) : null;

  const Field = ({ label, name, type = 'text', disabled, children }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      {children ?? (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          disabled={disabled}
          style={inputStyle(disabled)}
        />
      )}
    </div>
  );

  if (loading) return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content"><p>Memuat profil...</p></div>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Profil Pasien</h1>

        {/* ── CARD DATA PROFIL ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <h2 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>{formData.nama || 'Pasien'}</h2>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
                {formData.no_pendaftaran && <span style={{ marginRight: '12px' }}>No. Pendaftaran: {formData.no_pendaftaran}</span>}
                {formData.email}
              </p>
            </div>
            {!editMode && (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >
                Ubah Profil
              </button>
            )}
          </div>

          <Alert msg={message} />

          <form onSubmit={handleSave}>
            {/* Data yang bisa diedit */}
            <p style={{ fontWeight: 700, color: '#374151', marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Pribadi</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Field label="Nama Lengkap" name="nama" disabled={!editMode || saving} />
              <Field label="No. Telepon" name="no_telepon" disabled={!editMode || saving} />
              <Field label="Jenis Kelamin" name="jenis_kelamin" disabled>
                <input value={formData.jenis_kelamin || '-'} disabled style={inputStyle(true)} />
              </Field>
              <Field label="Tanggal Lahir" name="tanggal_lahir" type="date" disabled>
                <input value={formData.tanggal_lahir || '-'} disabled style={inputStyle(true)} />
              </Field>
              <Field label="Golongan Darah" name="golongan_darah" disabled>
                <input value={formData.golongan_darah || '-'} disabled style={inputStyle(true)} />
              </Field>
              <Field label="No. Identitas" name="no_identitas" disabled>
                <input value={formData.no_identitas || '-'} disabled style={inputStyle(true)} />
              </Field>
            </div>

            <Field label="Alamat" name="alamat" disabled={!editMode || saving}>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                disabled={!editMode || saving}
                rows={2}
                style={{ ...inputStyle(!editMode || saving), resize: 'vertical' }}
              />
            </Field>

            <p style={{ fontWeight: 700, color: '#374151', margin: '20px 0 12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Informasi Tambahan</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Field label="Status Pernikahan" name="status_pernikahan" disabled={!editMode || saving}>
                <select name="status_pernikahan" value={formData.status_pernikahan} onChange={handleChange} disabled={!editMode || saving} style={inputStyle(!editMode || saving)}>
                  <option value="">— Pilih —</option>
                  <option value="Belum Menikah">Belum Menikah</option>
                  <option value="Menikah">Menikah</option>
                  <option value="Cerai">Cerai</option>
                </select>
              </Field>
              <Field label="Pekerjaan" name="pekerjaan" disabled={!editMode || saving} />
              <Field label="Berat Badan (kg)" name="berat_badan" type="number" disabled={!editMode || saving} />
              <Field label="Tinggi Badan (cm)" name="tinggi_badan" type="number" disabled={!editMode || saving} />
            </div>

            <Field label="Alergi" name="alergi" disabled={!editMode || saving}>
              <textarea
                name="alergi"
                value={formData.alergi}
                onChange={handleChange}
                disabled={!editMode || saving}
                rows={2}
                style={{ ...inputStyle(!editMode || saving), resize: 'vertical' }}
                placeholder="Contoh: penisilin, seafood..."
              />
            </Field>

            {editMode && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" disabled={saving} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setEditMode(false)} disabled={saving} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  Batal
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ── CARD UBAH PASSWORD ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pwMode ? '20px' : 0 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>Ubah Password</h2>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Ganti password akun Anda</p>
            </div>
            {!pwMode && (
              <button
                type="button"
                onClick={() => setPwMode(true)}
                style={{ padding: '8px 18px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >
                Ubah Password
              </button>
            )}
          </div>

          {pwMode && (
            <form onSubmit={handlePwSave}>
              <Alert msg={pwMsg} />
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password Lama</label>
                <input type="password" name="password_lama" value={pwForm.password_lama} onChange={handlePwChange} required style={inputStyle(false)} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password Baru</label>
                <input type="password" name="password_baru" value={pwForm.password_baru} onChange={handlePwChange} required minLength={6} style={inputStyle(false)} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Konfirmasi Password Baru</label>
                <input type="password" name="password_baru_confirmation" value={pwForm.password_baru_confirmation} onChange={handlePwChange} required style={inputStyle(false)} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={pwSaving} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  {pwSaving ? 'Menyimpan...' : 'Simpan Password'}
                </button>
                <button type="button" onClick={() => { setPwMode(false); setPwMsg(null); }} disabled={pwSaving} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}