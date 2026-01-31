import React from 'react';

/**
 * Hero Section - Home Healthcare Focus
 * 
 * Photography Strategy:
 * - Primary: Nurse with elderly patient in home setting
 * - Avoid: Hospitals, operating rooms, clinical settings
 * - Focus: Living rooms, bedrooms, natural lighting
 * 
 * Unsplash API Suggestions:
 * - "home healthcare nurse" 
 * - "elderly care home visit"
 * - "senior patient care home"
 * - "nursing home care latin"
 */

const Hero: React.FC = () => {
  const stats = [
    { value: '500+', label: 'IPS Activas', sublabel: 'en Colombia' },
    { value: '92%', label: 'Glosas Defendidas', sublabel: 'con éxito' },
    { value: '$5.1M', label: 'Recuperados', sublabel: 'mensualmente' },
    { value: '98%', label: 'Compliance', sublabel: 'RIPS garantizado' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image - Home Healthcare Setting */}
      <div className="absolute inset-0 z-0">
        {/* 
          Recommended Unsplash Images:
          - https://unsplash.com/photos/nurse-home-visit-elderly
          - https://unsplash.com/photos/caregiver-patient-living-room
          - https://unsplash.com/photos/home-healthcare-tablet
          
          Replace with actual image URL
        */}
        <img
          src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1920&q=80"
          alt="Enfermera cuidando paciente en casa"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay - Professional blue tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-blue-900/30" />
      </div>

      {/* Floating Badges - Trust Indicators */}
      <div className="absolute top-32 right-10 hidden xl:block z-10 animate-float">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">RIPS Compliant</p>
            <p className="text-xs text-gray-500">Resolución 3374</p>
          </div>
        </div>
      </div>

      <div className="absolute top-56 right-32 hidden xl:block z-10 animate-float-delayed">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">AI-Powered</p>
            <p className="text-xs text-gray-500">Glosa Defender</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-40 right-20 hidden xl:block z-10 animate-float">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">2h 45min</p>
            <p className="text-xs text-gray-500">Ahorradas/día</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-32 pb-20">
        <div className="max-w-3xl">
          {/* Announcement Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-sm text-white/90 font-medium">Nuevo: Roster Architect AI — Optimización automática de turnos</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Software que{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
              protege su facturación
            </span>{' '}
            y optimiza su operación domiciliaria
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
            Plataforma integral con inteligencia artificial diseñada por expertos colombianos 
            para IPS de atención domiciliaria. Defienda sus glosas, optimice su roster y 
            garantice cumplimiento RIPS.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="#demo"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-900 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group"
            >
              Agendar Demo Personalizada
              <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#video"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all group"
            >
              <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver Plataforma en Acción
            </a>
          </div>

          {/* Partner, Not Vendor Badge */}
          <div className="flex items-center space-x-3 text-white/70 mb-8">
            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium">Somos su socio estratégico, no solo un proveedor de software</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-100">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className="py-6 lg:py-8 px-4 lg:px-8 text-center lg:text-left">
                  <p className="text-3xl lg:text-4xl font-bold text-blue-700 mb-1">{stat.value}</p>
                  <p className="text-sm font-semibold text-gray-900">{stat.label}</p>
                  <p className="text-xs text-gray-500">{stat.sublabel}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Floating Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default Hero;
