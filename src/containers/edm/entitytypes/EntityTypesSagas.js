/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  fetchAllEntityTypesSuccess,
  fetchAllEntityTypesFailure
} from './EntityTypesActionFactory';

export function* watchFetchAllEntityTypesRequest() :Generator<*, *, *> {

  while (true) {
    yield take(FETCH_ALL_ENTITY_TYPES_REQUEST);
    try {
      const response = yield call(EntityDataModelApi.getAllEntityTypes);
      yield put(fetchAllEntityTypesSuccess(response));
    }
    catch (error) {
      yield put(fetchAllEntityTypesFailure(error));
    }
  }
}
