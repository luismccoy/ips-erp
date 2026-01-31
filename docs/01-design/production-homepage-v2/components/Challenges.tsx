import React from 'react';

/**
 * Challenges Section - Colombian IPS Pain Points
 * 
 * Key pain points for home healthcare IPS in Colombia:
 * 1. Glosas (Claim denials) - Major revenue leakage
 * 2. RIPS Complexity - Reporting burden
 * 3. Roster Optimization - Staff scheduling challenges
 * 4. Compliance - Regulatory pressure
 */

const Challenges: React.FC = () => {
  const challenges = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '¿Glosas consumiendo sus ingresos?',
      description: 'Las EPS rechazan hasta el 30% de las facturas por errores de codificación, documentación incompleta o inconsistencias RIPS. Cada glosa significa meses de trabajo y dinero perdido.',
      stat: '30%',
      statLabel: 'de facturas rechazadas promedio',
      color: 'red',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: '¿RIPS tomando horas de su equipo?',
      description: 'La generación manual de RIPS (Resolución 3374) consume tiempo valioso de su equipo administrativo. Errores de formato significan reprocesos y posibles sanciones.',
      stat: '8+ hrs',
      statLabel: 'semanales en reportes manuales',
      color: 'amber',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: '¿Programación de turnos caótica?',
      description: 'Coordinar enfermeras, terapeutas y visitas domiciliarias manualmente genera ineficiencias, gastos de transporte y pacientes desatendidos.',
      stat: '25%',
      statLabel: 'de tiempo improductivo estimado',
      color: 'orange',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: '¿Riesgo de sanciones regulatorias?',
      description: 'Supersalud y las secretarías de salud exigen cumplimiento estricto. La documentación incompleta puede resultar en multas, suspensiones o pérdida de habilitación.',
      stat: '$$$',
      statLabel: 'en multas potenciales',
      color: 'purple',
    },
  ];

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      icon: 'text-red-500',
      stat: 'text-red-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: 'text-amber-500',
      stat: 'text-amber-600',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      icon: 'text-orange-500',
      stat: 'text-orange-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      icon: 'text-purple-500',
      stat: 'text-purple-600',
    },
  };

  return (
    <section id="soluciones" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full mb-4">
            LOS DESAFÍOS
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Los retos que enfrentan las IPS domiciliarias{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              todos los días
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
              className={`${colorClasses[challenge.color].bg} ${colorClasses[challenge.color].border} border rounded-2xl p-8 transition-all hover:shadow-lg group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${colorClasses[challenge.color].icon}`}>
                  {challenge.icon}
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${colorClasses[challenge.color].stat}`}>
                    {challenge.stat}
                  </p>
                  <p className="text-xs text-gray-500">{challenge.statLabel}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                {challenge.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {challenge.description}
              </p>
            </div>
          ))}
        </div>

        {/* Solution Teaser */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-blue-700 font-semibold">
            <span>Descubra cómo nuestra plataforma resuelve cada uno de estos desafíos</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Challenges;
