import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, signIn, signOut, fetchUserAttributes, fetchAuthSession, type SignInInput, type AuthUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { TENANTS } from '../data/mock-data';
import type { Tenant } from '../types';
import { isUsingRealBackend, isDemoMode } from '../amplify-utils';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { STORAGE_KEYS, type UserRole } from '../constants/navigation';

/**
 * Custom hook for managing authentication state via AWS Amplify.
 * Handles current user, role, tenant context, and sign-in/sign-out actions.
 * 
 * Role Detection:
 * - Reads from Cognito Groups (SuperAdmin, Admin, Nurse, Family)
 * - Uses JWT token payload for group membership
 * - Falls back to 'admin' if no group found (backwards compatibility)
 * 
 * Multi-tenancy:
 * - Reads custom:tenantId from user attributes
 * - Fetches full Tenant record from DynamoDB
 * - SuperAdmin has no tenantId (platform-wide access)
 */
export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
        
        // KIRO-004 Fix: Listen for auth events to handle token refresh and session changes
        // This prevents random logouts during navigation
        const hubListener = Hub.listen('auth', async ({ payload }) => {
            switch (payload.event) {
                case 'signedIn':
                    await checkUser();
                    break;
                case 'signedOut':
                    setUser(null);
                    setRole(null);
                    setTenant(null);
                    break;
                case 'tokenRefresh':
                    // Token was refreshed successfully - no action needed
                    console.log('Auth token refreshed');
                    break;
                case 'tokenRefresh_failure':
                    // Token refresh failed - user needs to re-authenticate
                    console.warn('Token refresh failed, user may need to re-login');
                    // Don't immediately logout - let the next API call handle it
                    break;
            }
        });
        
        // KIRO-004 Fix: Proactive session refresh every 10 minutes
        // Amplify auto-refreshes tokens, but this ensures we catch any issues early
        let refreshInterval: NodeJS.Timeout | null = null;
        if (isUsingRealBackend()) {
            refreshInterval = setInterval(async () => {
                try {
                    // fetchAuthSession with forceRefresh will refresh tokens if needed
                    await fetchAuthSession({ forceRefresh: false });
                } catch (err) {
                    console.warn('Proactive session check failed:', err);
                }
            }, 10 * 60 * 1000); // 10 minutes
        }
        
        // Cleanup listener and interval on unmount
        return () => {
            hubListener();
            if (refreshInterval) clearInterval(refreshInterval);
        };
    }, []);

    /**
     * Determine user role from Cognito groups (priority order)
     */
    function resolveRoleFromGroups(groups: string[]): UserRole {
        const normalizedGroups = groups.map(g => g.toLowerCase());
        
        if (normalizedGroups.includes('superadmin')) return 'superadmin';
        if (normalizedGroups.includes('admin')) return 'admin';
        if (normalizedGroups.includes('nurse')) return 'nurse';
        if (normalizedGroups.includes('family')) return 'family';
        
        // Default fallback (shouldn't happen with proper user setup)
        console.warn('User has no recognized group, defaulting to admin');
        return 'admin';
    }

    /**
     * Fetch tenant details from DynamoDB (production only)
     * In demo/mock mode, returns a mock tenant with the given ID
     */
    async function fetchTenantById(tenantId: string): Promise<Tenant | null> {
        if (!tenantId) return null;
        
        // Only attempt real fetch in production mode
        if (isUsingRealBackend()) {
            try {
                const client = generateClient<Schema>();
                const { data } = await client.models.Tenant.get({ id: tenantId });
                
                if (data) {
                    return {
                        id: data.id,
                        name: data.name,
                        nit: data.nit
                    };
                }
            } catch (err) {
                console.warn('Failed to fetch tenant from DynamoDB, using fallback:', err);
            }
        }
        
        // Fallback: use mock tenant with real ID
        return {
            ...TENANTS[0],
            id: tenantId
        };
    }

    async function checkUser() {
        try {
            if (isUsingRealBackend()) {
                // Real Cognito authentication
                const currentUser = await getCurrentUser();
                const [attributes, session] = await Promise.all([
                    fetchUserAttributes(),
                    fetchAuthSession()
                ]);

                setUser(currentUser);
                
                // Extract groups from JWT token (this is the correct way!)
                const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
                const userRole = resolveRoleFromGroups(groups);
                
                // Extract tenantId from custom attributes
                const tenantId = attributes['custom:tenantId'] || '';
                
                setRole(userRole);
                
                // SuperAdmin has no tenant (platform-wide access)
                if (userRole === 'superadmin') {
                    setTenant(null);
                } else if (tenantId) {
                    // Fetch tenant from DynamoDB
                    const tenantData = await fetchTenantById(tenantId);
                    setTenant(tenantData);
                } else {
                    console.warn('Non-superadmin user has no tenantId');
                    setTenant(null);
                }
            } else {
                // Mock/Demo mode - restore persisted demo state if available
                const savedRole = sessionStorage.getItem(STORAGE_KEYS.DEMO_ROLE) as UserRole | null;
                const savedTenantJson = sessionStorage.getItem(STORAGE_KEYS.DEMO_TENANT);
                
                if (isDemoMode() && savedRole) {
                    setRole(savedRole);
                    setTenant(savedTenantJson ? JSON.parse(savedTenantJson) : TENANTS[0]);
                } else {
                    setUser(null);
                    setRole(null);
                    setTenant(null);
                }
            }
        } catch {
            // No user signed in
            setUser(null);
            setRole(null);
            setTenant(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(input: SignInInput) {
        setLoading(true);
        setError(null);
        try {
            if (isUsingRealBackend()) {
                await signIn(input);
                await checkUser();
            } else {
                // Mock login - just set demo state
                setRole('admin');
                setTenant(TENANTS[0]);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        try {
            if (isUsingRealBackend()) {
                await signOut();
            }
            setUser(null);
            setRole(null);
            setTenant(null);
            
            // Clear persisted demo state
            sessionStorage.removeItem(STORAGE_KEYS.DEMO_ROLE);
            sessionStorage.removeItem(STORAGE_KEYS.DEMO_TENANT);
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    // Manual overrides for demo/mocking purposes
    // Persists to sessionStorage so state survives page refresh
    const setDemoState = (newRole: UserRole, newTenant: Tenant | null) => {
        setRole(newRole);
        setTenant(newTenant);
        
        // Persist to sessionStorage for refresh survival
        sessionStorage.setItem(STORAGE_KEYS.DEMO_ROLE, newRole);
        if (newTenant) {
            sessionStorage.setItem(STORAGE_KEYS.DEMO_TENANT, JSON.stringify(newTenant));
        } else {
            sessionStorage.removeItem(STORAGE_KEYS.DEMO_TENANT);
        }
    };
    
    // Check if user has superadmin privileges
    const isSuperAdmin = role === 'superadmin';

    return {
        user,
        role,
        tenant,
        loading,
        error,
        login,
        logout,
        setDemoState,
        isSuperAdmin
    };
}
