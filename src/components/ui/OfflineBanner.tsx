/**
 * OfflineBanner Component
 * 
 * Global banner showing offline/syncing status at the top of the screen.
 * Only visible when offline, slow, or syncing.
 * 
 * Usage:
 * ```tsx
 * // In App.tsx or layout
 * <OfflineBanner />
 * <main>{children}</main>
 * ```
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 8.1: Global Offline Banner
 */

import { Wifi, WifiOff, Cloud, Loader2 } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useSyncStatus } from '../../hooks/useSyncStatus';

export function OfflineBanner() {
  const { status: networkStatus, isOffline, isSlow } = useNetworkStatus();
  const { pendingCount, isSyncing, lastSyncTimeFormatted } = useSyncStatus();

  // Don't show when fully online and synced
  if (networkStatus === 'online' && pendingCount === 0 && !isSyncing) {
    return null;
  }

  const getBannerConfig = () => {
    if (isOffline) {
      return {
        bgColor: 'bg-red-600',
        icon: <WifiOff size={16} />,
        message: 'Sin conexión - Los cambios se guardan localmente',
      };
    }

    if (isSlow) {
      return {
        bgColor: 'bg-yellow-600',
        icon: <Wifi size={16} className="opacity-50" />,
        message: 'Conexión lenta - Modo ahorro de datos activado',
      };
    }

    if (isSyncing) {
      return {
        bgColor: 'bg-blue-600',
        icon: <Loader2 size={16} className="animate-spin" />,
        message: `Sincronizando ${pendingCount} cambios...`,
      };
    }

    if (pendingCount > 0) {
      return {
        bgColor: 'bg-blue-600',
        icon: <Cloud size={16} />,
        message: `${pendingCount} cambios pendientes de sincronizar`,
      };
    }

    return null;
  };

  const config = getBannerConfig();
  if (!config) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium text-white ${config.bgColor}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2">
        {config.icon}
        <span>{config.message}</span>
        {lastSyncTimeFormatted && networkStatus === 'online' && pendingCount === 0 && (
          <span className="text-xs opacity-75">• Última sync: {lastSyncTimeFormatted}</span>
        )}
      </div>
    </div>
  );
}

export default OfflineBanner;
