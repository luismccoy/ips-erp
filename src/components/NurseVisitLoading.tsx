import React, { useState } from 'react';
import { useLoadingTimeout } from '../hooks/useLoadingTimeout';

export const NurseVisitLoading: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    hasTimedOut, 
    retry,
    currentRetryCount 
  } = useLoadingTimeout(isLoading, {
    timeoutMs: 30000, // 30 seconds
    onTimeout: () => {
      console.warn('Carga de visita de enfermería demorada');
    },
    retryCount: 1
  });

  const loadNurseVisit = async () => {
    setIsLoading(true);
    try {
      // Simulated visit loading
      await fetchVisitDetails();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  if (hasTimedOut) {
    return (
      <div className="error-container">
        <h2>Error de Carga de Visita</h2>
        <p>Los detalles de la visita tardan demasiado en cargar. Por favor, inténtelo de nuevo.</p>
        <button onClick={retry}>
          Reintentar Carga {currentRetryCount > 0 ? `(Intento ${currentRetryCount})` : ''}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Normal nurse visit content */}
      {isLoading && <p>Cargando detalles de la visita...</p>}
    </div>
  );
};