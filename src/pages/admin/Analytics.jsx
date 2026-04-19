import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

export default function Analytics() {

  const data = [
    { hari: 'Senin', pasien: 10 },
    { hari: 'Selasa', pasien: 15 },
    { hari: 'Rabu', pasien: 8 },
    { hari: 'Kamis', pasien: 20 },
    { hari: 'Jumat', pasien: 18 },
    { hari: 'Sabtu', pasien: 25 },
  ];

  return (
    <AdminLayout title="Analytics">
      <div className="container-fluid">

        {/* STAT CARDS */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card shadow-sm p-3">
              <h6>Total Pasien</h6>
              <h4 className="fw-bold">120</h4>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-3">
              <h6>Pendaftaran Hari Ini</h6>
              <h4 className="fw-bold">25</h4>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-3">
              <h6>Dokter Aktif</h6>
              <h4 className="fw-bold">5</h4>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-3">
              <h6>Antrian</h6>
              <h4 className="fw-bold">12</h4>
            </div>
          </div>
        </div>

        {/* CHART */}
        <div className="card shadow-sm p-4">
          <h5 className="mb-3">Grafik Kunjungan Pasien</h5>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hari" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pasien" stroke="#0d6efd" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </AdminLayout>
  );
}