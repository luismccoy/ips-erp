import { defineFunction } from '@aws-amplify/backend';

export const rejectVisit = defineFunction({
    name: 'reject-visit',
    timeoutSeconds: 30,
    environment: {
        VISIT_TABLE_NAME: 'Visit-fxeusr7wzfchtkr7kamke3qnwq-NONE',
        NURSE_TABLE_NAME: 'Nurse-fxeusr7wzfchtkr7kamke3qnwq-NONE',
        AUDIT_TABLE_NAME: 'AuditLog-fxeusr7wzfchtkr7kamke3qnwq-NONE',
        NOTIFICATION_TABLE_NAME: 'Notification-fxeusr7wzfchtkr7kamke3qnwq-NONE',
    },
});
