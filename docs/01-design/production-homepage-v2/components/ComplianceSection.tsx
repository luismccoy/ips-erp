import React from 'react';

/**
 * Compliance Section - Colombian Healthcare Regulations
 * 
 * Key regulations for Colombian home healthcare:
 * - Resolución 3374 (RIPS)
 * - Resolución 3100 (Habilitación)
 * - Supersalud requirements
 * - INVIMA guidelines
 */

const ComplianceSection: React.FC = () => {
  const regulations = [
    {
      code: 'Res. 3374',
      title: 'RIPS - Registro Individual de Prestación de Servicios',
      description: 'Generación automática de archivos RIPS con validación en tiempo real. Cumplimiento garantizado con estructura de datos actualizada.',
      features: ['Archivos CT, AF, US, AC, AP, AM, AN, AT, AH', 'Validación antes de envío', 'Corrección automática de errores'],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      code: 'Res. 3100',
      title: 'Estándares de Habilitación',
      description: 'Documentación y procesos alineados con los estándares de habilitación para servicios de atención domiciliaria.',
      features: ['Historias clínicas completas', 'Trazabilidad de atenciones', 'Reportes para auditoría'],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      code: 'Supersalud',
      title: 'Reportes de Vigilancia y Control',
      description: 'Generación de reportes requeridos por la Superintendencia Nacional de Salud para IPS domiciliarias.',
      features: ['Indicadores de calidad', 'Reportes de eventos adversos', 'Información de cartera'],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      code: 'CIE-10 / CUPS',
      title: 'Codificación Estandarizada',
      description: 'Asistente de codificación con validación automática de diagnósticos CIE-10 y procedimientos CUPS actualizados.',
      features: ['Base de datos actualizada 2024', 'Sugerencias contextuales', 'Detección de inconsistencias'],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ];

  const complianceStats = [
    { value: '98%', label: 'Tasa de aceptación RIPS' },
    { value: '100%', label: 'Archivos validados antes de envío' },
    { value: '< 2min', label: 'Tiempo de generación RIPS' },
    { value: '24/7', label: 'Monitoreo de compliance' },
  ];

  return (
    <section id="cumplimiento" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-full mb-4">
            CUMPLIMIENTO REGULATORIO
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Regulaciones colombianas,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">
              cumplimiento garantizado
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Entendemos la complejidad regulatoria del sector salud en Colombia. Nuestra 
            plataforma está diseñada desde cero para garantizar cumplimiento sin comprometer 
            la eficiencia operativa.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-8 mb-16 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {complianceStats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Regulations Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {regulations.map((reg, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-blue-600 group-hover:text-teal-600 transition-colors">
                  {reg.icon}
                </div>
                <span className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 rounded-full">
                  {reg.code}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                {reg.title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {reg.description}
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2">
                {reg.features.map((feature, fIndex) => (
                  <span
                    key={fIndex}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                  >
                    <svg className="w-3 h-3 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Statement */}
        <div className="mt-16 bg-green-50 border border-green-100 rounded-2xl p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Auditorías sin estrés
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Cuando llegan las auditorías de Supersalud o las secretarías de salud, tenga toda 
                la documentación lista. Nuestro sistema mantiene trazabilidad completa de cada 
                atención, cada documento y cada dato regulatorio.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a
                href="#demo"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg"
              >
                Ver Compliance en Acción
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

export default ComplianceSection;
