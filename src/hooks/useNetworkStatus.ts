/**
 * Network Status Hook
 * 
 * Detects network connectivity and connection quality for offline-first UX.
 * 
 * Features:
 * - Online/offline detection
 * - Slow connection detection (2G, slow-2g, high RTT)
 * - Network quality metrics (effectiveType, downlink, RTT)
 * - Save data mode detection
 * 
 * Usage:
 * ```typescript
 * const { status, effectiveType, isOnline, isSlow } = useNetworkStatus();
 * 
 * if (status === 'offline') {
 *   showOfflineBanner();
 * } else if (status === 'slow') {
 *   enableLowDataMode();
 * }
 * ```
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 7: Network Status Detection
 */

import { useState, useEffect, useCallback } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'slow';

export interface NetworkState {
  /** Current network status */
  status: NetworkStatus;
  /** Effective connection type ('4g', '3g', '2g', 'slow-2g') */
  effectiveType: string | null;
  /** Estimated downlink speed in Mbps */
  downlink: number | null;
  /** Round-trip time in milliseconds */
  rtt: number | null;
  /** Whether user has requested reduced data usage */
  saveData: boolean;
  /** Convenience: true if online or slow (has some connectivity) */
  hasConnectivity: boolean;
  /** Convenience: true if status is 'online' */
  isOnline: boolean;
  /** Convenience: true if status is 'slow' */
  isSlow: boolean;
  /** Convenience: true if status is 'offline' */
  isOffline: boolean;
}

// Network Information API types (not in standard lib)
interface NetworkInformation extends EventTarget {
  readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
  onchange: ((this: NetworkInformation, ev: Event) => void) | null;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Hook to monitor network status and quality
 */
export function useNetworkStatus(): NetworkState {
  const [state, setState] = useState<NetworkState>(() => ({
    status: typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: false,
    hasConnectivity: typeof navigator !== 'undefined' && navigator.onLine,
    isOnline: typeof navigator !== 'undefined' && navigator.onLine,
    isSlow: false,
    isOffline: typeof navigator === 'undefined' || !navigator.onLine,
  }));

  const updateNetworkInfo = useCallback(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    let status: NetworkStatus = navigator.onLine ? 'online' : 'offline';
    let effectiveType: string | null = null;
    let downlink: number | null = null;
    let rtt: number | null = null;
    let saveData = false;

    if (connection && navigator.onLine) {
      effectiveType = connection.effectiveType;
      downlink = connection.downlink;
      rtt = connection.rtt;
      saveData = connection.saveData;
      
      // Detect slow connection
      // Per spec: slow-2g, 2g, RTT > 500ms, or downlink < 0.5 Mbps
      if (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.rtt > 500 ||
        connection.downlink < 0.5
      ) {
        status = 'slow';
      }
    }

    setState({
      status,
      effectiveType,
      downlink,
      rtt,
      saveData,
      hasConnectivity: status !== 'offline',
      isOnline: status === 'online',
      isSlow: status === 'slow',
      isOffline: status === 'offline',
    });
  }, []);

  useEffect(() => {
    // Initial update
    updateNetworkInfo();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    // Listen for connection quality changes
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [updateNetworkInfo]);

  return state;
}

/**
 * Simple hook that just returns online/offline boolean
 * For components that don't need detailed network info
 */
export function useIsOnline(): boolean {
  const { hasConnectivity } = useNetworkStatus();
  return hasConnectivity;
}
