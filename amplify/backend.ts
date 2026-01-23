import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';
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
});

// Apply AWS resource tags to prevent Spring cleaning deletion
// These tags are inherited by all resources in the stack (DynamoDB, Lambda, Cognito, AppSync, etc.)
Tags.of(backend.stack).add('auto-delete', 'no');        // Prevents nightly Spring cleaning deletion
Tags.of(backend.stack).add('application', 'IPS-ERP');   // Identifies resource ownership for tracking and cost allocation
