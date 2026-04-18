import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import authService from '../../services/auth-service';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import defaultAvatar from '../../assets/images/default-profile-avatar.svg';

const extractPayload = (body) => {
  if (body == null) return null;
  if (typeof body !== 'object') return body;
  return body?.data?.data ?? body?.data ?? body;
};

function resolveProfilePhotoUrl(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const u = r.foto_url ?? r.photo_url ?? r.avatar_url ?? r.foto ?? r.avatar;
  if (u == null || u === '') return '';
  const s = String(u);
  if (s.startsWith('http') || s.startsWith('data:') || s.startsWith('blob:')) return s;
  const base = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(
    /\/api\/?$/,
    ''
  );
  return `${base}${s.startsWith('/') ? '' : '/'}${s}`;
}

const profileCardStyle = {
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
  border: '1px solid #e5e7eb',
};

export default function Profil() {
  const { user, login } = useAuth();
  const isPasien = user?.role === 'pasien';
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [serverPhotoUrl, setServerPhotoUrl] = useState('');

  const profileStorageKey = useMemo(() => {
    const id = user?.id || user?.email || user?.name || user?.nama || 'default';
    return `profile-photo:${id}`;
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (isPasien) {
          const res = await axiosInstance.get('/pasien/profile');
          const userData = extractPayload(res.data);
          setProfile(userData);
          setServerPhotoUrl(resolveProfilePhotoUrl(userData));
          setFormData({
            name: userData?.name || userData?.nama || '',
            email: userData?.email || '',
            phone:
              userData?.phone ||
              userData?.telepon ||
              userData?.no_telepon ||
              userData?.no_hp ||
              '',
          });
        } else {
          const res = await authService.getCurrentUser();
          const userData = res.data || res.user || res;
          setProfile(userData);
          setServerPhotoUrl('');
          setFormData({
            name: userData.name || userData.nama || '',
            email: userData.email || '',
            phone:
              userData.phone ||
              userData.telepon ||
              userData.no_telepon ||
              userData.no_hp ||
              '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isPasien]);

  useEffect(() => {
    if (isPasien) {
      setPhotoDataUrl('');
      return;
    }
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) setPhotoDataUrl(saved);
    } catch {
      /* noop */
    }
  }, [profileStorageKey, isPasien]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar.' });
      return;
    }
    if (isPasien) {
      setSaving(true);
      setMessage(null);
      try {
        const fd = new FormData();
        fd.append('photo', file);
        await axiosInstance.post('/pasien/profile/photo', fd, {
          transformRequest: [(data, headers) => {
            if (data instanceof FormData) delete headers['Content-Type'];
            return data;
          }],
        });
        const res = await axiosInstance.get('/pasien/profile');
        const userData = extractPayload(res.data);
        setProfile(userData);
        setServerPhotoUrl(resolveProfilePhotoUrl(userData));
        setMessage({ type: 'success', text: 'Foto profil berhasil diunggah.' });
      } catch (err) {
        console.error('Error uploading photo', err);
        setMessage({
          type: 'error',
          text: err.response?.data?.message || 'Gagal mengunggah foto profil.',
        });
      } finally {
        setSaving(false);
      }
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setPhotoDataUrl(result);
      try {
        localStorage.setItem(profileStorageKey, result);
      } catch {
        setMessage({ type: 'error', text: 'Foto terlalu besar untuk disimpan lokal.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (isPasien) return;
    setPhotoDataUrl('');
    try {
      localStorage.removeItem(profileStorageKey);
    } catch {
      /* noop */
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...formData,
        name: formData.name,
        nama: formData.name,
        phone: formData.phone,
        telepon: formData.phone,
        no_telepon: formData.phone,
      };
      if (isPasien) {
        const res = await axiosInstance.put('/pasien/profile', payload);
        const updatedUser = extractPayload(res.data);
        setProfile(updatedUser);
        setServerPhotoUrl(resolveProfilePhotoUrl(updatedUser));
        login(
          {
            ...user,
            ...(updatedUser && typeof updatedUser === 'object' ? updatedUser : {}),
            nama: formData.name,
            name: formData.name,
            email: formData.email,
            telepon: formData.phone,
            phone: formData.phone,
          },
          user.role
        );
        setEditMode(false);
        setMessage({
          type: 'success',
          text: 'Profil berhasil diperbarui.',
        });
      } else {
        const res = await authService.updateProfile(payload);
        const updatedUser = res.data || res.user || res;
        setProfile(updatedUser);
        login(updatedUser, user.role);
        setEditMode(false);
        setMessage({
          type: 'success',
          text: 'Profil berhasil diperbarui. Foto profil disimpan lokal di browser ini, bukan di database.',
        });
      }
    } catch (err) {
      console.error('Error saving profile', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal memperbarui profil',
      });
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = isPasien
    ? serverPhotoUrl || defaultAvatar
    : photoDataUrl || defaultAvatar;

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Profil Pengguna</h1>
        
        {message && (
          <div className={`alert alert-${message.type}`} style={{ padding: '10px', marginBottom: '15px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
            {message.text}
          </div>
        )}

        {loading ? (
          <p>Memuat profil...</p>
        ) : (
          profile && (
            <div style={{ ...profileCardStyle, maxWidth: '920px', padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
                <div>
                  <div style={{ textAlign: 'center', borderRight: '1px solid #eef2f7', paddingRight: '24px' }}>
                    <img
                      src={avatarSrc}
                      alt="Foto profil"
                      style={{ width: '148px', height: '148px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #e5eef9' }}
                    />
                    <h3 style={{ margin: '14px 0 6px', color: '#1f2937' }}>{formData.name || 'Pengguna'}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{formData.email || 'Email belum tersedia'}</p>
                    <div style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
                      <label
                        htmlFor="profile-photo"
                        style={{ padding: '10px 14px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '10px', cursor: saving ? 'wait' : 'pointer', fontWeight: 600 }}
                      >
                        {isPasien && saving ? 'Mengunggah…' : 'Pilih foto'}
                      </label>
                      <input
                        id="profile-photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        disabled={saving}
                        style={{ display: 'none' }}
                      />
                      {!isPasien && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          style={{ padding: '10px 14px', background: '#fff1f2', color: '#be123c', borderRadius: '10px', border: '1px solid #fecdd3', cursor: 'pointer' }}
                        >
                          Hapus foto
                        </button>
                      )}
                      <small style={{ color: '#6b7280', lineHeight: 1.5 }}>
                        {isPasien
                          ? 'Foto profil disimpan di server setelah unggah.'
                          : 'Foto profil disimpan lokal di browser ini. Tidak dikirim ke database.'}
                      </small>
                    </div>
                  </div>
                </div>

                <form className="form" onSubmit={handleSave}>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Nama</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!editMode || saving}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editMode || saving}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px' }}>Telepon</label>
                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editMode || saving}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div style={{ marginBottom: '18px', padding: '16px', background: '#f8fafc', borderRadius: '12px', color: '#475569' }}>
                    <strong>Info:</strong>{' '}
                    {isPasien
                      ? 'Data profil disimpan ke akun pasien Anda. Foto dapat diunggah terpisah.'
                      : 'Nama, email, dan telepon disimpan ke backend. Foto profil hanya disimpan lokal di browser ini.'}
                  </div>
                  <div className="form-actions" style={{ marginTop: '20px' }}>
                    {editMode ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '10px 18px', background: '#007bff', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                          {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)} disabled={saving} style={{ padding: '10px 18px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-primary" onClick={() => setEditMode(true)} style={{ padding: '10px 18px', background: '#007bff', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                        Ubah Profil
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
