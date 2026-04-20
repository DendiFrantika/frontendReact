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
                    <small>Kapasitas: {sch.kapasitas}</small>
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
        <form onSubmit={handleSubmit}>

          <select name="dokter_id" value={formData.dokter_id} onChange={handleChange}>
            <option value="">Pilih dokter</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
          </select>

          <select name="hari" value={formData.hari} onChange={handleChange}>
            <option value="">Pilih hari</option>
            {days.map(d => <option key={d}>{d}</option>)}
          </select>

          <input type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleChange}/>
          <input type="time" name="jam_selesai" value={formData.jam_selesai} onChange={handleChange}/>
          <input type="number" name="kapasitas" value={formData.kapasitas} onChange={handleChange}/>

          <button type="submit">
            {submitLoading ? 'Saving...' : 'Simpan'}
          </button>
        </form>
      </AdminCrudModal>

      {/* DELETE */}
      <AdminCrudModal open={!!deleteTarget} onClose={()=>setDeleteTarget(null)}>
        <p>Hapus jadwal?</p>
        <button onClick={deleteSchedule}>Ya</button>
      </AdminCrudModal>

    </AdminLayout>
  );
}