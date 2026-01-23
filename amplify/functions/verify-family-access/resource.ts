import { defineFunction } from '@aws-amplify/backend';

export const verifyFamilyAccess = defineFunction({
    name: 'verify-family-access',
    timeoutSeconds: 10, // Quick verification, no AI processing
    environment: {
        PATIENT_TABLE_NAME: process.env.PATIENT_TABLE_NAME || ''
    }
});
