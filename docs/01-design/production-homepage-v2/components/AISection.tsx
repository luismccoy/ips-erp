import React, { useState } from 'react';

/**
 * AI Section - 3 AI Agents
 * 
 * 1. Glosa Defender AI - Defends claims against denials
 * 2. Roster Architect AI - Optimizes staff scheduling
 * 3. RIPS Validator AI - Ensures compliance with regulations
 */

const AISection: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState(0);

  const agents = [
    {
      id: 'glosa-defender',
      name: 'Glosa Defender',
      tagline: 'Defienda su facturación automáticamente',
      description: 'Inteligencia artificial que analiza cada factura antes del envío, detecta inconsistencias que causan glosas, y genera respuestas automáticas respaldadas por evidencia clínica para defender sus ingresos.',
      capabilities: [
        'Análisis predictivo de riesgo de glosa',
        'Detección de inconsistencias CIE-10/CUPS',
        'Generación automática de respuestas de glosa',
        'Dashboard de recuperación de cartera',
      ],
      stats: {
        value: '92%',
        label: 'de glosas defendidas exitosamente',
      },
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'blue',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80',
    },
    {
      id: 'roster-architect',
      name: 'Roster Architect',
      tagline: 'Optimice turnos y rutas inteligentemente',
      description: 'Algoritmos de optimización que asignan personal, planifican rutas de visitas domiciliarias y balancean cargas de trabajo considerando ubicaciones, competencias y preferencias.',
      capabilities: [
        'Asignación automática por competencias',
        'Optimización de rutas geográficas',
        'Balanceo de cargas de trabajo',
        'Predicción de demanda por zonas',
      ],
      stats: {
        value: '2h 45min',
        label: 'ahorradas por enfermera/día',
      },
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'teal',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    },
    {
      id: 'rips-validator',
      name: 'RIPS Validator',
      tagline: 'Compliance garantizado, sin estrés',
      description: 'Validación en tiempo real de datos RIPS según Resolución 3374. Detecta errores antes de la generación de archivos y garantiza cumplimiento con Supersalud y secretarías de salud.',
      capabilities: [
        'Validación en tiempo real de registros',
        'Generación automática archivos CT, AF, US, etc.',
        'Alertas de inconsistencias preventivas',
        'Auditoría de calidad de datos',
      ],
      stats: {
        value: '98%',
        label: 'compliance RIPS garantizado',
      },
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'green',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      gradient: 'from-blue-600 to-blue-700',
    },
    teal: {
      bg: 'bg-teal-600',
      light: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-200',
      gradient: 'from-teal-600 to-teal-700',
    },
    green: {
      bg: 'bg-green-600',
      light: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      gradient: 'from-green-600 to-green-700',
    },
  };

  const currentAgent = agents[activeAgent];
  const currentColors = colorClasses[currentAgent.color];

  return (
    <section id="ia" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center space-x-2 px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>INTELIGENCIA ARTIFICIAL</span>
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            3 Agentes de IA que{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              trabajan 24/7
            </span>{' '}
            para su IPS
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            No es IA genérica. Son agentes especializados entrenados con datos 
            colombianos de salud domiciliaria, codificación CIE-10, y regulaciones 
            de Supersalud.
          </p>
        </div>

        {/* Agent Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {agents.map((agent, index) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(index)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all ${
                activeAgent === index
                  ? `${colorClasses[agent.color].bg} text-white shadow-lg transform scale-105`
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow'
              }`}
            >
              <div className={activeAgent === index ? 'text-white' : colorClasses[agent.color].text}>
                {agent.icon}
              </div>
              <span>{agent.name}</span>
            </button>
          ))}
        </div>

        {/* Active Agent Detail */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Content Side */}
            <div className="p-8 lg:p-12">
              <div className={`inline-flex items-center space-x-2 px-3 py-1 ${currentColors.light} ${currentColors.text} text-sm font-semibold rounded-full mb-4`}>
                {currentAgent.icon}
                <span>{currentAgent.name}</span>
              </div>
              
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {currentAgent.tagline}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-8">
                {currentAgent.description}
              </p>

              {/* Capabilities */}
              <div className="space-y-3 mb-8">
                {currentAgent.capabilities.map((cap, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full ${currentColors.bg} flex items-center justify-center`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{cap}</span>
                  </div>
                ))}
              </div>

              {/* Stat Highlight */}
              <div className={`${currentColors.light} rounded-xl p-6 flex items-center justify-between`}>
                <div>
                  <p className={`text-3xl font-bold ${currentColors.text}`}>
                    {currentAgent.stats.value}
                  </p>
                  <p className="text-sm text-gray-600">{currentAgent.stats.label}</p>
                </div>
                <a
                  href="#demo"
                  className={`inline-flex items-center px-5 py-2.5 bg-gradient-to-r ${currentColors.gradient} text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity`}
                >
                  Ver Demo
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative h-64 lg:h-auto">
              <img
                src={currentAgent.image}
                alt={`${currentAgent.name} en acción`}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${currentColors.gradient} opacity-20`} />
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">Powered by AWS Bedrock</span> — 
            Infraestructura de IA enterprise-grade con seguridad HIPAA
          </p>
        </div>
      </div>
    </section>
  );
};

export default AISection;
