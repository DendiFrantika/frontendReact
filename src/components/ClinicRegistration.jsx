import React from 'react';

export function ClinicRegistration() {
  const steps = [
    { num: 1, title: 'Pendaftaran', desc: 'Daftar melalui aplikasi atau langsung ke klinik' },
    { num: 2, title: 'Antrian', desc: 'Tunggu antrian dengan sistem yang teratur' },
    { num: 3, title: 'Konsultasi', desc: 'Konsultasi dengan dokter profesional kami' },
  ];

  return (
    <section id="tentang">
      <div className="max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-sky-100">
            Proses Mudah
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Cara Berobat di Klinik Kami
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={step.num} style={{position: 'relative'}}>
              <div className="w-20 h-20 bg-sky-500">
                <span className="text-3xl font-bold text-white">
                  {step.num}
                </span>
              </div>
              <h3 style={{fontWeight: 700, color: '#1f2937', marginTop: '1rem', marginBottom: '0.5rem'}}>
                {step.title}
              </h3>
              <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                {step.desc}
              </p>
              
              {idx < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '2.5rem',
                  left: '100%',
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(to right, #0ea5e9, #10b981)',
                  zIndex: -10
                }}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClinicRegistration;
