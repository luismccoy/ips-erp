import { defineFunction } from '@aws-amplify/backend';

export const deteriorationDetector = defineFunction({
    name: 'deterioration-detector',
    timeoutSeconds: 60,
    environment: {
        MODEL_ID: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
    }
});
