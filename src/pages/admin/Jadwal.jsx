'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminCrudModal from '../../components/AdminCrudModal';
import {
  normalizeErrorMessage,
  normalizeFieldErrors,
  requestWithFallback,
  unpackCollection,
} from '../../services/adminCrudApi';
import { validateJadwalForm } from '../../services/adminMasterValidation';
import './Jadwal.css';

export default function Jadwal() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('hari');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    dokter_id: '',
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    kapasitas: 10
  });

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await requestWithFallback([
        { method: 'get', url: '/admin/dokter' },
        { method: 'get', url: '/dokter' },
      ]);
      setDoctors(unpackCollection(res.data));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await requestWithFallback([
        { method: 'get', url: '/admin/jadwal' },
        { method: 'get', url: '/jadwal' },
      ]);
      setSchedules(unpackCollection(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FORM =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = validateJadwalForm(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const payload = {
      ...formData,
      dokter_id: Number(formData.dokter_id),
      kapasitas: Number(formData.kapasitas)
    };

    setSubmitLoading(true);

    try {
      if (editingId) {
        await requestWithFallback([
          { method: 'put', url: `/admin/jadwal/${editingId}`, data: payload },
          { method: 'put', url: `/jadwal/${editingId}`, data: payload },
        ]);
        setNotice('Jadwal diperbarui');
      } else {
        await requestWithFallback([
          { method: 'post', url: '/admin/jadwal', data: payload },
          { method: 'post', url: '/jadwal', data: payload },
        ]);
        setNotice('Jadwal ditambahkan');
      }

      fetchSchedules();
      cancelForm();

    } catch (err) {
      setErrors(normalizeFieldErrors(err));
      setSubmitError(normalizeErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const editSchedule = (sch) => {
    setEditingId(sch.id);
    setFormData({
      dokter_id: sch.dokter_id,
      hari: sch.hari,
      jam_mulai: sch.jam_mulai?.substring(0,5),
      jam_selesai: sch.jam_selesai?.substring(0,5),
      kapasitas: sch.kapasitas
    });
    setShowForm(true);
  };

  const deleteSchedule = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await requestWithFallback([
        { method: 'delete', url: `/admin/jadwal/${deleteTarget.id}` },
        { method: 'delete', url: `/jadwal/${deleteTarget.id}` },
      ]);
      setNotice('Jadwal dihapus');
      fetchSchedules();
      setDeleteTarget(null);
    } catch {
      setSubmitError('Gagal hapus');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      dokter_id: '',
      hari: '',
      jam_mulai: '',
      jam_selesai: '',
      kapasitas: 10
    });
  };

  // ================= GROUPING =================
  const groupedByDay = schedules.reduce((acc, sch) => {
    if (!acc[sch.hari]) acc[sch.hari] = [];
    acc[sch.hari].push(sch);
    return acc;
  }, {});

  const groupedByDoctor = schedules.reduce((acc, sch) => {
    const name = sch.dokter?.nama || 'Dokter';
    if (!acc[name]) acc[name] = [];
    acc[name].push(sch);
    return acc;
  }, {});

  const days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

  // ================= UI =================
  return (
    <AdminLayout title="Manajemen Jadwal">

      <button className="btn primary" onClick={() => setShowForm(true)}>
        + Tambah Jadwal
      </button>

      {notice && <p className="notice">{notice}</p>}

      {/* TOGGLE */}
      <div className="toggle">
        <button onClick={() => setViewMode('hari')} className={viewMode==='hari'?'active':''}>
          Per Hari
        </button>
        <button onClick={() => setViewMode('dokter')} className={viewMode==='dokter'?'active':''}>
          Per Dokter
        </button>
      </div>

      {loading ? <p>Loading...</p> : (

        <div className="jadwal-container">

          {/* PER HARI */}
          {viewMode === 'hari' && days.map(day => {
            const list = groupedByDay[day];
            if (!list) return null;

            return (
              <div key={day} className="card">
                <h4>📅 {day}</h4>

                {list.map(sch => (
                  <div key={sch.id} className="item">
                    <div>
                      <b>{sch.dokter?.nama}</b>
                      <div>{sch.jam_mulai} - {sch.jam_selesai}</div>
                      <small>Kapasitas: {sch.kapasitas}</small>
                    </div>

                    <div>
                      <button onClick={()=>editSchedule(sch)}>Edit</button>
                      <button onClick={()=>setDeleteTarget(sch)}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* PER DOKTER */}
          {viewMode === 'dokter' && Object.keys(groupedByDoctor).map(doc => (
            <div key={doc} className="card">
              <h4>👨‍⚕️ {doc}</h4>

              {groupedByDoctor[doc].map(sch => (
                <div key={sch.id} className="item">
                  <div>
                    <b>{sch.hari}</b>
                    <div>{sch.jam_mulai} - {sch.jam_selesai}</div>
                    {/* <small>Kapasitas: {sch.kapasitas}</small> */}
                  </div>

                  <div>
                    <button onClick={()=>editSchedule(sch)}>Edit</button>
                    <button onClick={()=>setDeleteTarget(sch)}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>
      )}

      {/* MODAL FORM */}
<AdminCrudModal open={showForm} onClose={cancelForm}>
  <div style={{ padding: '4px 0' }}>

    {/* Header */}
    <div style={{ marginBottom: '24px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>
        Manajemen Jadwal
      </p>
      <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>
        {editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}
      </h2>
    </div>

    {submitError && (
      <p style={{ fontSize: '13px', color: 'var(--color-text-danger)', background: 'var(--color-background-danger)', padding: '10px 14px', borderRadius: 'var(--border-radius-md)', marginBottom: '16px' }}>
        {submitError}
      </p>
    )}

    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Dokter */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
            Dokter <span style={{ color: 'var(--color-text-danger)' }}>*</span>
          </label>
          <select
            name="dokter_id"
            value={formData.dokter_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--border-radius-md)', border: errors.dokter_id ? '1px solid var(--color-border-danger)' : '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: '14px' }}
          >
            <option value="">— Pilih dokter —</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
          </select>
          {errors.dokter_id && <small style={{ color: 'var(--color-text-danger)', fontSize: '12px' }}>{errors.dokter_id}</small>}
        </div>

        {/* Hari */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            Hari <span style={{ color: 'var(--color-text-danger)' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(day => {
              const label = day.substring(0, 3);
              const selected = formData.hari === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => { setFormData(f => ({ ...f, hari: day })); setErrors(p => ({ ...p, hari: null })); }}
                  style={{
                    textAlign: 'center', padding: '8px 4px',
                    borderRadius: 'var(--border-radius-md)',
                    border: selected ? '2px solid #185FA5' : '0.5px solid var(--color-border-secondary)',
                    background: selected ? '#E6F1FB' : 'transparent',
                    color: selected ? '#0C447C' : 'var(--color-text-secondary)',
                    fontSize: '12px', fontWeight: selected ? 500 : 400, cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {errors.hari && <small style={{ color: 'var(--color-text-danger)', fontSize: '12px' }}>{errors.hari}</small>}
        </div>

        {/* Jam */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Jam mulai <span style={{ color: 'var(--color-text-danger)' }}>*</span>
            </label>
            <input
              type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleChange} required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--border-radius-md)', border: errors.jam_mulai ? '1px solid var(--color-border-danger)' : '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
            />
            {errors.jam_mulai && <small style={{ color: 'var(--color-text-danger)', fontSize: '12px' }}>{errors.jam_mulai}</small>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Jam selesai <span style={{ color: 'var(--color-text-danger)' }}>*</span>
            </label>
            <input
              type="time" name="jam_selesai" value={formData.jam_selesai} onChange={handleChange} required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--border-radius-md)', border: errors.jam_selesai ? '1px solid var(--color-border-danger)' : '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
            />
            {errors.jam_selesai && <small style={{ color: 'var(--color-text-danger)', fontSize: '12px' }}>{errors.jam_selesai}</small>}
          </div>
        </div>

        {/* Kapasitas */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            Kapasitas pasien
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="range" min="1" max="50"
              name="kapasitas" value={formData.kapasitas} onChange={handleChange}
              style={{ flex: 1 }}
            />
            <div style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', padding: '6px 14px', fontSize: '14px', fontWeight: 500, minWidth: '42px', textAlign: 'center' }}>
              {formData.kapasitas}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button" onClick={cancelForm} disabled={submitLoading}
            style={{ padding: '9px 20px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer' }}
          >
            Batal
          </button>
          <button
            type="submit" disabled={submitLoading}
            style={{ padding: '9px 20px', borderRadius: 'var(--border-radius-md)', border: 'none', background: submitLoading ? 'var(--color-background-secondary)' : '#185FA5', color: submitLoading ? 'var(--color-text-secondary)' : '#fff', fontSize: '14px', fontWeight: 500, cursor: submitLoading ? 'not-allowed' : 'pointer' }}
          >
            {submitLoading ? 'Menyimpan...' : editingId ? 'Update jadwal' : 'Simpan jadwal'}
          </button>
        </div>

      </div>
    </form>
  </div>
</AdminCrudModal>

      {/* DELETE */}
      <AdminCrudModal open={!!deleteTarget} onClose={()=>setDeleteTarget(null)}>
        <p>Hapus jadwal?</p>
        <button onClick={deleteSchedule}>Ya</button>
      </AdminCrudModal>

    </AdminLayout>
  );
}