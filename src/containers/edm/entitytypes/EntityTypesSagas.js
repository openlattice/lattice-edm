/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  CREATE_ENTITY_TYPE_REQUEST,
  createEntityTypeFailure,
  createEntityTypeSuccess,
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  fetchAllEntityTypesFailure,
  fetchAllEntityTypesSuccess,
  UPDATE_ENTITY_TYPE_METADATA_REQUEST,
  updateEntityTypeMetaDataFailure,
  updateEntityTypeMetaDataSuccess
} from './EntityTypesActionFactory';

import type {
  CreateEntityTypeRequestAction,
  UpdateEntityTypeMetaDataRequestAction
} from './EntityTypesActionFactory';

export function* watchCreateEntityTypeRequest() :Generator<*, *, *> {

  while (true) {
    const action :CreateEntityTypeRequestAction = yield take(CREATE_ENTITY_TYPE_REQUEST);
    try {
      const response = yield call(EntityDataModelApi.createEntityType, action.entityType);
      yield put(createEntityTypeSuccess(action.entityType, response));
    }
    catch (error) {
      yield put(createEntityTypeFailure(action.entityType, error));
    }
  }
}

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

export function* watchUpdateEntityTypeMetaDataRequest() :Generator<*, *, *> {

  while (true) {
    const action :UpdateEntityTypeMetaDataRequestAction = yield take(UPDATE_ENTITY_TYPE_METADATA_REQUEST);
    try {
      yield call(
        EntityDataModelApi.updateEntityTypeMetaData,
        action.entityTypeId,
        action.metadata
      );
      yield put(updateEntityTypeMetaDataSuccess(action.entityTypeId, action.metadata));
    }
    catch (error) {
      yield put(updateEntityTypeMetaDataFailure(action.entityTypeId, error));
    }
  }
}
