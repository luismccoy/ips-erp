import { defineFunction } from '@aws-amplify/backend';

export const glosaDefender = defineFunction({
    name: 'glosa-defender',
    timeoutSeconds: 60, // AI inference can take time
    environment: {
        MODEL_ID: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
    }
});
