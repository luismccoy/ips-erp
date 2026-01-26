/**
 * Hooks Index
 * 
 * Re-exports all hooks for convenient importing.
 * 
 * Usage:
 * ```typescript
 * import { useNetworkStatus, useSyncStatus, useOfflineData } from '../hooks';
 * ```
 */

// Analytics
export { useAnalytics } from './useAnalytics';

// API
export { useApiCall } from './useApiCall';

// Auth
export { useAuth } from './useAuth';

// Forms
export { useForm } from './useForm';

// Loading
export { useLoadingTimeout } from './useLoadingTimeout';

// Pagination
export { usePagination } from './usePagination';

// Network & Offline (Phase 2)
export { 
  useNetworkStatus,
  useIsOnline,
  type NetworkStatus,
  type NetworkState,
} from './useNetworkStatus';

export {
  useSyncStatus,
  usePendingCount,
  useHasSyncIssues,
  type SyncStatusState,
  type SyncStatusActions,
  type UseSyncStatusReturn,
} from './useSyncStatus';

export {
  useOfflineData,
  useOfflineMutation,
  type DataSource,
  type UseOfflineDataOptions,
  type UseOfflineDataReturn,
  type UseOfflineMutationOptions,
  type UseOfflineMutationReturn,
} from './useOfflineData';
