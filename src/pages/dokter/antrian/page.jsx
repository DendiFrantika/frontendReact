import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

const STATUS_CFG = {
  pending:    { label: 'Menunggu',       color: '#B45309', bg: '#FEF3C7' },
  confirmed:  { label: 'Dikonfirmasi',   color: '#1D4ED8', bg: '#DBEAFE' },
  checked_in: { label: 'Sedang Periksa', color: '#6D28D9', bg: '#EDE9FE' },
  completed:  { label: 'Selesai',        color: '#065F46', bg: '#D1FAE5' },
  cancelled:  { label: 'Dibatalkan',     color: '#991B1B', bg: '#FEE2E2' },
};

export default function Antrian() {
  const [queue,   setQueue]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const navigate              = useNavigate();

  useEffect(() => { fetchQueue(); }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res  = await axiosInstance.get('/dokter/antrian');
      const data = res.data?.data ?? res.data ?? [];
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching queue:', err);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/dokter/antrian/${id}`, { status });
      fetchQueue();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const fmt = (t) =>
    t ? new Date(t).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

  const counts = {
    all:        queue.length,
    confirmed:  queue.filter((q) => q.status === 'confirmed').length,
    checked_in: queue.filter((q) => q.status === 'checked_in').length,
    completed:  queue.filter((q) => q.status === 'completed').length,
  };

  const filtered = filter === 'all' ? queue : queue.filter((q) => q.status === filter);

  return (
    <DokterLayout title="Antrian Pasien">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .ant-wrap * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        .ant-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
        .ant-stat {
          background: #fff; border: 1.5px solid #E5E7EB; border-radius: 12px;
          padding: 14px 18px; cursor: pointer; transition: all .15s;
        }
        .ant-stat:hover  { border-color: #6366F1; }
        .ant-stat.active { border-color: #6366F1; background: #F5F3FF; }
        .ant-stat .lbl   { font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: .5px; }
        .ant-stat .num   { font-size: 26px; font-weight: 700; color: #111827; margin-top: 4px; }

        .ant-list { display: flex; flex-direction: column; gap: 10px; }
        .ant-card {
          background: #fff; border: 1.5px solid #E5E7EB; border-radius: 14px;
          padding: 18px 22px; display: grid; grid-template-columns: 52px 1fr auto;
          gap: 16px; align-items: center; transition: box-shadow .15s;
        }
        .ant-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }

        .ant-num {
          width: 52px; height: 52px; border-radius: 12px; flex-shrink: 0;
          background: #F3F4F6; display: flex; align-items: center;
          justify-content: center; font-size: 15px; font-weight: 800; color: #374151;
        }

        .ant-info h3    { margin: 0 0 2px; font-size: 16px; font-weight: 700; color: #111827; }
        .ant-info .meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 13px; color: #6B7280; margin-top: 4px; }
        .ant-info .kelu {
          margin-top: 7px; display: inline-block;
          background: #F9FAFB; border: 1px solid #E5E7EB;
          border-radius: 6px; padding: 3px 10px; font-size: 12px; color: #374151;
        }

        .ant-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .s-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 20px; font-size: 12px; font-weight: 700;
        }
        .s-dot { width: 6px; height: 6px; border-radius: 50%; }

        .ant-acts { display: flex; gap: 7px; flex-wrap: wrap; justify-content: flex-end; }
        .btn {
          padding: 8px 15px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: none; transition: all .15s; font-family: inherit;
        }
        .btn-violet { background: #6366F1; color: #fff; }
        .btn-violet:hover { background: #4F46E5; }
        .btn-green  { background: #10B981; color: #fff; }
        .btn-green:hover  { background: #059669; }
        .btn-red    { background: #fff; color: #EF4444; border: 1.5px solid #FCA5A5; }
        .btn-red:hover    { background: #FEF2F2; }
        .btn-outline{ background: #fff; color: #6366F1; border: 1.5px solid #C7D2FE; }
        .btn-outline:hover{ background: #EEF2FF; }

        .ant-empty { text-align: center; padding: 60px 20px; color: #9CA3AF; font-size: 14px; }
        .ant-empty .ico { font-size: 44px; margin-bottom: 10px; }

        @media (max-width: 640px) {
          .ant-stats { grid-template-columns: repeat(2,1fr); }
          .ant-card  { grid-template-columns: 1fr; }
          .ant-right { align-items: flex-start; }
        }
      `}</style>

      <div className="ant-wrap">
        {/* Stats bar */}
        <div className="ant-stats">
          {[
            { key: 'all',        label: 'Total'          },
            { key: 'confirmed',  label: 'Dikonfirmasi'   },
            { key: 'checked_in', label: 'Sedang Periksa' },
            { key: 'completed',  label: 'Selesai'        },
          ].map(({ key, label }) => (
            <div key={key} className={`ant-stat ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
              <div className="lbl">{label}</div>
              <div className="num">{counts[key] ?? 0}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#9CA3AF', padding: '40px 0', textAlign: 'center' }}>Memuat antrian…</p>
        ) : (
          <div className="ant-list">
            {filtered.length === 0 ? (
              <div className="ant-empty">
                <div className="ico">🗂️</div>
                <p>Tidak ada antrian untuk filter ini.</p>
              </div>
            ) : filtered.map((item) => {
              const sc = STATUS_CFG[item.status] ?? STATUS_CFG.pending;
              return (
                <div key={item.id} className="ant-card">
                  <div className="ant-num">{item.no_antrian?.split('-').pop() ?? '#'}</div>

                  <div className="ant-info">
                    <h3>{item.pasien?.nama ?? '-'}</h3>
                    <div className="meta">
                      <span>📅 {fmt(item.tanggal_pendaftaran)}</span>
                      <span>🕐 {item.jam_kunjungan ?? '-'}</span>
                      <span>🪪 {item.no_antrian ?? '-'}</span>
                    </div>
                    <span className="kelu">Keluhan: {item.keluhan ?? '-'}</span>
                  </div>

                  <div className="ant-right">
                    <span className="s-badge" style={{ background: sc.bg, color: sc.color }}>
                      <span className="s-dot" style={{ background: sc.color }} />
                      {sc.label}
                    </span>
                    <div className="ant-acts">
                      {item.status === 'confirmed' && (
                        <button className="btn btn-violet" onClick={() => updateStatus(item.id, 'checked_in')}>
                          Mulai Pemeriksaan
                        </button>
                      )}
                      {item.status === 'checked_in' && (
                        <button className="btn btn-green" onClick={() => navigate(`/dokter/rekam-medis/${item.id}`)}>
                          Input Rekam Medis
                        </button>
                      )}
                      {item.status === 'completed' && (
                        <button className="btn btn-outline" onClick={() => navigate(`/dokter/rekam-medis/${item.id}`)}>
                          Lihat Rekam Medis
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(item.status) && (
                        <button className="btn btn-red" onClick={() => updateStatus(item.id, 'cancelled')}>
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DokterLayout>
  );
}