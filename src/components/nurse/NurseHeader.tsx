import { memo } from 'react';
import { CloudSlash, SignOut } from '@phosphor-icons/react';
import { ActivityIcon } from '../ui/icons';
import { NetworkStatusIndicator } from '../NetworkStatusIndicator';
import { NotificationBell } from '../NotificationBell';
import type { NotificationItem } from '../../types/workflow';

interface NurseHeaderProps {
    isOffline: boolean;
    isSlow: boolean;
    pendingCount: number;
    isSyncing: boolean;
    currentUserId: string;
    onNotificationClick: (notification: NotificationItem) => void;
    onLogout: () => void;
}

const NurseHeader = memo(({
    isOffline,
    isSlow,
    pendingCount,
    isSyncing,
    currentUserId,
    onNotificationClick,
    onLogout,
}: NurseHeaderProps) => {
    return (
        <header className={`bg-slate-800 p-4 flex justify-between items-center ${(isOffline || isSlow || pendingCount > 0 || isSyncing) ? 'mt-10' : ''}`}>
            <div className="flex items-center gap-2">
                <img src="/logo.png" alt="IPS-ERP Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                <span className="font-black text-lg">IPS ERP</span>
                {/* Network status dot */}
                {isOffline && (
                    <span className="text-xs text-red-400 flex items-center gap-1 ml-2">
                        <CloudSlash size={12} />
                        Offline
                    </span>
                )}
            </div>
            <div className="flex items-center gap-3">
                {/* Network Status Indicator with pending badge */}
                <NetworkStatusIndicator showPendingBadge={true} size="md" />

                {/* NotificationBell - Requirement 4.1 (ANTIGRAVITY-004: verified correct handler) */}
                <NotificationBell
                    userId={currentUserId}
                    onNotificationClick={onNotificationClick}
                />
                {/* LogOut button (ANTIGRAVITY-004: verified correct handler, not navigating to landing page) */}
                <button onClick={onLogout} className="text-sm text-slate-400 hover:text-white p-2" title="Cerrar Sesión">
                    <SignOut size={20} />
                </button>
            </div>
        </header>
    );
});

NurseHeader.displayName = 'NurseHeader';

export { NurseHeader };
