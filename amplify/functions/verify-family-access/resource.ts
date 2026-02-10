import { defineFunction } from '@aws-amplify/backend';

export const verifyFamilyAccess = defineFunction({
    name: 'verify-family-access',
    timeoutSeconds: 10,
});
