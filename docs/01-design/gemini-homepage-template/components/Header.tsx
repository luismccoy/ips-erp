
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20">
            <span className="material-symbols-outlined text-xl font-bold">clinical_notes</span>
          </div>
          <span className="text-xl font-display font-black tracking-tight text-brand-navy">HomeCare<span className="text-brand-blue">ERP</span></span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-10">
          {['Solutions', 'Features', 'Compliance', 'Resources'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-600 hover:text-brand-blue transition-colors tracking-wide">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-sm font-bold text-slate-600 hover:text-brand-navy px-4 py-2 transition-all">
            Log in
          </button>
          <button className="rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white shadow-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
            Request Demo
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
