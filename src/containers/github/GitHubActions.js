/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const OPEN_PULL_REQUEST :'OPEN_PULL_REQUEST' = 'OPEN_PULL_REQUEST';
const openPullRequest :RequestSequence = newRequestSequence(OPEN_PULL_REQUEST);

export {
  OPEN_PULL_REQUEST,
  openPullRequest,
};
