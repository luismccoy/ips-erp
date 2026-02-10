import { defineFunction } from '@aws-amplify/backend';

export const approveVisit = defineFunction({
    name: 'approve-visit',
    timeoutSeconds: 30,
});
