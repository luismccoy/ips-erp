import { generateClient } from 'aws-amplify/data';
import { generateMockClient } from './mock-client';
import type { AmplifyUser } from './types';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

// Use generated GraphQL types instead of importing from backend
type Schema = any; // Will be properly typed via GraphQL operations

// Determine if we should use real backend or mock
const USE_REAL_BACKEND = import.meta.env.VITE_USE_REAL_BACKEND === 'true';

// Configure Amplify with real outputs
if (USE_REAL_BACKEND) {
    Amplify.configure(outputs);
}

// Export the typed client (real or mock based on environment)
export const client = USE_REAL_BACKEND 
    ? generateClient<Schema>({ authMode: 'userPool' })
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

