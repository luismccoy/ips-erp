import { defineFunction } from '@aws-amplify/backend';

export const approveVisit = defineFunction({
    name: 'approve-visit',
    timeoutSeconds: 30,
    // Table names injected automatically by Amplify via backend.ts
});
