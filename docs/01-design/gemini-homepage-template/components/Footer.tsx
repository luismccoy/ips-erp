
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded bg-brand-blue text-white">
              <span className="material-symbols-outlined text-sm">medical_services</span>
            </div>
            <span className="text-lg font-display font-bold tracking-tight text-brand-navy">HomeCareERP</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-8">
            {['Privacy Policy', 'Terms of Service', 'Support', 'Contact'].map(link => (
              <a key={link} href="#" className="text-sm font-medium text-slate-500 hover:text-brand-blue transition-colors">
                {link}
              </a>
            ))}
          </nav>

          <p className="text-sm text-slate-400 font-medium">
            © 2024 HomeCareERP Colombia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
