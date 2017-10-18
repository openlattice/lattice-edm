/*
 * @flow
 */

import { combineReducers } from 'redux-immutable';

import authReducer from '../auth/AuthReducer';
import edmReducer from '../../containers/edm/EntityDataModelReducer';

export default function reduxReducer() {

  return combineReducers({
    auth: authReducer,
    edm: edmReducer()
  });
}
