import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../api/axios';

export default function DaftarBerobat(){
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({ doctorId: '', scheduleId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get('/admin/dokter');
        setDoctors(res.data);
      } catch (err) {
        console.error('Error fetching doctors', err);
      }
    };
    fetchDoctors();
  }, []);

  const handleDoctorChange = async (e) => {
    const id = e.target.value;
    setFormData(prev => ({ ...prev, doctorId: id, scheduleId: '' }));
    if (id) {
      try {
        const res = await axiosInstance.get(`/admin/jadwal?doctorId=${id}`);
        setSchedules(res.data);
      } catch (err) {
        console.error('Error fetching schedules', err);
        setSchedules([]);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.post('/pasien/appointments', formData);
      alert('Pendaftaran berhasil');
      setFormData({ doctorId: '', scheduleId: '' });
      setSchedules([]);
    } catch (err) {
      console.error('Error creating appointment', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Daftar Berobat</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="doctorId">Dokter</label>
            <select id="doctorId" name="doctorId" value={formData.doctorId} onChange={handleDoctorChange} required>
              <option value="">-- Pilih dokter --</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="scheduleId">Jadwal</label>
            <select id="scheduleId" name="scheduleId" value={formData.scheduleId} onChange={handleChange} required disabled={!schedules.length}>
              <option value="">-- Pilih jadwal --</option>
              {schedules.map(s => (
                <option key={s.id} value={s.id}>{s.day} {s.startTime}-{s.endTime}</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={saving || !formData.doctorId || !formData.scheduleId}>
              {saving ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
