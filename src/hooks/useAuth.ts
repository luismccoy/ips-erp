import { useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut, fetchUserAttributes, type SignInInput, type AuthUser } from 'aws-amplify/auth';
import { TENANTS } from '../data/mock-data';
import type { Tenant } from '../types';

/**
 * Custom hook for managing authentication state via AWS Amplify.
 * Handles current user, role, tenant context, and sign-in/sign-out actions.
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
            const currentUser = await getCurrentUser();
            await fetchUserAttributes();

            setUser(currentUser);
            // In a real app, role and tenant would come from attributes or DB
            // For now, we mock standard role assignment upon successful login
            setRole('admin');
            setTenant(TENANTS[0]);
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
            await signIn(input);
            await checkUser();
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
            await signOut();
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
