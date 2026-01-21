import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { rosterArchitect } from './functions/roster-architect/resource';
import { ripsValidator } from './functions/rips-validator/resource';
import { glosaDefender } from './functions/glosa-defender/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
defineBackend({
    auth,
    data,
    rosterArchitect,
    ripsValidator,
    glosaDefender,
});
