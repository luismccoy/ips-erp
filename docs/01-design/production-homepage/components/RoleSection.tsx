import React, { useState } from 'react';

/**
 * Role Section - Admin/Nurse/Family Modules
 * 
 * Shows the platform from different user perspectives:
 * 1. Administrador - Operations & finance
 * 2. Enfermera/Terapeuta - Clinical documentation
 * 3. Familia - Patient portal access
 */

const RoleSection: React.FC = () => {
  const [activeRole, setActiveRole] = useState(0);

  const roles = [
    {
      id: 'admin',
      title: 'Administrador',
      subtitle: 'Control total de su operación',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: 'Dashboard ejecutivo con KPIs en tiempo real, gestión de facturación, análisis de glosas, cumplimiento regulatorio y control financiero completo.',
      features: [
        {
          icon: '📊',
          title: 'Dashboard Ejecutivo',
          description: 'KPIs de operación, facturación y cumplimiento en tiempo real',
        },
        {
          icon: '💰',
          title: 'Gestión de Facturación',
          description: 'Facturación electrónica, seguimiento de pagos y análisis de cartera',
        },
        {
          icon: '📋',
          title: 'RIPS Automatizado',
          description: 'Generación y validación automática de archivos RIPS',
        },
        {
          icon: '👥',
          title: 'Gestión de Personal',
          description: 'Roster de personal, turnos, nómina y contratación',
        },
      ],
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
      color: 'blue',
    },
    {
      id: 'nurse',
      title: 'Enfermera / Terapeuta',
      subtitle: 'Documentación clínica sin fricciones',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      description: 'Aplicación móvil intuitiva para documentación en campo, acceso offline, escalas clínicas asistidas por IA y coordinación de visitas en tiempo real.',
      features: [
        {
          icon: '📱',
          title: 'App Móvil Offline',
          description: 'Funciona sin conexión, sincroniza automáticamente',
        },
        {
          icon: '🎤',
          title: 'Documentación por Voz',
          description: 'Dicte notas clínicas, IA transcribe y estructura',
        },
        {
          icon: '📝',
          title: 'Escalas Clínicas',
          description: 'Barthel, Karnofsky, Norton y más, con asistencia IA',
        },
        {
          icon: '🗺️',
          title: 'Ruta del Día',
          description: 'Optimización de visitas, navegación integrada',
        },
      ],
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
      color: 'teal',
    },
    {
      id: 'family',
      title: 'Familia',
      subtitle: 'Tranquilidad y comunicación',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Portal familiar para seguimiento del cuidado del ser querido, comunicación con el equipo médico, y acceso a información importante.',
      features: [
        {
          icon: '👁️',
          title: 'Seguimiento de Visitas',
          description: 'Vea cuándo llegó la enfermera y qué actividades realizó',
        },
        {
          icon: '💬',
          title: 'Comunicación Directa',
          description: 'Mensajería segura con el equipo de cuidado',
        },
        {
          icon: '📄',
          title: 'Acceso a Documentos',
          description: 'Reportes, autorizaciones y documentación clínica',
        },
        {
          icon: '🔔',
          title: 'Notificaciones',
          description: 'Alertas de visitas, medicamentos y próximas citas',
        },
      ],
      image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80',
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      ring: 'ring-blue-600',
    },
    teal: {
      bg: 'bg-teal-600',
      light: 'bg-teal-50',
      text: 'text-teal-600',
      ring: 'ring-teal-600',
    },
    purple: {
      bg: 'bg-purple-600',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      ring: 'ring-purple-600',
    },
  };

  const currentRole = roles[activeRole];
  const currentColors = colorClasses[currentRole.color];

  return (
    <section id="plataforma" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full mb-4">
            PLATAFORMA UNIFICADA
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Una plataforma,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              tres experiencias
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Cada usuario tiene exactamente lo que necesita. Sin complejidad innecesaria, 
            sin curvas de aprendizaje extensas.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {roles.map((role, index) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(index)}
              className={`group flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all ${
                activeRole === index
                  ? `${colorClasses[role.color].bg} text-white shadow-lg`
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={activeRole === index ? 'text-white' : colorClasses[role.color].text}>
                {role.icon}
              </div>
              <div className="text-left">
                <p className="font-semibold">{role.title}</p>
                <p className={`text-xs ${activeRole === index ? 'text-white/80' : 'text-gray-500'}`}>
                  {role.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Role Detail */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Side */}
          <div className="order-2 lg:order-1 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={currentRole.image}
                alt={currentRole.title}
                className="w-full h-80 lg:h-96 object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent`} />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-lg font-semibold">{currentRole.title}</p>
                <p className="text-white/80 text-sm">{currentRole.subtitle}</p>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${currentColors.light} rounded-2xl -z-10`} />
            <div className={`absolute -top-4 -left-4 w-16 h-16 ${currentColors.light} rounded-xl -z-10`} />
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <p className="text-gray-600 leading-relaxed mb-8">
              {currentRole.description}
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {currentRole.features.map((feature, index) => (
                <div
                  key={index}
                  className={`${currentColors.light} rounded-xl p-5 transition-all hover:shadow-md`}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="#demo"
                className={`inline-flex items-center px-6 py-3 ${currentColors.bg} text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg`}
              >
                Ver Demo para {currentRole.title}
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleSection;
