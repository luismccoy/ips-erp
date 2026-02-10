import { defineFunction } from '@aws-amplify/backend';

export const submitVisit = defineFunction({
    name: 'submit-visit',
    timeoutSeconds: 30,
    // Table names injected automatically by Amplify via backend.ts
});
