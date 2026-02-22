import { defineFunction } from '@aws-amplify/backend';

export const saveVisitDocumentation = defineFunction({
    name: 'save-visit-documentation',
    timeoutSeconds: 30,
});
