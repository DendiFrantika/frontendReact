import React, { useState, useEffect } from 'react';
import DokterLayout from '../DokterLayout';
import axiosInstance from '../../../api/axios';

export default function Riwayat() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/dokter/riwayat');

      const raw = res.data;
      const rows = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      setHistory(rows);
    } catch (err) {
      console.error(err);
      setHistory([]);
      setError('Gagal memuat riwayat pemeriksaan.');
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // HELPER DATE
  // =====================
  const getDate = (item) =>
    item.tanggal_kunjungan || item.created_at || null;

  function isToday(date) {
    if (!date) return false;
    return new Date(date).toDateString() === new Date().toDateString();
  }

  function isThisWeek(date) {
    if (!date) return false;
    const now = new Date();
    const d = new Date(date);
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }

  // =====================
  // STATISTIK
  // =====================
  const stats = {
    total: history.length,
    today: history.filter(h => isToday(getDate(h))).length,
    week: history.filter(h => isThisWeek(getDate(h))).length,
  };

  // =====================
  // FILTER DATA
  // =====================
  const filtered =
    filter === 'all'
      ? history
      : filter === 'today'
      ? history.filter(h => isToday(getDate(h)))
      : history.filter(h => isThisWeek(getDate(h)));

  return (
    <DokterLayout title="Riwayat Pemeriksaan">

      <style>{`
        .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px; }
        .cardStat {
          background:#fff; border:1px solid #E5E7EB;
          padding:14px; border-radius:12px;
        }
        .num { font-size:22px; font-weight:700; color:#111827; }
        .lbl { font-size:12px; color:#6B7280; }

        .filter {
          display:flex; gap:8px; margin-bottom:16px;
        }
        .btn {
          padding:6px 12px; border-radius:20px;
          border:1px solid #D1D5DB;
          background:#fff; cursor:pointer;
          font-size:12px;
        }
        .btn.active {
          background:#4F46E5;
          color:#fff;
          border-color:#4F46E5;
        }

        .timeline {
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        .item {
          background:#fff;
          border:1px solid #E5E7EB;
          padding:14px;
          border-radius:12px;
          display:flex;
          justify-content:space-between;
        }

        .left h4 {
          margin:0;
          font-size:14px;
          font-weight:700;
        }

        .meta {
          font-size:12px;
          color:#6B7280;
          margin-top:4px;
        }

        .tag {
          font-size:11px;
          padding:3px 10px;
          background:#EEF2FF;
          color:#4338CA;
          border-radius:20px;
          display:inline-block;
        }

        .empty {
          text-align:center;
          color:#9CA3AF;
          padding:40px;
        }
      `}</style>

      {/* ERROR */}
      {error && (
        <div style={{ background:'#FEE2E2', padding:10, borderRadius:8, marginBottom:10 }}>
          {error}
        </div>
      )}

      {/* STAT */}
      <div className="grid">
        <div className="cardStat">
          <div className="num">{stats.total}</div>
          <div className="lbl">Total Pasien</div>
        </div>
        <div className="cardStat">
          <div className="num">{stats.today}</div>
          <div className="lbl">Hari Ini</div>
        </div>
        <div className="cardStat">
          <div className="num">{stats.week}</div>
          <div className="lbl">7 Hari Terakhir</div>
        </div>
      </div>

      {/* FILTER */}
      <div className="filter">
        <button
          className={`btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Semua
        </button>
        <button
          className={`btn ${filter === 'today' ? 'active' : ''}`}
          onClick={() => setFilter('today')}
        >
          Hari Ini
        </button>
        <button
          className={`btn ${filter === 'week' ? 'active' : ''}`}
          onClick={() => setFilter('week')}
        >
          7 Hari
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <p>Memuat riwayat...</p>
      ) : filtered.length === 0 ? (
        <div className="empty">Belum ada riwayat pemeriksaan.</div>
      ) : (
        <div className="timeline">
          {filtered.map((item) => {
            const date = getDate(item);
            const dateObj = date ? new Date(date) : null;

            return (
              <div className="item" key={item.id}>
                <div className="left">
                  <h4>{item.pasien?.nama || item.patientName || '-'}</h4>

                  <div className="meta">
                    📅 {dateObj ? dateObj.toLocaleDateString('id-ID') : '-'} 
                  </div>

                  <div className="meta">
                    Keluhan: {item.keluhan_utama || item.keluhan || '-'}
                  </div>
                </div>

                <div className="right" style={{ textAlign: 'right' }}>
                  <span className="tag">
                    {item.diagnosis || 'Tidak ada diagnosis'}
                  </span>

                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    {item.tindakan || '-'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DokterLayout>
  );
}