
import React from 'react';

const FinalCTA: React.FC = () => {
  return (
    <section className="relative py-32 bg-slate-50 overflow-hidden">
       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-brand-navy mb-8 leading-tight">
                Get support for your <br /> healthcare products
              </h2>
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-12">
                Quickly and easily find the information you need to keep your healthcare organization and operations running smoothly. Or connect directly with a specialist.
              </p>
              <button className="h-12 px-10 rounded-full bg-brand-navy text-white text-sm font-black hover:bg-slate-800 transition-all shadow-xl">
                Visit support hub
              </button>
            </div>

            <div className="relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] border-4 border-white">
                 <img 
                   src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" 
                   alt="Healthcare support specialist"
                   className="w-full h-[450px] object-cover"
                 />
              </div>
              {/* Clinical ID Badge detail inspired by reference */}
              <div className="absolute bottom-10 right-10 bg-white p-3 rounded-lg shadow-2xl border border-slate-100 flex items-center gap-4 animate-pulse">
                <div className="size-8 rounded bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">support_agent</span>
                </div>
                <div className="text-[10px] font-black text-brand-navy tracking-widest uppercase">Specialist Online</div>
              </div>
            </div>

         </div>
       </div>
    </section>
  );
};

export default FinalCTA;
