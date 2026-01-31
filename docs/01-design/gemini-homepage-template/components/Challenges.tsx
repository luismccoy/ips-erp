
import React from 'react';

const Challenges: React.FC = () => {
  const solutions = [
    {
      title: "RIPS Automated Generation",
      desc: "Pre-validated JSON and XML files compliant with current Colombian healthcare resolutions.",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Clinical Decision Support",
      desc: "Real-time AI analysis of nurse notes to flag high-risk respiratory and cardiac indicators.",
      image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Electronic Visit Verification",
      desc: "GPS-stamped point-of-care documentation ensures transparency and audit readiness.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Native DIAN Integration",
      desc: "Seamless electronic invoicing for copayments and services directly from clinical data.",
      image: "https://images.unsplash.com/photo-1454165833767-027eeaf15582?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Resource Optimization",
      desc: "AI-driven scheduling that reduces field staff transit time and maximizes patient contact hours.",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Patient Risk Command",
      desc: "Consolidated health dashboards for clinical directors to manage population health at scale.",
      image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800",
    }
  ];

  return (
    <section className="py-24 bg-white" id="solutions">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">A comprehensive portfolio</p>
          <h2 className="text-3xl font-display font-black tracking-tight text-brand-navy sm:text-4xl">
            Featured solutions for modern care
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
          {solutions.map((item, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 mb-6">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                    {item.desc}
                  </p>
                </div>
                <div className="size-8 rounded-full bg-brand-blue flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-blue/20 group-hover:-translate-y-1 transition-transform">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Challenges;
