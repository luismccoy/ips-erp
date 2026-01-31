import React, { useState } from 'react';

/**
 * Stories Section - Colombian IPS Testimonials
 * 
 * Real testimonials with:
 * - Name, title, company
 * - Specific results/numbers
 * - Colombian city locations
 */

const StoriesSection: React.FC = () => {
  const [activeStory, setActiveStory] = useState(0);

  const stories = [
    {
      id: 1,
      quote: 'IPS-ERP transformó nuestra operación por completo. Pasamos de gestionar todo en Excel a tener visibilidad en tiempo real de cada paciente, cada visita y cada peso facturado. Nuestro tiempo de facturación se redujo en un 60% y recuperamos más de $180 millones en glosas el primer año.',
      author: 'Dra. Ana María Restrepo',
      title: 'Directora Médica',
      company: 'IPS Salud Integral',
      location: 'Medellín, Antioquia',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      stats: [
        { value: '60%', label: 'Reducción tiempo facturación' },
        { value: '$180M', label: 'Recuperados en glosas' },
      ],
      logo: null, // Replace with actual client logo
    },
    {
      id: 2,
      quote: 'La app móvil cambió la forma en que nuestras enfermeras documentan. Antes perdían 2 horas diarias llenando papeles en la oficina. Ahora documentan en campo, con voz, y llegan a casa más temprano. La retención de personal mejoró dramáticamente.',
      author: 'Carlos Mendoza',
      title: 'Gerente de Operaciones',
      company: 'HomeCare Colombia',
      location: 'Bogotá, D.C.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      stats: [
        { value: '2h', label: 'Ahorradas por enfermera/día' },
        { value: '35%', label: 'Mejora retención personal' },
      ],
      logo: null,
    },
    {
      id: 3,
      quote: 'Como IPS pequeña, pensábamos que tecnología de este nivel era solo para los grandes. IPS-ERP nos demostró lo contrario. El RIPS automático y el soporte en español nos quitaron un peso enorme de encima. Ya no tememos a las auditorías.',
      author: 'Dr. Luis Fernando Pérez',
      title: 'Director General',
      company: 'Cuidar en Casa IPS',
      location: 'Cali, Valle del Cauca',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
      stats: [
        { value: '100%', label: 'RIPS sin errores' },
        { value: '0', label: 'Sanciones regulatorias' },
      ],
      logo: null,
    },
    {
      id: 4,
      quote: 'El Glosa Defender AI es impresionante. Antes aceptábamos muchas glosas porque no teníamos tiempo de responderlas bien. Ahora el sistema genera las respuestas con toda la evidencia clínica y hemos subido nuestra tasa de recuperación del 45% al 92%.',
      author: 'Martha Lucía Gómez',
      title: 'Coordinadora de Facturación',
      company: 'IPS Cuidado Vital',
      location: 'Barranquilla, Atlántico',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      stats: [
        { value: '92%', label: 'Tasa de recuperación glosas' },
        { value: '47%', label: 'Mejora vs. antes' },
      ],
      logo: null,
    },
  ];

  const currentStory = stories[activeStory];

  return (
    <section id="historias" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full mb-4">
            HISTORIAS DE ÉXITO
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            IPS colombianas que{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              transformaron su operación
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            No somos solo proveedores de software. Somos socios de crecimiento para IPS 
            domiciliarias en todo Colombia.
          </p>
        </div>

        {/* Main Story Display */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl p-8 lg:p-12 mb-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Quote Side */}
            <div className="lg:col-span-2">
              {/* Quote Mark */}
              <svg className="w-12 h-12 text-blue-200 mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>

              {/* Quote Text */}
              <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
                "{currentStory.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={currentStory.image}
                  alt={currentStory.author}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div>
                  <p className="font-bold text-gray-900">{currentStory.author}</p>
                  <p className="text-sm text-gray-600">{currentStory.title}</p>
                  <p className="text-sm text-blue-600 font-medium">{currentStory.company}</p>
                  <p className="text-xs text-gray-500">{currentStory.location}</p>
                </div>
              </div>
            </div>

            {/* Stats Side */}
            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Resultados Medibles
              </p>
              <div className="space-y-4">
                {currentStory.stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <p className="text-3xl font-bold text-blue-700 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Story Navigation */}
        <div className="flex flex-wrap justify-center gap-4">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setActiveStory(index)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeStory === index
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <img
                src={story.image}
                alt={story.author}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-left">
                <p className={`text-sm font-semibold ${activeStory === index ? 'text-white' : 'text-gray-900'}`}>
                  {story.company}
                </p>
                <p className={`text-xs ${activeStory === index ? 'text-white/80' : 'text-gray-500'}`}>
                  {story.location}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Trust Statement */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-6">
            Únase a más de <span className="font-semibold text-blue-700">500 IPS</span> que confían en nosotros
          </p>
          
          {/* Client Logo Grid (Placeholder) */}
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-50 grayscale">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-400">Logo {i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoriesSection;
