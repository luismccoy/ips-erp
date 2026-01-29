import React, { useState } from 'react';
import { useLoadingTimeout } from '../hooks/useLoadingTimeout';

export const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    hasTimedOut, 
    retry,
    currentRetryCount 
  } = useLoadingTimeout(isLoading, {
    timeoutMs: 30000, // 30 seconds
    onTimeout: () => {
      console.warn('Carga de datos del panel de administración demorada');
    },
    retryCount: 1
  });

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Simulated data fetch
      await fetchData();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  if (hasTimedOut) {
    return (
      <div className="error-container">
        <h2>Error de Carga</h2>
        <p>Los datos tardan demasiado en cargar. Por favor, inténtelo de nuevo.</p>
        <button onClick={retry}>
          Reintentar Carga {currentRetryCount > 0 ? `(Intento ${currentRetryCount})` : ''}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Normal dashboard content */}
      {isLoading && <p>Cargando datos...</p>}
    </div>
  );
};