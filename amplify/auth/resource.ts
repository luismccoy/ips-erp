import { defineAuth } from '@aws-amplify/backend';

/**
 * IPS ERP - Authentication Configuration
 * 
 * Multi-tenant authentication for Colombian home healthcare providers.
 * Each user belongs to one IPS organization (tenant) and has a role (Admin, Nurse, Family).
 * 
 * Key Features:
 * - Custom tenantId attribute for data isolation
 * - Three user groups: Admin, Nurse, Family
 * - Email verification required
 * - Strong password policy
 * - JWT tokens include tenantId claim for authorization
 */
export const auth = defineAuth({
    loginWith: {
        email: true,
    },
    
    // User groups for role-based access control
    groups: ['Admin', 'Nurse', 'Family'],
    
    // Custom user attributes for multi-tenancy
    userAttributes: {
        "custom:tenantId": {
            dataType: "String",
            mutable: true,
            maxLen: 50,
        },
    },
    
    // Password policy - Colombian healthcare compliance
    passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true,
    },
    
    // Email verification required for account security
    accountRecovery: 'EMAIL_ONLY',
});
