import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { rosterArchitect } from './functions/roster-architect/resource';
import { ripsValidator } from './functions/rips-validator/resource';
import { glosaDefender } from './functions/glosa-defender/resource';
import { listApprovedVisitSummaries } from './functions/list-approved-visit-summaries/resource';
import { createVisitDraft } from './functions/create-visit-draft/resource';
import { submitVisit } from './functions/submit-visit/resource';
import { rejectVisit } from './functions/reject-visit/resource';
import { approveVisit } from './functions/approve-visit/resource';
import { verifyFamilyAccess } from './functions/verify-family-access/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
const backend = defineBackend({
    auth,
    data,
    rosterArchitect,
    ripsValidator,
    glosaDefender,
    listApprovedVisitSummaries,
    createVisitDraft,
    submitVisit,
    rejectVisit,
    approveVisit,
    verifyFamilyAccess,
});

// Grant Bedrock permissions to AI-powered Lambda functions
// Required for: ripsValidator, glosaDefender, rosterArchitect
// These functions use AWS Bedrock (Claude 3.5 Sonnet) for AI inference
const bedrockPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['bedrock:InvokeModel'],
    resources: [
        // Anthropic Claude 3.5 Sonnet model used by all AI functions
        'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0'
    ]
});

backend.ripsValidator.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.glosaDefender.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.rosterArchitect.resources.lambda.addToRolePolicy(bedrockPolicy);

// Apply AWS resource tags to prevent Spring cleaning deletion
// These tags are inherited by all resources in the stack (DynamoDB, Lambda, Cognito, AppSync, etc.)
try {
    Tags.of(backend.stack).add('auto-delete', 'no');        // Prevents nightly Spring cleaning deletion
    Tags.of(backend.stack).add('application', 'EPS');       // Identifies resource ownership for tracking and cost allocation
} catch (error) {
    console.error('⚠️  Failed to apply tags to backend stack:', error);
    console.log('📝 Manual remediation required - add tags via AWS Console or CLI');
    console.log('   aws resourcegroupstaggingapi tag-resources --resource-arn-list <arn> --tags auto-delete=no,application=EPS');
}
