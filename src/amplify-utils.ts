// import { generateClient } from 'aws-amplify/data';
import { generateMockClient } from './mock-client';
import type { AmplifyUser } from './types';
// import { type Schema } from '../amplify/data/resource';
// import { Amplify } from 'aws-amplify';
// import outputs from '../amplify_outputs.json';

// Configure Amplify with mock outputs
// Amplify.configure(outputs);

// Export the typed client
// export const client = generateClient<Schema>({
//    authMode: 'userPool',
// });
export const client = generateMockClient();

// Mock User Context for development
export const MOCK_USER: AmplifyUser = {
    username: 'nurse-maria',
    attributes: {
        sub: 'mock-user-id-123',
        email: 'maria@ips.com',
        'custom:tenantId': 'tenant-bogota-01'
    }
};

