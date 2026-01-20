import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

// Configure Amplify with mock outputs
Amplify.configure(outputs);

// Export the typed client
export const client = generateClient<Schema>({
    authMode: 'userPool',
});

// Mock User Context for development
export const MOCK_USER = {
    username: 'nurse-maria',
    attributes: {
        sub: 'mock-user-id-123',
        email: 'maria@ips.com',
        'custom:tenantId': 'tenant-bogota-01'
    }
};
