import { defineFunction } from '@aws-amplify/backend';

export const createVisitDraft = defineFunction({
    name: 'create-visit-draft',
    timeoutSeconds: 30,
    environment: {
        SHIFT_TABLE_NAME: 'Shift-fxeusr7wzfchtkr7kamke3qnwq-NONE',
        VISIT_TABLE_NAME: 'Visit-fxeusr7wzfchtkr7kamke3qnwq-NONE',
        AUDIT_TABLE_NAME: 'AuditLog-fxeusr7wzfchtkr7kamke3qnwq-NONE',
    },
});
