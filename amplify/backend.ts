import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { rosterArchitect } from './functions/roster-architect/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
defineBackend({
    auth,
    data,
    rosterArchitect,
});
