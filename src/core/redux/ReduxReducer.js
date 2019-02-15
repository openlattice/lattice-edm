/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import edmReducer from '../../containers/edm/EntityDataModelReducer';
import githubReducer from '../../containers/github/GitHubReducer';
import syncEdmReducer from '../../containers/sync/SyncReducer';
import { AppReducer } from '../../containers/app';

export default function reduxReducer() {

  return combineReducers({
    app: AppReducer,
    auth: AuthReducer,
    edm: edmReducer(),
    github: githubReducer,
    sync: syncEdmReducer,
  });
}
