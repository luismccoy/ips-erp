import { defineFunction } from '@aws-amplify/backend';

export const submitVisit = defineFunction({
    name: 'submit-visit',
    timeoutSeconds: 30,
});
