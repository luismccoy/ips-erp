/**
 * Sync Progress Indicator Component
 * 
 * Floating indicator showing sync progress when synchronization is in progress.
 * Displays:
 * - Progress bar
 * - Count of synced/pending items
 * - Option to dismiss
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 8.4: Sync Progress Indicator
 */

import { useState } from 'react';
import { Loader2, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '../hooks/useSyncStatus';

export interface SyncProgressIndicatorProps {
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Allow dismissing the indicator */
  dismissible?: boolean;
  /** Optional className */
  className?: string;
}

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-16 right-4', // Account for offline banner
  'top-left': 'top-16 left-4',
};

export function SyncProgressIndicator({
  position = 'bottom-right',
  dismissible = true,
  className = '',
}: SyncProgressIndicatorProps) {
  const {
    pendingCount,
    isSyncing,
    lastSyncTimeFormatted,
    hasErrors,
    errors,
    retryFailed,
    clearAllErrors,
  } = useSyncStatus();
  
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Don't show if dismissed, not syncing, and no pending items
  if (isDismissed || (!isSyncing && pendingCount === 0 && !hasErrors)) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryFailed();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Reset dismissed state after a while so it shows again if new items appear
    setTimeout(() => setIsDismissed(false), 30000);
  };

  // Calculate progress
  // For this implementation, we use pending count as an approximation
  const progress = isSyncing ? 50 : hasErrors ? 100 : 0;

  return (
    <div
      className={`
        fixed ${positionClasses[position]} z-40
        bg-slate-800 border border-slate-700 rounded-xl shadow-lg
        min-w-[240px] max-w-[320px] overflow-hidden
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <Loader2 size={16} className="animate-spin text-blue-400" />
          ) : hasErrors ? (
            <AlertCircle size={16} className="text-red-400" />
          ) : pendingCount > 0 ? (
            <Loader2 size={16} className="text-yellow-400" />
          ) : (
            <Check size={16} className="text-green-400" />
          )}
          <span className="text-sm font-medium text-white">
            {isSyncing ? 'Sincronizando...' : 
             hasErrors ? 'Error de sincronización' :
             pendingCount > 0 ? 'Cambios pendientes' : 
             'Sincronizado'}
          </span>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 -mr-1"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        {/* Progress bar (only when syncing) */}
        {isSyncing && (
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Pending count */}
        {pendingCount > 0 && (
          <div className="text-sm text-slate-300">
            <span className="font-medium text-white">{pendingCount}</span>
            {' '}cambio{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Errors section */}
        {hasErrors && (
          <div className="space-y-2">
            <div className="text-xs text-red-400">
              {errors.length} error{errors.length !== 1 ? 'es' : ''} de sincronización
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
                Reintentar
              </button>
              <button
                onClick={clearAllErrors}
                className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Last sync time */}
        {lastSyncTimeFormatted && !isSyncing && pendingCount === 0 && !hasErrors && (
          <div className="text-xs text-slate-400">
            Última sincronización: {lastSyncTimeFormatted}
          </div>
        )}
      </div>
    </div>
  );
}

export default SyncProgressIndicator;
