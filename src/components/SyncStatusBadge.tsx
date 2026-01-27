/**
 * Sync Status Badge Component
 * 
 * Visual indicator for individual item sync status.
 * Shows whether an item is synced, pending, or has errors.
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 8.2: Sync Status Badge
 */

import { Cloud, CloudOff, Loader2, Check, AlertTriangle } from 'lucide-react';

export type SyncStatusType = 'synced' | 'pending' | 'syncing' | 'error';

export interface SyncStatusBadgeProps {
  /** Current sync status of the item */
  syncStatus: SyncStatusType;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show label text */
  showLabel?: boolean;
  /** Optional error message for tooltip */
  errorMessage?: string;
  /** Optional className */
  className?: string;
}

const sizeConfig = {
  sm: { icon: 12, text: 'text-[10px]', padding: 'px-1.5 py-0.5', gap: 'gap-0.5' },
  md: { icon: 14, text: 'text-xs', padding: 'px-2 py-1', gap: 'gap-1' },
  lg: { icon: 16, text: 'text-sm', padding: 'px-2.5 py-1.5', gap: 'gap-1.5' },
};

const statusConfig: Record<SyncStatusType, {
  icon: React.ElementType;
  label: string;
  labelEs: string;
  bgColor: string;
  textColor: string;
  animate?: boolean;
}> = {
  synced: {
    icon: Check,
    label: 'Synced',
    labelEs: 'Sincronizado',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
  },
  pending: {
    icon: Cloud,
    label: 'Pending',
    labelEs: 'Pendiente',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
  },
  syncing: {
    icon: Loader2,
    label: 'Syncing',
    labelEs: 'Sincronizando',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    animate: true,
  },
  error: {
    icon: AlertTriangle,
    label: 'Error',
    labelEs: 'Error',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
  },
};

export function SyncStatusBadge({
  syncStatus,
  size = 'sm',
  showLabel = false,
  errorMessage,
  className = '',
}: SyncStatusBadgeProps) {
  const config = statusConfig[syncStatus];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center rounded ${sizeStyles.padding} ${sizeStyles.gap}
        ${config.bgColor} ${config.textColor}
        ${className}
      `}
      title={errorMessage || config.labelEs}
    >
      <Icon
        size={sizeStyles.icon}
        className={config.animate ? 'animate-spin' : ''}
      />
      {showLabel && (
        <span className={`font-medium ${sizeStyles.text}`}>
          {config.labelEs}
        </span>
      )}
    </span>
  );
}

/**
 * Compact cloud-only sync indicator
 * For use in tight spaces like card headers
 */
export function SyncCloudIcon({
  syncStatus,
  size = 14,
  className = '',
}: {
  syncStatus: SyncStatusType;
  size?: number;
  className?: string;
}) {
  const config = statusConfig[syncStatus];
  const Icon = config.icon;

  return (
    <Icon
      size={size}
      className={`${config.textColor} ${config.animate ? 'animate-spin' : ''} ${className}`}
      title={config.labelEs}
    />
  );
}

export default SyncStatusBadge;
