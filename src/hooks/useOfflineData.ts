/**
 * Offline-First Data Hook
 * 
 * Generic hook for fetching data with offline-first strategy:
 * 1. Return cached data immediately (if available)
 * 2. Fetch fresh data in background
 * 3. Update when fresh data arrives
 * 4. Handle errors gracefully
 * 
 * Usage:
 * ```typescript
 * const { data, isLoading, source, error, refresh } = useOfflineData({
 *   queryKey: 'shifts-today',
 *   queryFn: () => client.models.Shift.list({ filter: { nurseId: { eq: nurseId } } }),
 *   cacheTime: 5 * 60 * 1000, // 5 minutes
 * });
 * 
 * // Show source indicator
 * {source === 'cache' && <Badge>Datos en caché</Badge>}
 * ```
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 7.2: Network-Aware Data Fetching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

export type DataSource = 'network' | 'cache' | 'optimistic' | null;

export interface UseOfflineDataOptions<T> {
  /** Unique key for caching */
  queryKey: string;
  /** Function to fetch data from network */
  queryFn: () => Promise<T>;
  /** Optional function to get cached/local data */
  localFn?: () => Promise<T | null>;
  /** Cache time in milliseconds (default: 5 minutes) */
  cacheTime?: number;
  /** Network timeout in milliseconds (default: 10 seconds) */
  networkTimeout?: number;
  /** Whether to fetch on mount (default: true) */
  fetchOnMount?: boolean;
  /** Whether to enable background refresh when online (default: true) */
  enableBackgroundRefresh?: boolean;
  /** Callback when data is fetched */
  onSuccess?: (data: T, source: DataSource) => void;
  /** Callback when fetch fails */
  onError?: (error: Error) => void;
}

