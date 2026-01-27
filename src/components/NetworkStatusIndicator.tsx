/**
 * Network Status Indicator Component
 * 
 * Compact indicator for header showing:
 * - Network status (online/offline/slow)
 * - Pending changes count badge
 * - Last sync time on hover
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 8: UI Indicators
 */

import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSyncStatus } from '../hooks/useSyncStatus';

export interface NetworkStatusIndicatorProps {
  /** Show pending count badge */
  showPendingBadge?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Optional className */
  className?: string;
}

export function NetworkStatusIndicator({
  showPendingBadge = true,
  size = 'md',
  className = '',
}: NetworkStatusIndicatorProps) {
  const { status, isOnline, isOffline, isSlow } = useNetworkStatus();
  const { pendingCount, isSyncing, lastSyncTimeFormatted } = useSyncStatus();

  const iconSize = size === 'sm' ? 16 : 20;

  // Determine icon and color
  let icon: React.ReactNode;
  let colorClass: string;
  let tooltip: string;

  if (isOffline) {
    icon = <WifiOff size={iconSize} />;
    colorClass = 'text-red-400';
    tooltip = 'Sin conexión';
  } else if (isSlow) {
    icon = <Wifi size={iconSize} className="opacity-60" />;
    colorClass = 'text-yellow-400';
    tooltip = 'Conexión lenta';
  } else if (isSyncing) {
    icon = <Loader2 size={iconSize} className="animate-spin" />;
    colorClass = 'text-blue-400';
    tooltip = 'Sincronizando...';
  } else if (pendingCount > 0) {
    icon = <Cloud size={iconSize} />;
    colorClass = 'text-yellow-400';
    tooltip = `${pendingCount} cambios pendientes`;
  } else {
    icon = <Cloud size={iconSize} />;
    colorClass = 'text-green-400';
    tooltip = lastSyncTimeFormatted 
      ? `Sincronizado - ${lastSyncTimeFormatted}`
      : 'Conectado';
  }

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      title={tooltip}
      role="status"
      aria-label={tooltip}
    >
      <span className={colorClass}>{icon}</span>
      
      {/* Pending count badge */}
      {showPendingBadge && pendingCount > 0 && !isSyncing && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center 
                     min-w-[16px] h-4 px-1 text-[10px] font-bold 
                     bg-yellow-500 text-slate-900 rounded-full"
        >
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      )}
    </div>
  );
}

/**
 * Compact version for tight spaces
 */
export function NetworkDot({ className = '' }: { className?: string }) {
  const { isOffline, isSlow } = useNetworkStatus();
  const { isSyncing, pendingCount } = useSyncStatus();

  let colorClass = 'bg-green-400';
  let animate = false;

  if (isOffline) {
    colorClass = 'bg-red-400';
  } else if (isSlow) {
    colorClass = 'bg-yellow-400';
  } else if (isSyncing) {
    colorClass = 'bg-blue-400';
    animate = true;
  } else if (pendingCount > 0) {
    colorClass = 'bg-yellow-400';
  }

  return (
    <span
      className={`
        inline-block w-2 h-2 rounded-full ${colorClass}
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
      role="status"
      aria-label={isOffline ? 'Offline' : isSlow ? 'Slow connection' : 'Online'}
    />
  );
}

/**
 * Last Sync Time Display
 */
export function LastSyncTime({ className = '' }: { className?: string }) {
  const { lastSyncTimeFormatted, isFullySynced } = useSyncStatus();
  const { isOnline } = useNetworkStatus();

  if (!lastSyncTimeFormatted) return null;

  return (
    <span className={`text-xs text-slate-400 ${className}`}>
      {isFullySynced && isOnline ? '✓ ' : ''}
      Última sync: {lastSyncTimeFormatted}
    </span>
  );
}

export default NetworkStatusIndicator;
