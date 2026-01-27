/**
 * Offline Banner Component
 * 
 * Global banner showing network status and sync information.
 * Displays at top of app when:
 * - Offline (red banner)
 * - Slow connection (yellow banner)
 * - Syncing pending changes (blue banner)
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 8.1: Global Offline Banner
 */

import { Wifi, WifiOff, Cloud, Loader2 } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSyncStatus } from '../hooks/useSyncStatus';

export interface OfflineBannerProps {
  /** Optional className for styling */
  className?: string;
}

export function OfflineBanner({ className = '' }: OfflineBannerProps) {
  const { status: networkStatus, isOffline, isSlow } = useNetworkStatus();
  const { pendingCount, isSyncing, lastSyncTimeFormatted } = useSyncStatus();

  // Don't show when fully online and synced
  if (networkStatus === 'online' && pendingCount === 0 && !isSyncing) {
    return null;
  }

  // Determine banner style based on status
  let bgColor = 'bg-blue-600';
  let icon = <Cloud size={16} />;
  let message = '';

  if (isOffline) {
    bgColor = 'bg-red-600';
    icon = <WifiOff size={16} />;
    message = 'Sin conexión - Los cambios se guardan localmente';
  } else if (isSlow) {
    bgColor = 'bg-yellow-600';
    icon = <Wifi size={16} className="opacity-50" />;
    message = 'Conexión lenta - Modo ahorro de datos activado';
  } else if (isSyncing) {
    bgColor = 'bg-blue-600';
    icon = <Loader2 size={16} className="animate-spin" />;
    message = `Sincronizando ${pendingCount} cambio${pendingCount !== 1 ? 's' : ''}...`;
  } else if (pendingCount > 0) {
    bgColor = 'bg-amber-600';
    icon = <Cloud size={16} />;
    message = `${pendingCount} cambio${pendingCount !== 1 ? 's' : ''} pendiente${pendingCount !== 1 ? 's' : ''} de sincronizar`;
  }

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium text-white
        ${bgColor}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2 max-w-screen-lg mx-auto">
        {icon}
        <span>{message}</span>
        {lastSyncTimeFormatted && networkStatus === 'online' && pendingCount > 0 && (
          <span className="text-white/70 text-xs ml-2">
            (última sync: {lastSyncTimeFormatted})
          </span>
        )}
      </div>
    </div>
  );
}

export default OfflineBanner;
