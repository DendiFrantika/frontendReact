import React from 'react';

export function ClinicDoctors() {
  const doctors = [
    { id: 1, name: 'Dr. Ahmad Wijaya', spec: 'Dokter Umum', schedule: 'Senin - Jumat 08:00 - 17:00' },
    { id: 2, name: 'Dr. Siti Nurhaliza', spec: 'Spesialis Gigi', schedule: 'Senin - Sabtu 09:00 - 18:00' },
    { id: 3, name: 'Dr. Budi Santoso', spec: 'Spesialis Anak', schedule: 'Selasa - Kamis 10:00 - 16:00' },
  ];

  return (
    <section id="jadwal">
      <div className="max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-sky-100">
            Dokter Kami
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Tim Dokter Profesional
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{marginTop: '1rem'}}>
            Dokter-dokter berpengalaman siap melayani Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl shadow-lg" style={{padding: '2rem'}}>
              <div style={{
                width: '5rem',
                height: '5rem',
                background: '#0ea5e9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                marginBottom: '1rem'
              }}>
                👨‍⚕️
              </div>
              <h3 style={{fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem'}}>
                {doctor.name}
              </h3>
              <p style={{color: '#0ea5e9', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem'}}>
                {doctor.spec}
              </p>
              <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                {doctor.schedule}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClinicDoctors;
