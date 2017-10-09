/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  FETCH_ALL_PROPERTY_TYPES_REQUEST,
  fetchAllPropertyTypesSuccess,
  fetchAllPropertyTypesFailure
} from './PropertyTypesActionFactory';

export function* watchFetchAllPropertyTypesRequest() :Generator<*, *, *> {

  while (true) {
    yield take(FETCH_ALL_PROPERTY_TYPES_REQUEST);
    try {
      const response = yield call(EntityDataModelApi.getAllPropertyTypes);
      yield put(fetchAllPropertyTypesSuccess(response));
    }
    catch (error) {
      yield put(fetchAllPropertyTypesFailure(error));
    }
  }
}
