import { defineFunction } from '@aws-amplify/backend';

export const listApprovedVisitSummaries = defineFunction({
    name: 'list-approved-visit-summaries',
    timeoutSeconds: 30,
    // Table names injected automatically by Amplify via backend.ts
});
