import React from 'react';

/**
 * Hero Section V3 - Home Healthcare Focus
 * 
 * CRITICAL IMAGE REQUIREMENT:
 * - Real nurse providing home care to elderly patient
 * - Colombian setting (warm, natural lighting)
 * - NO AI-generated images
 * - NO blood samples, hospital settings, or clinical imagery
 * 
 * Image will be sourced from Unsplash/Pexels by sub-agent
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
      {/* Background Image - Real home care nurse with elderly patient */}
      <div className="absolute inset-0 z-0">
        <img
          src="../images/hero-nurse-patient.jpg"
          alt="Enfermera profesional brindando cuidado domiciliario a paciente adulto mayor"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay - Professional blue tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-blue-900/30" />
      </div>

      {/* Floating Trust Badge */}
      <div className="absolute top-32 right-10 hidden xl:block z-10 animate-float">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">100% Cumplimiento</p>
            <p className="text-xs text-gray-500">Normativa colombiana</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl pt-20 lg:pt-32">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full mb-8 animate-fade-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
            </span>
            <span className="text-sm font-semibold text-teal-100">Plataforma Inteligente para IPS Domiciliarias</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
            Transforme su IPS con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300">
              Agentes IA
            </span>{' '}
            que trabajan para usted
          </h1>

          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed mb-10 animate-fade-in-up animation-delay-200">
            Automatice glosas, RIPS, planillas y cumplimiento normativo. 
            Recupere su tiempo para lo que realmente importa: el cuidado del paciente.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up animation-delay-400">
            <a
              href="#demo"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-900 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:bg-teal-50 transition-all transform hover:-translate-y-0.5 group"
            >
              Agendar Demo Gratuita
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#soluciones"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/20 transition-all"
            >
              Ver Soluciones
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animation-delay-600">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all"
              >
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-blue-200">{stat.label}</p>
                <p className="text-xs text-blue-300">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="flex flex-col items-center text-white/70">
          <span className="text-xs font-medium mb-2">Descubra más</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
