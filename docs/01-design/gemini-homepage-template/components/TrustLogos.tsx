
import React from 'react';

const TrustLogos: React.FC = () => {
  const partners = [
    { name: 'SALUD TOTAL', icon: 'medical_services' },
    { name: 'FAMISANAR', icon: 'favorite' },
    { name: 'COMPENSAR', icon: 'ecg_heart' },
    { name: 'SANITAS', icon: 'vaccines' },
    { name: 'NUEVA EPS', icon: 'clinical_notes' }
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">
          TRUSTED BY LEADING IPS AGENCIES ACROSS COLOMBIA
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
          {partners.map(p => (
            <div key={p.name} className="flex items-center gap-3 text-brand-navy font-display font-black text-lg tracking-tighter">
              <span className="material-symbols-outlined text-2xl">{p.icon}</span>
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustLogos;
