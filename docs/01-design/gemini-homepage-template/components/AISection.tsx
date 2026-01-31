
import React from 'react';

const AISection: React.FC = () => {
  return (
    <section className="relative min-h-[650px] flex items-center bg-brand-navy overflow-hidden">
      {/* Immersive Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=2000" 
          alt="Home Care Professional"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/50 to-transparent"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">Professional Healthcare</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white mb-8 leading-[1.1]">
            Discover how we deliver <br /> better care for <br /> more people
          </h2>
          <p className="text-lg md:text-xl text-slate-200 mb-12 font-medium leading-relaxed max-w-lg">
            In healthcare, time means more. Our AI innovations are giving back time for what matters most. More time to see, diagnose, and realize the best possible outcomes for patients.
          </p>
          <button className="h-12 px-10 rounded-full bg-white text-brand-navy text-sm font-black hover:bg-brand-blue hover:text-white transition-all shadow-2xl">
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
};

export default AISection;
