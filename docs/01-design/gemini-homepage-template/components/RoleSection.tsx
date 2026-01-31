
import React from 'react';

const RoleSection: React.FC = () => {
  const roles = [
    {
      title: "Clinical Directors",
      desc: "Population health management and outcomes tracking.",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Field Specialists",
      desc: "Mobile clinical documentation with native offline sync.",
      image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Administrators",
      desc: "Billing cycles and electronic invoicing automation.",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200 mb-6">
                <img 
                  src={role.image} 
                  alt={role.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {role.desc}
                  </p>
                </div>
                <div className="size-8 rounded-full bg-brand-blue flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-blue/20">
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

export default RoleSection;
