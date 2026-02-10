import { defineFunction } from '@aws-amplify/backend';

export const createNurseValidated = defineFunction({
    name: 'create-nurse-validated',
    timeoutSeconds: 10,
});
