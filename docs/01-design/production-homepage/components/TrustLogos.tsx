import React from 'react';

/**
 * Trust Logos Section - Colombian Healthcare Certifications
 * 
 * Shows real certifications and partnerships:
 * - RIPS Compliant (Resolución 3374)
 * - AWS Technology Partner
 * - ISO 27001 (Data Security)
 * - Supersalud Compatible
 * - INVIMA Registered
 */

const TrustLogos: React.FC = () => {
  const certifications = [
    {
      name: 'RIPS Compliant',
      description: 'Resolución 3374',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'AWS Partner',
      description: 'Technology Partner',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 01-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 01-.287-.375 6.18 6.18 0 01-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.296.072-.583.16-.863.279a2.16 2.16 0 01-.263.095.46.46 0 01-.12.016c-.104 0-.155-.072-.155-.224v-.391c0-.112.016-.2.056-.256.04-.063.112-.12.216-.168a4.5 4.5 0 011.006-.342c.383-.088.79-.128 1.22-.128.935 0 1.62.213 2.058.638.432.424.655 1.07.655 1.931v2.543l-.016.016zm-3.24 1.213c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.511a1.2 1.2 0 00.32-.575c.048-.216.08-.472.08-.767v-.367a6.757 6.757 0 00-.735-.136 6.016 6.016 0 00-.751-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.83.296l-.039.168v.001z" />
        </svg>
      ),
    },
    {
      name: 'ISO 27001',
      description: 'Seguridad de Datos',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      name: 'Supersalud',
      description: 'Compatible',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      name: 'Resolución 3100',
      description: 'Habilitación',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-12 bg-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Label */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Certificaciones & Cumplimiento Regulatorio
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 group cursor-default"
            >
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                {cert.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {cert.name}
                </p>
                <p className="text-xs text-gray-500">{cert.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Statement */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500">
            Más de <span className="font-semibold text-blue-700">500 IPS</span> confían en nuestra plataforma para su operación diaria
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustLogos;
