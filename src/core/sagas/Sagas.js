/*
 * @flow
 */

import { fork } from 'redux-saga/effects';

import * as AuthSagas from '../auth/AuthSagas';
import * as PropertyTypesSagas from '../../containers/edm/propertytypes/PropertyTypesSagas';

export default function* sagas() :Generator<*, *, *> {

  yield [
    // AuthSagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // PropertyTypesSagas
    fork(PropertyTypesSagas.watchFetchAllPropertyTypesRequest),
    fork(PropertyTypesSagas.watchSearchForPropertyTypesRequest)
  ];
}
