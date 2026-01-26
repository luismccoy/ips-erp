import { useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut, fetchUserAttributes, fetchAuthSession, type SignInInput, type AuthUser } from 'aws-amplify/auth';
import { TENANTS } from '../data/mock-data';
import type { Tenant } from '../types';
import { isUsingRealBackend } from '../amplify-utils';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

// Valid user roles (priority order for group resolution)
type UserRole = 'superadmin' | 'admin' | 'nurse' | 'family';

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
                // Mock mode - no real authentication
                setUser(null);
                setRole(null);
                setTenant(null);
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
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    // Manual overrides for demo/mocking purposes
    const setDemoState = (newRole: UserRole, newTenant: Tenant | null) => {
        setRole(newRole);
        setTenant(newTenant);
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
