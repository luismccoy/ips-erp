/**
 * Navigation Constants
 * 
 * Centralized configuration for routing and session storage keys.
 * This file consolidates all navigation-related constants previously scattered
 * across App.tsx, useAuth.ts, and amplify-utils.ts.
 */

// ============================================
// SESSION STORAGE KEYS
// ============================================

/**
 * Storage keys used for persisting state across page refreshes
 * All keys use sessionStorage (cleared on browser tab close)
 */
export const STORAGE_KEYS = {
  /** Toggles demo/real backend mode */
  DEMO_MODE: 'ips-erp-demo-mode',
  
  /** Persists demo role across refresh */
  DEMO_ROLE: 'ips-erp-demo-role',
  
  /** Persists demo tenant across refresh */
  DEMO_TENANT: 'ips-erp-demo-tenant',
  
  /** Tracks onboarding tour completion */
  TOUR_COMPLETED: 'ips-demo-tour-completed'
} as const;

// ============================================
// USER ROLES
// ============================================

/** Valid user roles (priority order for group resolution) */
export type UserRole = 'superadmin' | 'admin' | 'nurse' | 'family';

// ============================================
// ROUTE CONFIGURATION
// ============================================

/** Route configuration for deep linking and navigation */
export const ROUTES = {
  /** Landing page - clears demo state */
  ROOT: {
    path: '/',
    role: null as UserRole | null,
    clearDemoState: true,
    enableDemoMode: false
  },
  
  /** Login page - clears demo state */
  LOGIN: {
    path: '/login',
    role: null as UserRole | null,
    clearDemoState: true,
    enableDemoMode: false
  },
  
  /** Admin dashboard - enables demo mode */
  DASHBOARD: {
    path: '/dashboard',
    role: 'admin' as UserRole,
    clearDemoState: false,
    enableDemoMode: true
  },
  
  /** Admin dashboard (alt path) - enables demo mode */
  ADMIN: {
    path: '/admin',
    role: 'admin' as UserRole,
    clearDemoState: false,
    enableDemoMode: true
  },
  
  /** Nurse application - enables demo mode */
  NURSE: {
    path: '/nurse',
    role: 'nurse' as UserRole,
    clearDemoState: false,
    enableDemoMode: true
  },
  
  /** Nurse application (alt path) - enables demo mode */
  APP: {
    path: '/app',
    role: 'nurse' as UserRole,
    clearDemoState: false,
    enableDemoMode: true
  },
  
  /** Family portal - enables demo mode */
  FAMILY: {
    path: '/family',
    role: 'family' as UserRole,
    clearDemoState: false,
    enableDemoMode: true
  }
} as const;

/** Map of pathname to route config for fast lookup */
export const ROUTE_MAP = Object.values(ROUTES).reduce((acc, route) => {
  acc[route.path] = route;
  return acc;
}, {} as Record<string, typeof ROUTES[keyof typeof ROUTES]>);

/**
 * Get route configuration for a given pathname
 * @param pathname - Window location pathname
 * @returns Route config or undefined if not found
 */
export function getRouteConfig(pathname: string) {
  return ROUTE_MAP[pathname];
}

/**
 * Check if pathname should clear demo state
 * @param pathname - Window location pathname
 * @returns True if demo state should be cleared
 */
export function shouldClearDemoState(pathname: string): boolean {
  const config = getRouteConfig(pathname);
  return config?.clearDemoState ?? false;
}

/**
 * Check if pathname should enable demo mode
 * @param pathname - Window location pathname
 * @returns True if demo mode should be enabled
 */
export function shouldEnableDemoMode(pathname: string): boolean {
  const config = getRouteConfig(pathname);
  return config?.enableDemoMode ?? false;
}

/**
 * Get role for a given pathname
 * @param pathname - Window location pathname
 * @returns UserRole or null
 */
export function getRoleForPath(pathname: string): UserRole | null {
  const config = getRouteConfig(pathname);
  return config?.role ?? null;
}
