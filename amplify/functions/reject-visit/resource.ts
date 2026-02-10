import { defineFunction } from '@aws-amplify/backend';

export const rejectVisit = defineFunction({
    name: 'reject-visit',
    timeoutSeconds: 30,
});
