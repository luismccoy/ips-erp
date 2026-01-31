
import React from 'react';

const ComplianceSection: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="max-w-lg">
            <h2 className="text-3xl font-display font-black tracking-tight text-brand-navy sm:text-4xl mb-6">
              Full Regulatory Compliance <br /> for IPS Providers
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
              Our healthcare platform makes quick work of compliance for your organization. From Resolution 3100 enabling conditions to real-time RIPS validation, we're making regulatory operations more convenient and efficient.
            </p>
            <button className="h-10 px-8 rounded-full border-2 border-brand-navy text-sm font-black text-brand-navy hover:bg-brand-navy hover:text-white transition-all">
              Read more
            </button>
          </div>

          <div className="relative">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=1200" 
                alt="Professional Compliance"
                className="w-full aspect-square object-cover"
              />
            </div>
            {/* Float details */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-blue">verified_user</span>
                <span className="text-sm font-black text-brand-navy">Minsalud Compliant</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;
