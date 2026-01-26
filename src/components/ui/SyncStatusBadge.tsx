/**
 * SyncStatusBadge Component
 * 
 * Small badge indicating the sync status of an individual item.
 * Shows synced/pending/error states with appropriate icons.
 * 
 * Usage:
 * ```tsx
 * <SyncStatusBadge status="pending" />
 * <SyncStatusBadge status="synced" size="md" showLabel />
 * ```
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 8.2: Sync Status Badge
 */

import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react';
import type { SyncStatus } from '../../datastore';

interface SyncStatusBadgeProps {
  /** Current sync status */
  status: SyncStatus;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Whether to show the label text */
  showLabel?: boolean;
  /** Optional className override */
  className?: string;
}

const CONFIG = {
  synced: {
    icon: Check,
    label: 'Sincronizado',
    className: 'text-green-400',
    bgClassName: 'bg-green-500/10',
  },
  pending: {
    icon: Cloud,
    label: 'Pendiente',
    className: 'text-yellow-400',
    bgClassName: 'bg-yellow-500/10',
  },
  error: {
    icon: CloudOff,
    label: 'Error de sync',
    className: 'text-red-400',
    bgClassName: 'bg-red-500/10',
  },
} as const;

export function SyncStatusBadge({
  status,
  size = 'sm',
  showLabel = false,
  className = '',
}: SyncStatusBadgeProps) {
  const config = CONFIG[status];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <span
      className={`inline-flex items-center gap-1 ${config.className} ${className}`}
      title={config.label}
      aria-label={config.label}
    >
      {status === 'pending' ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <Icon size={iconSize} />
      )}
      {showLabel && (
        <span className={`text-xs ${size === 'md' ? '' : 'sr-only'}`}>
          {config.label}
        </span>
      )}
    </span>
  );
}

/**
 * Full badge with background - for more prominent display
 */
export function SyncStatusBadgeFull({ status }: { status: SyncStatus }) {
  const config = CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${config.bgClassName} ${config.className}`}
      aria-label={config.label}
    >
      {status === 'pending' ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Icon size={12} />
      )}
      {config.label}
    </span>
  );
}

export default SyncStatusBadge;
