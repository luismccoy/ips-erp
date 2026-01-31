import React from 'react';

/**
 * Mobile App Section - Nurse Mobile Application
 * 
 * Highlights the field-ready mobile app for:
 * - Clinical documentation
 * - Offline capabilities
 * - Voice dictation
 * - Route optimization
 */

const MobileAppSection: React.FC = () => {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
      ),
      title: 'Funciona Offline',
      description: 'Documente sin conexión. La app sincroniza automáticamente cuando hay señal.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      title: 'Dictado por Voz',
      description: 'Dicte sus notas clínicas. IA transcribe, estructura y sugiere codificación.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      title: 'Ruta Optimizada',
      description: 'Vea su agenda del día con rutas optimizadas entre visitas domiciliarias.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: 'Escalas Clínicas',
      description: 'Barthel, Karnofsky, Norton, EVA y más. Con cálculo automático y alertas.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Captura de Evidencias',
      description: 'Fotos de heridas, firmas digitales y documentos adjuntos.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Check-in Automático',
      description: 'Registro de llegada y salida con geolocalización para trazabilidad.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <div>
            {/* Section Label */}
            <span className="inline-flex items-center space-x-2 px-4 py-1.5 text-xs font-semibold text-teal-300 bg-teal-900/30 rounded-full mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>APP MÓVIL PARA CAMPO</span>
            </span>

            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Documentación clínica{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                donde ocurre el cuidado
              </span>
            </h2>

            <p className="text-lg text-white/80 leading-relaxed mb-10">
              Su equipo de enfermería necesita herramientas que funcionen en el campo, 
              no en condiciones ideales de oficina. Nuestra app está diseñada para la 
              realidad del cuidado domiciliario en Colombia.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 text-teal-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-white/60">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* App Store Badges */}
            <div className="flex flex-wrap items-center gap-4">
              <a href="#" className="inline-block">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 leading-none">Descárgalo en</p>
                    <p className="text-sm font-semibold text-gray-900">App Store</p>
                  </div>
                </div>
              </a>
              <a href="#" className="inline-block">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 01-.609-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.807 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 leading-none">Disponible en</p>
                    <p className="text-sm font-semibold text-gray-900">Google Play</p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Phone Mockup Side */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Phone Frame */}
            <div className="relative">
              {/* Phone Device */}
              <div className="relative w-72 h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="h-8 bg-blue-600 flex items-center justify-between px-6">
                    <span className="text-white text-xs">9:41</span>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.18.18.43.29.71.29s.53-.11.71-.29l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/>
                      </svg>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 4h-3V2h-4v2H7v18h10V4z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* App Content Preview */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs text-gray-500">Buenos días</p>
                        <p className="text-lg font-bold text-gray-900">María García</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">MG</span>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-blue-700">6</p>
                        <p className="text-xs text-gray-600">Visitas Hoy</p>
                      </div>
                      <div className="bg-teal-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-teal-700">2</p>
                        <p className="text-xs text-gray-600">Completadas</p>
                      </div>
                    </div>

                    {/* Next Visit */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-600">PRÓXIMA VISITA</span>
                        <span className="text-xs text-gray-500">10:30 AM</span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">Carlos Ramírez</p>
                      <p className="text-xs text-gray-500 mb-2">Cra 45 #67-89, Bogotá</p>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-medium rounded">Curación</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">Signos</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm">
                      Iniciar Ruta del Día
                    </button>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;
