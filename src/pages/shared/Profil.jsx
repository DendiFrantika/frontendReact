import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import authService from '../../services/auth-service';
import { useAuth } from '../../context/AuthContext';

export default function Profil() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await authService.getCurrentUser();
        const userData = res.data || res.user || res;
        setProfile(userData);
        setFormData({
          name: userData.name || userData.nama || '',
          email: userData.email || '',
          phone: userData.phone || userData.telepon || ''
        });
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await authService.updateProfile(formData);
      const updatedUser = res.data || res.user || res;
      setProfile(updatedUser);
      login(updatedUser, user.role); // Update context
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
    } catch (err) {
      console.error('Error saving profile', err);
      setMessage({ type: 'error', text: 'Gagal memperbarui profil' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Profil Pengguna</h1>
        
        {message && (
          <div className={`alert alert-${message.type}`} style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
            {message.text}
          </div>
        )}

        {loading ? (
          <p>Memuat profil...</p>
        ) : (
          profile && (
            <form className="form" onSubmit={handleSave} style={{ maxWidth: '500px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
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
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
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
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div className="form-actions" style={{ marginTop: '20px' }}>
                {editMode ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)} disabled={saving} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Batal
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => setEditMode(true)} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Ubah Profil
                  </button>
                )}
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}
