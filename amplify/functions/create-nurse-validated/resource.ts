import { defineFunction } from '@aws-amplify/backend';

export const createNurseValidated = defineFunction({
    name: 'create-nurse-validated',
    timeoutSeconds: 10,
    environment: {
        NURSE_TABLE_NAME: process.env.NURSE_TABLE_NAME || ''
    }
});
