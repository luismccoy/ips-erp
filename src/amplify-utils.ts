import { generateClient } from 'aws-amplify/data';
import { generateMockClient } from './mock-client';
import type { AmplifyUser } from './types';

import type { Schema } from '../amplify/data/resource';

import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { STORAGE_KEYS } from './constants/navigation';

// ============================================
// DEMO MODE DETECTION
// ============================================
// Demo mode is set when users click "View Demo" from landing page
// This allows production site to show pre-seeded sample data for sales demos

export function isDemoMode(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check sessionStorage
    if (sessionStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true') return true;
    
    // Also check for ?demo= query param (handles fresh page load after redirect)
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo')) {
        // Auto-enable demo mode if we see the query param
        sessionStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
        return true;
    }
    
    return false;
}

export function enableDemoMode(): void {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
        console.log('🎭 Demo Mode Enabled - Using sample data');
    }
}

export function disableDemoMode(): void {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
        console.log('🔐 Demo Mode Disabled - Using real backend');
    }
}

// ============================================
// BACKEND SELECTION
// ============================================
// Use real backend ONLY if:
// 1. We're in production AND
// 2. Demo mode is NOT enabled
const shouldUseRealBackend = (): boolean => {
    const isProduction = import.meta.env.PROD || import.meta.env.VITE_USE_REAL_BACKEND === 'true';
    const inDemoMode = isDemoMode();
    return isProduction && !inDemoMode;
};

// Initial determination (will be re-checked dynamically)
let USE_REAL_BACKEND = shouldUseRealBackend();

// Ensure Amplify is configured if using real backend
if (USE_REAL_BACKEND) {
    try {
        Amplify.configure(outputs);
    } catch (e) {
        console.warn('Amplify configuration warning:', e);
    }
}

// ============================================
// CLIENT FACTORY
// ============================================
// Create clients lazily to support demo mode toggling
let realClient: ReturnType<typeof generateClient<Schema>> | null = null;
let mockClient: ReturnType<typeof generateMockClient> | null = null;

function getRealClient() {
    if (!realClient) {
        // Ensure Amplify is configured
        try {
            Amplify.configure(outputs);
        } catch (e) {
            // Already configured, ignore
        }
        realClient = generateClient<Schema>();
    }
    return realClient;
}

function getMockClient() {
    if (!mockClient) {
        mockClient = generateMockClient();
    }
    return mockClient;
}

// Dynamic client getter - checks demo mode on each access
export function getClient() {
    if (isDemoMode()) {
        return getMockClient();
    }
    if (import.meta.env.PROD || import.meta.env.VITE_USE_REAL_BACKEND === 'true') {
        return getRealClient();
    }
    return getMockClient();
}

// Dynamic client proxy - checks demo mode on EVERY access
// This ensures components always get the right client even after demo mode toggle
export const client = new Proxy({} as ReturnType<typeof generateMockClient>, {
    get(_, prop) {
        const activeClient = getClient();
        return (activeClient as any)[prop];
    }
});

// ============================================
// MOCK USER FOR DEMO MODE
// ============================================
export const MOCK_USER: AmplifyUser = {
    username: 'Dr. Alejandra Mendez',
    attributes: {
        sub: 'demo-admin-user-001',
        email: 'admin@demo.ipserp.com',
        'custom:tenantId': 'ips-vida'
    }
};

// Demo personas for different portal experiences
export const DEMO_PERSONAS = {
    admin: {
        username: 'Dr. Alejandra Mendez',
        role: 'ADMIN',
        attributes: {
            sub: 'demo-admin-user-001',
            email: 'admin@demo.ipserp.com',
            'custom:tenantId': 'ips-vida'
        }
    },
    nurse: {
        username: 'Maria Rodriguez',
        role: 'NURSE',
        attributes: {
            sub: 'demo-nurse-user-001',
            email: 'maria@demo.ipserp.com',
            'custom:tenantId': 'ips-vida'
        }
    },
    family: {
        username: 'Carlos Santos',
        role: 'FAMILY',
        attributes: {
            sub: 'demo-family-user-001',
            email: 'familia@demo.ipserp.com',
            'custom:tenantId': 'ips-vida'
        }
    }
};

// ============================================
// HELPERS
// ============================================
export const isUsingRealBackend = (): boolean => {
    return !isDemoMode() && (import.meta.env.PROD || import.meta.env.VITE_USE_REAL_BACKEND === 'true');
};

export const getUserId = (): string => {
    if (isDemoMode()) {
        return MOCK_USER.attributes.sub;
    }
    // In production, this would get the actual user ID from Amplify Auth
    return 'demo-user'; // Placeholder - replace with actual implementation
};

export const getTenantId = (): string => {
    if (isDemoMode()) {
        return MOCK_USER.attributes['custom:tenantId'];
    }
    // In production, this would get the actual tenant ID from Amplify Auth
    return 'demo-tenant'; // Placeholder - replace with actual implementation
};
