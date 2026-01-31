
import React, { useEffect, useState } from 'react';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-white pt-24 pb-16 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/30 blur-3xl -z-10 translate-x-1/4"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Side: Clinical Copy */}
          <div className="max-w-2xl text-left">
            <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-brand-blue mb-8 border border-blue-100/50">
                <span className="size-2 rounded-full bg-brand-blue animate-pulse"></span>
                New: AWS Bedrock Clinical AI Integration
              </div>
            </div>

            <h1 className={`font-display text-5xl md:text-7xl font-black tracking-tight text-brand-navy leading-[1.05] mb-8 transition-all duration-1000 delay-200 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Transforming <br />
              Colombian Home <br />
              Care with <span className="text-brand-blue">Clinical Precision</span>
            </h1>

            <p className={`text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-10 transition-all duration-1000 delay-400 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              The enterprise ERP built specifically for IPS agencies to manage patient outcomes, automate RIPS generation, and ensure Minsalud compliance at scale.
            </p>

            <div className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-600 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <button className="w-full sm:w-auto h-14 px-10 rounded-xl bg-brand-blue text-base font-bold text-white shadow-xl shadow-brand-blue/25 hover:bg-blue-600 hover:-translate-y-0.5 transition-all">
                Schedule a Consultation
              </button>
              <button className="w-full sm:w-auto h-14 px-10 rounded-xl border-2 border-slate-100 bg-white text-base font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all">
                View Platform Capabilities
              </button>
            </div>
          </div>

          {/* Right Side: Visual Narrative with Floating Badges */}
          <div className={`relative transition-all duration-1000 delay-800 ease-out transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="relative">
              
              {/* Main Image Frame (Home Care Interaction) */}
              <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.1)] border-[12px] border-white">
                <img 
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1200" 
                  alt="Clinical interaction with senior patient"
                  className="w-full h-[600px] object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                />
                {/* Soft Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/10 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Top Right Badge: 100% Audit Ready */}
              <div className="absolute top-1/4 -right-4 lg:-right-10 animate-float-delayed">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl px-6 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white flex items-center gap-4">
                  <div className="size-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
                    <span className="material-symbols-outlined font-bold text-xl">shield_with_heart</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">STATUS</div>
                    <div className="text-base font-black text-brand-navy tracking-tight">100% Audit Ready</div>
                  </div>
                </div>
              </div>

              {/* Bottom Left Badge: RIPS Validated */}
              <div className="absolute bottom-10 -left-6 lg:-left-12 animate-float">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl px-7 py-6 shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                    <span className="material-symbols-outlined font-black text-2xl">verified</span>
                  </div>
                  <div>
                    <div className="text-lg font-black text-brand-navy tracking-tight leading-none mb-1">RIPS Validated</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">JSON/XML READY</div>
                  </div>
                </div>
              </div>

              {/* Small Decorative Detail: Clinical Sync Pulse */}
              <div className="absolute -bottom-4 right-12 bg-brand-navy text-white px-5 py-2.5 rounded-full flex items-center gap-3 shadow-2xl">
                 <span className="size-2 rounded-full bg-blue-400 animate-pulse"></span>
                 <span className="text-[10px] font-black tracking-[0.2em] uppercase">SYNC: ACTIVE</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-0.5deg); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; animation-delay: 1s; }
      `}</style>
    </section>
  );
};

export default Hero;