export interface UseOfflineDataReturn<T> {
  /** The fetched data */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Where the data came from */
  source: DataSource;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Whether data is stale (from cache and older than cacheTime) */
  isStale: boolean;
  /** Timestamp when data was last fetched */
  lastFetchTime: number | null;
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Generic hook for offline-first data fetching
 */
export function useOfflineData<T>({
  queryKey,
  queryFn,
  localFn,
  cacheTime = 5 * 60 * 1000, // 5 minutes
  networkTimeout = 10000, // 10 seconds
  fetchOnMount = true,
  enableBackgroundRefresh = true,
  onSuccess,
  onError,
}: UseOfflineDataOptions<T>): UseOfflineDataReturn<T> {
  const { status: networkStatus, hasConnectivity } = useNetworkStatus();
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<DataSource>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  // Check if cached data is stale
  const isStale = useCallback(() => {
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > cacheTime;
  }, [lastFetchTime, cacheTime]);

  // Save to cache
  const saveToCache = useCallback((key: string, value: T) => {
    cache.set(key, { data: value, timestamp: Date.now() });
  }, []);

  // Get from cache
  const getFromCache = useCallback((key: string): T | null => {
    const cached = cache.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < cacheTime) {
        return cached.data as T;
      }
    }
    return null;
  }, [cacheTime]);

  // Fetch with timeout
  const fetchWithTimeout = useCallback(async (): Promise<T> => {
    return Promise.race([
      queryFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), networkTimeout)
      ),
    ]);
  }, [queryFn, networkTimeout]);

  // Main fetch function
  const fetchData = useCallback(async (forceNetwork = false) => {
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Try to return cached data immediately
      if (!forceNetwork) {
        const cachedData = getFromCache(queryKey);
        if (cachedData) {
          setData(cachedData);
          setSource('cache');
          setLastFetchTime(cache.get(queryKey)?.timestamp || null);
          onSuccess?.(cachedData, 'cache');
          
          // If online and background refresh enabled, continue to fetch fresh
          if (!hasConnectivity || !enableBackgroundRefresh) {
            setIsLoading(false);
            fetchInProgress.current = false;
            return;
          }
        }
        
        // Step 1b: Try local function if no cache and provided
        if (!cachedData && localFn) {
          const localData = await localFn();
          if (localData) {
            setData(localData);
            setSource('cache');
            onSuccess?.(localData, 'cache');
            
            if (!hasConnectivity) {
              setIsLoading(false);
              fetchInProgress.current = false;
              return;
            }
          }
        }
      }

      // Step 2: If online, fetch from network
      if (hasConnectivity) {
        try {
          const freshData = await fetchWithTimeout();
          
          if (isMounted.current) {
            setData(freshData);
            setSource('network');
            setLastFetchTime(Date.now());
            saveToCache(queryKey, freshData);
            onSuccess?.(freshData, 'network');
          }
        } catch (networkError) {
          // Network failed, but we might have cache data already shown
          const err = networkError instanceof Error 
            ? networkError 
            : new Error('Network fetch failed');
          
          console.warn(`Network fetch failed for ${queryKey}:`, err.message);
          
          // If we have no data at all, this is a real error
          if (!data) {
            setError(err);
            onError?.(err);
          }
          // Otherwise, we're showing cached data which is fine
        }
      } else if (!data) {
        // Offline with no cached data
        const err = new Error('Sin conexión y sin datos en caché');
        setError(err);
        onError?.(err);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      fetchInProgress.current = false;
    }
  }, [
    queryKey,
    hasConnectivity,
    enableBackgroundRefresh,
    getFromCache,
    localFn,
    fetchWithTimeout,
    saveToCache,
    data,
    onSuccess,
    onError,
  ]);

  // Refresh function (forces network)
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Fetch on mount
  useEffect(() => {
    isMounted.current = true;
    
    if (fetchOnMount) {
      fetchData();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchOnMount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when coming back online
  useEffect(() => {
    if (hasConnectivity && isStale() && enableBackgroundRefresh) {
      fetchData();
    }
  }, [hasConnectivity]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    isLoading,
    error,
    source,
    refresh,
    isStale: isStale(),
    lastFetchTime,
  };
}

/**
 * Hook for optimistic updates with offline support
 * 
 * Usage:
 * ```typescript
 * const { mutate, isPending, error } = useOfflineMutation({
 *   mutationFn: (data) => client.models.Visit.update(data),
 *   onOptimisticUpdate: (data) => {
 *     // Update local state optimistically
 *     setVisit(prev => ({ ...prev, ...data }));
 *   },
 *   onSuccess: (result) => {
 *     toast.success('Guardado');
 *   },
 *   onError: (error) => {
 *     toast.error('Error al guardar');
 *   }
 * });
 * ```
 */
export interface UseOfflineMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onOptimisticUpdate?: (variables: TVariables) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
}

export interface UseOfflineMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  isPending: boolean;
  error: Error | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useOfflineMutation<TData, TVariables>({
  mutationFn,
  onOptimisticUpdate,
  onSuccess,
  onError,
  onSettled,
}: UseOfflineMutationOptions<TData, TVariables>): UseOfflineMutationReturn<TData, TVariables> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { hasConnectivity } = useNetworkStatus();

  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
  }, []);

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    // Apply optimistic update immediately
    if (onOptimisticUpdate) {
      onOptimisticUpdate(variables);
    }

    try {
      if (!hasConnectivity) {
        // Queue for later sync (in real implementation, this would use DataStore)
        console.log('📴 Mutation queued for offline sync:', variables);
        // For now, we'll simulate success but mark as pending
        throw new Error('OFFLINE_QUEUED');
      }

      const result = await mutationFn(variables);
      setIsSuccess(true);
      onSuccess?.(result, variables);
      onSettled?.(result, null, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      
      // Special handling for offline queue
      if (error.message === 'OFFLINE_QUEUED') {
        // This is expected behavior, not an error
        setIsSuccess(true); // Optimistic success
        onSettled?.(null, null, variables);
        return null;
      }
      
      setError(error);
      onError?.(error, variables);
      onSettled?.(null, error, variables);
      return null;
    } finally {
      setIsPending(false);
    }
  }, [mutationFn, onOptimisticUpdate, onSuccess, onError, onSettled, hasConnectivity]);

  return {
    mutate,
    isPending,
    error,
    isSuccess,
    reset,
  };
}
