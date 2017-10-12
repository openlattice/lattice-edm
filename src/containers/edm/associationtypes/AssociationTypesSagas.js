/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  FETCH_ALL_ASSOCIATION_TYPES_REQUEST,
  fetchAllAssociationTypesSuccess,
  fetchAllAssociationTypesFailure
} from './AssociationTypesActionFactory';

export function* watchFetchAllAssociationTypesRequest() :Generator<*, *, *> {

  while (true) {
    yield take(FETCH_ALL_ASSOCIATION_TYPES_REQUEST);
    try {
      const response = yield call(EntityDataModelApi.getAllAssociationTypes);
      yield put(fetchAllAssociationTypesSuccess(response));
    }
    catch (error) {
      yield put(fetchAllAssociationTypesFailure(error));
    }
  }
}
