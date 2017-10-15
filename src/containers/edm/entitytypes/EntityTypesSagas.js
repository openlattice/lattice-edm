/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  fetchAllEntityTypesSuccess,
  fetchAllEntityTypesFailure,
  CREATE_ENTITY_TYPE_REQUEST,
  createEntityTypeSuccess,
  createEntityTypeFailure
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

export function* watchCreateEntityTypeRequest() :Generator<*, *, *> {

  while (true) {
    const action :Object = yield take(CREATE_ENTITY_TYPE_REQUEST);
    try {
      const response = yield call(EntityDataModelApi.createEntityType, action.entityType);
      yield put(createEntityTypeSuccess(action.entityType, response));
    }
    catch (error) {
      yield put(createEntityTypeFailure(action.entityType, error));
    }
  }
}
