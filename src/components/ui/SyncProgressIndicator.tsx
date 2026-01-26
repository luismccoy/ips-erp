/**
 * SyncProgressIndicator Component
 * 
 * Floating indicator showing sync progress when multiple items are syncing.
 * 
 * Usage:
 * ```tsx
 * <SyncProgressIndicator />
 * ```
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 8.4: Sync Progress Indicator
 */

import { Loader2, X } from 'lucide-react';
import { useSyncStatus } from '../../hooks/useSyncStatus';

interface SyncProgressIndicatorProps {
  /** Whether the indicator can be dismissed */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
}

export function SyncProgressIndicator({ 
  dismissible = false, 
  onDismiss 
}: SyncProgressIndicatorProps) {
  const { pendingCount, isSyncing, errors, hasErrors } = useSyncStatus();

  // Only show when actively syncing
  if (!isSyncing || pendingCount === 0) {
    return null;
  }

  // Calculate progress (this is an approximation since we don't track completed)
  // In a real implementation, you'd track both pending and completed counts
  const estimatedTotal = pendingCount + (hasErrors ? errors.length : 0);
  const estimatedCompleted = 0; // Would be tracked separately
  const progress = estimatedTotal > 0 
    ? Math.round((estimatedCompleted / estimatedTotal) * 100) 
    : 0;

  return (
    <div 
      className="fixed bottom-4 right-4 bg-slate-800 p-4 rounded-xl shadow-lg min-w-[220px] z-40 border border-slate-700"
      role="status"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin text-blue-400" />
          <span className="text-sm font-medium text-white">Sincronizando...</span>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Details */}
      <div className="text-xs text-slate-400">
        {pendingCount} cambios pendientes
        {hasErrors && (
          <span className="text-red-400 ml-2">
            • {errors.length} errores
          </span>
        )}
      </div>
    </div>
  );
}

export default SyncProgressIndicator;
