import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';

export default function Profil(){
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/pasien/profile');
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || ''
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
    try {
      const res = await axiosInstance.put('/pasien/profile', formData);
      setProfile(res.data);
      setEditMode(false);
    } catch (err) {
      console.error('Error saving profile', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Profil Pasien</h1>
        {loading ? (
          <p>Memuat profil...</p>
        ) : (
          profile && (
            <form className="form" onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="name">Nama</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editMode || saving}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editMode || saving}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telepon</label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editMode || saving}
                />
              </div>
              <div className="form-actions">
                {editMode ? (
                  <>
                    <button type="submit" className="btn primary" disabled={saving}>
                      Simpan
                    </button>
                    <button type="button" className="btn" onClick={() => setEditMode(false)} disabled={saving}>
                      Batal
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn" onClick={() => setEditMode(true)}>
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
