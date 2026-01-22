import { generateClient } from 'aws-amplify/data';
import { generateMockClient } from './mock-client';
import type { AmplifyUser } from './types';

import type { Schema } from '../amplify/data/resource';

// Determine if we should use real backend or mock
const USE_REAL_BACKEND = import.meta.env.VITE_USE_REAL_BACKEND === 'true';

// Note: Amplify.configure() is called in main.tsx, not here
// This avoids duplicate configuration which can cause errors

// Export the typed client (real or mock based on environment)
export const client = USE_REAL_BACKEND
    ? generateClient<Schema>()
    : generateMockClient();

// Mock User Context for development (only used when USE_REAL_BACKEND is false)
export const MOCK_USER: AmplifyUser = {
    username: 'nurse-maria',
    attributes: {
        sub: 'mock-user-id-123',
        email: 'maria@ips.com',
        'custom:tenantId': 'tenant-bogota-01'
    }
};

// Helper to check if using real backend
export const isUsingRealBackend = () => USE_REAL_BACKEND;

