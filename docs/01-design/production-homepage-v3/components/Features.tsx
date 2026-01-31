import React from 'react';

/**
 * Features Section V3 - Mobile/Tablet Compatibility Showcase
 * 
 * IMAGE REQUIREMENT:
 * - Tablet or phone mockup showing REAL Nurse Module interface
 * - Screenshot from actual IPS-ERP application (not generic stock)
 * - Clean device mockup (iPad/iPhone style preferred)
 * 
 * GOAL: Demonstrate mobile compatibility with actual product screenshot
 * 
 * TODO: Capture real screenshot from http://localhost:8888/nurse once running
 */

const Features: React.FC = () => {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Móvil & Tablet',
      description: 'Acceso completo desde cualquier dispositivo móvil',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: 'Sin Conexión',
      description: 'Trabaje offline, sincronización automática',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      title: 'Tiempo Real',
      description: 'Actualizaciones instantáneas para todo el equipo',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Seguro',
      description: 'Encriptación de extremo a extremo, cumple HABEAS DATA',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content Side */}
          <div className="order-2 lg:order-1">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 rounded-full mb-4">
              TECNOLOGÍA MÓVIL
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Su equipo trabaja en el campo.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                Su software también.
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Enfermeras, terapeutas y auxiliares registran visitas directamente desde 
              sus dispositivos móviles. Información sincronizada en tiempo real, 
              disponible para auditoría y facturación inmediata.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex-shrink-0 text-blue-600 group-hover:text-teal-600 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="#demo"
              className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl hover:shadow-lg transition-all group"
            >
              Ver Demo en Vivo
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          {/* Device Mockup Side */}
          <div className="order-1 lg:order-2 relative">
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-40 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse animation-delay-1000" />

            {/* Tablet/Phone Mockup Container */}
            <div className="relative z-10">
              {/* Tablet Frame (iPad-style) */}
              <div className="relative mx-auto" style={{ maxWidth: '500px' }}>
                {/* Device Shadow */}
                <div className="absolute inset-0 transform translate-y-4 bg-gray-900/10 rounded-3xl blur-2xl" />
                
                {/* Device Bezel */}
                <div className="relative bg-gray-900 rounded-3xl p-3 shadow-2xl">
                  {/* Screen */}
                  <div className="relative bg-white rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    {/* PLACEHOLDER: Real Nurse Module Screenshot */}
                    <img
                      src="PLACEHOLDER_NURSE_MODULE_SCREENSHOT_URL"
                      alt="Módulo de enfermera en tablet mostrando registro de visita domiciliaria"
                      className="w-full h-full object-cover object-top"
                    />
                    
                    {/* Temporary Placeholder Text (remove when real screenshot added) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
                      <div className="text-center p-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Módulo de Enfermera</p>
                        <p className="text-xs text-gray-500">Captura de pantalla real próximamente</p>
                      </div>
                    </div>

                    {/* Interactive "Pulse" Indicator (simulate live data) */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <span>EN VIVO</span>
                    </div>
                  </div>

                  {/* Home Indicator (iPad style) */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full" />
                </div>
              </div>

              {/* Floating Feature Cards */}
              <div className="hidden lg:block">
                {/* GPS Card */}
                <div className="absolute -left-12 top-20 bg-white rounded-xl shadow-xl p-4 w-40 animate-float">
                  <div className="flex items-center space-x-2 text-green-600 mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-semibold">Geolocalización</span>
                  </div>
                  <p className="text-xs text-gray-600">Verificación automática de visita</p>
                </div>

                {/* Camera Card */}
                <div className="absolute -right-12 bottom-32 bg-white rounded-xl shadow-xl p-4 w-40 animate-float animation-delay-500">
                  <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-semibold">Fotos</span>
                  </div>
                  <p className="text-xs text-gray-600">Evidencia fotográfica integrada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
