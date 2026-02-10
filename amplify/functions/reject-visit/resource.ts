import { defineFunction } from '@aws-amplify/backend';

export const rejectVisit = defineFunction({
    name: 'reject-visit',
    timeoutSeconds: 30,
    // Table names injected automatically by Amplify via backend.ts
});
