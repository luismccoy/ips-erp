import { defineFunction } from '@aws-amplify/backend';

export const listApprovedVisitSummaries = defineFunction({
    name: 'list-approved-visit-summaries',
    timeoutSeconds: 30,
    environment: {
        VISIT_TABLE_NAME: 'Visit-fxeusr7wzfchtkr7kamke3qnwq-NONE',
        NURSE_TABLE_NAME: 'Nurse-fxeusr7wzfchtkr7kamke3qnwq-NONE',
        PATIENT_TABLE_NAME: 'Patient-fxeusr7wzfchtkr7kamke3qnwq-NONE',
        SHIFT_TABLE_NAME: 'Shift-fxeusr7wzfchtkr7kamke3qnwq-NONE',
    },
});
