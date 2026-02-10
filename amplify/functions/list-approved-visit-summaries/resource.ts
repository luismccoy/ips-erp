import { defineFunction } from '@aws-amplify/backend';

export const listApprovedVisitSummaries = defineFunction({
    name: 'list-approved-visit-summaries',
    timeoutSeconds: 30,
});
