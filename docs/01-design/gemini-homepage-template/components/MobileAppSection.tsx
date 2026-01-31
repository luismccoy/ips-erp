
import React from 'react';

const MobileAppSection: React.FC = () => {
  return (
    <section className="relative min-h-[700px] flex items-center bg-[#020617] overflow-hidden">
      {/* Background with Dark Clinical Aesthetic */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=2000" 
          alt="Healthcare Specialist"
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/90 to-transparent"></div>
        {/* Signature Blue Glows */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/20 blur-[150px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-24">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white mb-8 leading-[1.1]">
            Functional clinical <br />
            intelligence to detect <br />
            <span className="text-blue-400">risk exposures</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 mb-12 font-medium leading-relaxed max-w-lg">
            Our enterprise platform uses clinical intelligence to detect and analyze risk early. Clinical dashboards enable faster detection and more precise treatment of patients from their home environment.
          </p>
          <button className="h-12 px-10 rounded-full bg-white text-brand-navy text-sm font-black hover:bg-brand-blue hover:text-white transition-all shadow-2xl">
            Read more
          </button>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;
