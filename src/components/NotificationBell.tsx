/**
 * NotificationBell Component
 * 
 * A notification indicator component for the header that displays unread notifications
 * for workflow events (visit approvals, rejections, pending reviews).
 * 
 * Features:
 * - Bell icon with badge showing unread count
 * - Dropdown that opens on click showing notification list
 * - Different styling for VISIT_APPROVED (green/success) vs VISIT_REJECTED (red/warning) vs VISIT_PENDING_REVIEW (blue/info)
 * - Loading state while fetching notifications
 * - Empty state when no notifications
 * - Uses isUsingRealBackend() to toggle between real GraphQL and mock data
 * - Navigation callback for parent components to handle notification clicks
 * - Dismiss button to mark notifications as read without navigation
 * - Automatic unread count update after marking notifications as read
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * @example
 * // Basic usage
 * <NotificationBell userId="nurse-123" />
 * 
 * @example
 * // With navigation callback for handling VISIT_REJECTED clicks
 * <NotificationBell 
 *   userId="nurse-123" 
 *   onNotificationClick={(notification) => {
 *     if (notification.type === 'VISIT_REJECTED') {
 *       // Navigate to the rejected visit for correction
 *       navigateToVisit(notification.entityId);
 *     }
 *   }}
 * />
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { client, isUsingRealBackend } from '../amplify-utils';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type { NotificationBellProps, NotificationItem, NotificationType } from '../types/workflow';

// GraphQL Operations removed in favor of client.models


// Mock data removed in favor of real backend integration


// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats a timestamp to a relative time string.
 */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

/**
 * Gets the icon and styling for a notification type.
 */
function getNotificationStyle(type: NotificationType): {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
} {
  switch (type) {
    case 'VISIT_APPROVED':
      return {
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        icon: (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case 'VISIT_REJECTED':
      return {
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        icon: (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case 'VISIT_PENDING_REVIEW':
      return {
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
        icon: (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    default:
      return {
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-800',
        borderColor: 'border-slate-200',
        icon: (
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
  }
}

// ============================================================================
// NotificationBell Component
// ============================================================================

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, onNotificationClick }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  /**
   * Fetches notifications using observeQuery for real-time updates.
   */
  useEffect(() => {
    setIsLoading(true);

    const sub = (client.models.Notification.observeQuery({
      filter: { userId: { eq: userId } }
    }) as any).subscribe({
      next: ({ items }: any) => {
        setNotifications(items as NotificationItem[]);
        setIsLoading(false);
      },
      error: (err: any) => {
        console.error('Error in notifications subscription:', err);
        setError('Error al cargar notificaciones');
        setIsLoading(false);
      }
    });

    return () => sub.unsubscribe();
  }, [userId]);

  const fetchNotifications = useCallback(async () => {
    // No longer needed as observeQuery handles it, but kept if needed for manual refresh
  }, []);

  /**
   * Marks a notification as read.
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      if (isUsingRealBackend()) {
        await (client.models.Notification as any).update({
          id: notificationId,
          read: true
        });
      } else {
        // In mock mode, the STORE update will trigger observeQuery's next 
        // if observeQuery is implemented to watch STORE (which it is)
        await (client.models.Notification as any).update({
          id: notificationId,
          read: true
        });
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  /**
   * Handles notification dismiss - marks as read without navigation.
   * Updates the unread count after dismissal.
   * 
   * Validates: Requirement 4.5
   */
  const handleNotificationDismiss = useCallback((e: React.MouseEvent, notificationId: string) => {
    // Prevent the click from bubbling to the notification item
    e.stopPropagation();

    // Mark as read (Requirement 4.5)
    markAsRead(notificationId);
  }, [markAsRead]);

  /**
   * Handles notification click - marks as read and triggers navigation callback.
   * For VISIT_REJECTED notifications, the parent component should navigate to the rejected visit.
   * 
   * Validates: Requirements 4.4, 4.5
   */
  const handleNotificationClick = useCallback((notification: NotificationItem) => {
    // Mark as read if not already (Requirement 4.5)
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Call the parent callback for navigation handling
    // For VISIT_REJECTED, the parent should navigate to the rejected visit (Requirement 4.4)
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else {
      // Fallback logging when no callback is provided
      console.log('Notification clicked:', notification.type, notification.entityId);

      // Log specific action for VISIT_REJECTED
      if (notification.type === 'VISIT_REJECTED') {
        console.log('VISIT_REJECTED clicked - entityId:', notification.entityId,
          '- Parent should navigate to rejected visit for correction');
      }
    }
  }, [markAsRead, onNotificationClick]);

  /**
   * Marks all notifications as read.
   */
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.read);

    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  }, [notifications, markAsRead]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bell Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              /* Loading State */
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" label="Cargando..." />
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <svg className="w-10 h-10 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-slate-600 text-center">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Reintentar
                </button>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm text-slate-500 text-center">No tienes notificaciones</p>
              </div>
            ) : (
              /* Notification List */
              <ul className="divide-y divide-slate-100">
                {notifications.map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  return (
                    <li key={notification.id}>
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-indigo-50/50' : ''
                          }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 p-2 rounded-full ${style.bgColor}`}>
                            {style.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>

                          {/* Unread Indicator / Dismiss Button */}
                          {!notification.read && (
                            <div className="flex-shrink-0 flex items-center gap-2">
                              {/* Dismiss button - marks as read without navigation */}
                              <button
                                onClick={(e) => handleNotificationDismiss(e, notification.id)}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                                aria-label="Marcar como leída"
                                title="Marcar como leída"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              {/* Unread dot indicator */}
                              <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && !isLoading && !error && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page (to be implemented)
                  console.log('View all notifications');
                }}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
