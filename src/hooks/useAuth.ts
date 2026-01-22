import { useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut, fetchUserAttributes, type SignInInput, type AuthUser } from 'aws-amplify/auth';
import { TENANTS } from '../data/mock-data';
import type { Tenant } from '../types';
import { isUsingRealBackend } from '../amplify-utils';

/**
 * Custom hook for managing authentication state via AWS Amplify.
 * Handles current user, role, tenant context, and sign-in/sign-out actions.
 * 
 * Supports both real Cognito authentication and mock mode for development.
 */
export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [role, setRole] = useState<'admin' | 'nurse' | 'family' | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            if (isUsingRealBackend()) {
                // Real Cognito authentication
                const currentUser = await getCurrentUser();
                const attributes = await fetchUserAttributes();

                setUser(currentUser);
                
                // Extract role and tenantId from custom attributes
                const userRole = attributes['custom:role'] as 'admin' | 'nurse' | 'family' || 'admin';
                const tenantId = attributes['custom:tenantId'] || '';
                
                setRole(userRole);
                
                // In production, fetch tenant from DynamoDB using tenantId
                // For now, use mock tenant with real tenantId
                setTenant({
                    ...TENANTS[0],
                    id: tenantId
                });
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
    const setDemoState = (newRole: 'admin' | 'nurse' | 'family', newTenant: Tenant) => {
        setRole(newRole);
        setTenant(newTenant);
    };

    return {
        user,
        role,
        tenant,
        loading,
        error,
        login,
        logout,
        setDemoState
    };
}
