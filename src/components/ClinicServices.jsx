import React from 'react';

export function ClinicServices() {
  const services = [
    { id: 1, icon: '🏥', title: 'Konsultasi Umum', desc: 'Pemeriksaan kesehatan umum dengan dokter spesialis' },
    { id: 2, icon: '🦷', title: 'Gigi & Mulut', desc: 'Layanan perawatan gigi profesional dan modern' },
    { id: 3, icon: '👶', title: 'Pediatri', desc: 'Kesehatan anak dengan dokter anak berpengalaman' },
    { id: 4, icon: '🩺', title: 'Laboratorium', desc: 'Pemeriksaan lab lengkap dengan hasil akurat' },
  ];

  return (
    <section id="layanan">
      <div className="max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-sky-100">
            Layanan Kami
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Layanan Kesehatan Lengkap
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{marginTop: '1rem'}}>
            Kami menyediakan berbagai layanan kesehatan dengan standar internasional
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.id} className="group bg-gradient-to-br">
              <div className="w-16 h-16" style={{background: 'none', fontSize: '2rem'}}>
                {service.icon}
              </div>
              <h3 style={{fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem'}}>
                {service.title}
              </h3>
              <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClinicServices;
