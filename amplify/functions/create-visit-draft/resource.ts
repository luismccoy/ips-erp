import { defineFunction } from '@aws-amplify/backend';

export const createVisitDraft = defineFunction({
    name: 'create-visit-draft',
    timeoutSeconds: 30,
});
