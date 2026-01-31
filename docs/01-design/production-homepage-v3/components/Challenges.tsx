import React from 'react';

/**
 * Challenges Section V3 - Colombian IPS Pain Points
 * 
 * IMAGE REQUIREMENTS (4 needed - one per challenge):
 * 1. Glosas: Claims/paperwork/red stamp/denial imagery (real office/documents)
 * 2. Manuales: Person overwhelmed with stacks of forms (real photo, not AI)
 * 3. Planillas: Excel/spreadsheet chaos on screen or printed (authentic)
 * 4. Cumplimiento: Checklist/audit/regulatory compliance imagery (real setting)
 * 
 * CRITICAL: NO AI-generated looking images. Must look authentic and professional.
 * Images will be sourced from Unsplash/Pexels by sub-agent.
 */

const Challenges: React.FC = () => {
  const challenges = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Glosadas',
      subtitle: '¿Glosas consumiendo sus ingresos?',
      description: 'Las EPS rechazan hasta el 30% de las facturas por errores de codificación, documentación incompleta o inconsistencias RIPS. Cada glosa significa meses de trabajo y dinero perdido.',
      stat: '30%',
      statLabel: 'de facturas rechazadas promedio',
      color: 'red',
      imageUrl: '../images/challenge-glosadas.jpg',
      imageAlt: 'Documentos médicos con sellos de rechazo y glosas',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Manuales',
      subtitle: '¿Procesos manuales consumiendo tiempo?',
      description: 'Los procesos administrativos manuales consumen horas valiosas de su equipo. La transcripción de datos, verificación de documentos y gestión de casos genera ineficiencias y errores costosos.',
      stat: '8+ hrs',
      statLabel: 'semanales en tareas manuales',
      color: 'amber',
      imageUrl: '../images/challenge-manuales.jpg',
      imageAlt: 'Profesional rodeado de pilas de documentos y formularios',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Planillas',
      subtitle: '¿Programación de turnos caótica?',
      description: 'Coordinar enfermeras, terapeutas y visitas domiciliarias en Excel genera ineficiencias, gastos de transporte innecesarios y pacientes desatendidos. Las planillas no optimizan rutas ni disponibilidad.',
      stat: '25%',
      statLabel: 'de tiempo improductivo estimado',
      color: 'orange',
      imageUrl: '../images/challenge-planillas.jpg',
      imageAlt: 'Pantalla de computadora con hojas de cálculo complejas',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Cumplimiento',
      subtitle: '¿Riesgo de sanciones regulatorias?',
      description: 'Supersalud y las secretarías de salud exigen cumplimiento estricto de normatividad (Res. 3374, 3100, RIPS). La documentación incompleta puede resultar en multas, suspensiones o pérdida de habilitación.',
      stat: '$$',
      statLabel: 'en multas potenciales',
      color: 'purple',
      imageUrl: '../images/challenge-cumplimiento.jpg',
      imageAlt: 'Lista de verificación de cumplimiento regulatorio',
    },
  ];

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      icon: 'text-red-500',
      stat: 'text-red-600',
      hover: 'group-hover:border-red-200',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: 'text-amber-500',
      stat: 'text-amber-600',
      hover: 'group-hover:border-amber-200',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      icon: 'text-orange-500',
      stat: 'text-orange-600',
      hover: 'group-hover:border-orange-200',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      icon: 'text-purple-500',
      stat: 'text-purple-600',
      hover: 'group-hover:border-purple-200',
    },
  };

  return (
    <section id="soluciones" className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full mb-4">
            LOS DESAFÍOS
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Los desafíos que enfrentan las IPS{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              domiciliarias hoy
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Sabemos lo difícil que es gestionar una IPS de atención domiciliaria en Colombia. 
            La presión regulatoria, las glosas y la complejidad operativa consumen tiempo 
            que debería dedicarse al cuidado del paciente.
          </p>
        </div>

        {/* Challenges Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className={`${colorClasses[challenge.color].bg} ${colorClasses[challenge.color].border} ${colorClasses[challenge.color].hover} border-2 rounded-2xl overflow-hidden transition-all hover:shadow-xl group`}
            >
              {/* Image Section - NEW */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={challenge.imageUrl}
                  alt={challenge.imageAlt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Icon Badge Overlay */}
                <div className={`absolute top-4 left-4 ${colorClasses[challenge.color].icon} bg-white rounded-xl p-3 shadow-lg`}>
                  {challenge.icon}
                </div>

                {/* Stat Badge */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2">
                  <p className={`text-2xl font-bold ${colorClasses[challenge.color].stat}`}>
                    {challenge.stat}
                  </p>
                  <p className="text-xs text-gray-600">{challenge.statLabel}</p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${colorClasses[challenge.color].stat}`}>
                    {challenge.title}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                  {challenge.subtitle}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {challenge.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Solution Teaser */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center">
            <p className="text-blue-700 font-semibold mb-2">
              Descubra cómo nuestra plataforma resuelve cada uno de estos desafíos
            </p>
            <svg className="w-6 h-6 text-blue-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Challenges;
