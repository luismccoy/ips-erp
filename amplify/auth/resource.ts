import { defineAuth } from '@aws-amplify/backend';

/**
 * Define Authentication with Cognito.
 * We require a custom attribute 'tenantId' to enforce multi-tenancy at the user level.
 */
export const auth = defineAuth({
    loginWith: {
        email: true,
    },
    multifactor: {
        mode: 'REQUIRED',
        sms: true,
    },
    userAttributes: {
        "custom:tenantId": {
            dataType: "String",
            mutable: true,
            maxLen: 50,
        },
    },
});
