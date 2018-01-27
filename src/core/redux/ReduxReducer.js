/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import edmReducer from '../../containers/edm/EntityDataModelReducer';

export default function reduxReducer() {

  return combineReducers({
    auth: AuthReducer,
    edm: edmReducer()
  });
}
