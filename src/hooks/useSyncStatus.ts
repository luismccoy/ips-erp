/**
 * Sync Status Hook
 * 
 * Provides real-time sync status information for UI feedback.
 * 
 * Usage:
 * ```typescript
 * const { 
 *   pendingCount, 
 *   isSyncing, 
 *   lastSyncTime, 
 *   errors,
 *   retrySync 
 * } = useSyncStatus();
 * 
 * if (pendingCount > 0) {
 *   showPendingBadge(pendingCount);
 * }
 * ```
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 8: UI Indicators
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSyncState,
  subscribeSyncState,
  forceSyncRefresh,
  retryFailedMutations,
  clearSyncError,
  clearAllSyncErrors,
  type SyncMetadata,
  type SyncError,
} from '../datastore';

export interface SyncStatusState {
  /** Number of pending mutations waiting to sync */
  pendingCount: number;
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** ISO timestamp of last successful sync */
  lastSyncTime: string | null;
  /** Human-readable last sync time (e.g., "hace 5 minutos") */
  lastSyncTimeFormatted: string | null;
  /** List of sync errors */
  errors: SyncError[];
  /** Whether there are any errors */
  hasErrors: boolean;
  /** Whether everything is synced */
  isFullySynced: boolean;
}

export interface SyncStatusActions {
  /** Force a sync refresh */
  refresh: () => Promise<void>;
  /** Retry all failed mutations */
  retryFailed: () => Promise<{ retried: number; failed: number }>;
  /** Clear a specific error */
  clearError: (errorId: string) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
}

export type UseSyncStatusReturn = SyncStatusState & SyncStatusActions;

/**
 * Format time difference in Spanish
 */
function formatTimeAgo(isoString: string | null): string | null {
  if (!isoString) return null;
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'hace unos segundos';
  if (diffMin === 1) return 'hace 1 minuto';
  if (diffMin < 60) return `hace ${diffMin} minutos`;
  if (diffHour === 1) return 'hace 1 hora';
  if (diffHour < 24) return `hace ${diffHour} horas`;
  if (diffDay === 1) return 'hace 1 día';
  return `hace ${diffDay} días`;
}

/**
 * Hook to track sync status for UI feedback
 */
export function useSyncStatus(): UseSyncStatusReturn {
  const [state, setState] = useState<SyncMetadata>(() => getSyncState());
  const [lastSyncFormatted, setLastSyncFormatted] = useState<string | null>(null);

  // Subscribe to sync state changes
  useEffect(() => {
    const unsubscribe = subscribeSyncState((newState) => {
      setState(newState);
    });
    
    return unsubscribe;
  }, []);

  // Update formatted time periodically
  useEffect(() => {
    const updateFormatted = () => {
      setLastSyncFormatted(formatTimeAgo(state.lastSyncTime));
    };
    
    updateFormatted();
    const interval = setInterval(updateFormatted, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [state.lastSyncTime]);

  // Actions
  const refresh = useCallback(async () => {
    await forceSyncRefresh();
  }, []);

  const retryFailed = useCallback(async () => {
    return retryFailedMutations();
  }, []);

  const clearError = useCallback((errorId: string) => {
    clearSyncError(errorId);
  }, []);

  const clearAllErrorsAction = useCallback(() => {
    clearAllSyncErrors();
  }, []);

  return {
    pendingCount: state.pendingMutations,
    isSyncing: state.isSyncing,
    lastSyncTime: state.lastSyncTime,
    lastSyncTimeFormatted: lastSyncFormatted,
    errors: state.errors,
    hasErrors: state.errors.length > 0,
    isFullySynced: state.pendingMutations === 0 && state.errors.length === 0,
    refresh,
    retryFailed,
    clearError,
    clearAllErrors: clearAllErrorsAction,
  };
}

/**
 * Simple hook that just returns pending count
 * For badge displays
 */
export function usePendingCount(): number {
  const { pendingCount } = useSyncStatus();
  return pendingCount;
}

/**
 * Hook to check if there are sync issues that need attention
 */
export function useHasSyncIssues(): boolean {
  const { hasErrors, pendingCount } = useSyncStatus();
  // Has issues if errors exist or too many pending (stuck)
  return hasErrors || pendingCount > 10;
}
