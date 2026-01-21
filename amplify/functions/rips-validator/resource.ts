import { defineFunction } from '@aws-amplify/backend';

export const ripsValidator = defineFunction({
    name: 'rips-validator',
    timeoutSeconds: 30,
});
