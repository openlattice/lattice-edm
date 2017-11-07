/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  ADD_PROPERTY_TYPE_TO_ENTITY_TYPE,
  addPropertyTypeToEntityType,
  CREATE_ENTITY_TYPE_REQUEST,
  createEntityTypeFailure,
  createEntityTypeSuccess,
  DELETE_ENTITY_TYPE_REQUEST,
  deleteEntityTypeFailure,
  deleteEntityTypeSuccess,
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  fetchAllEntityTypesFailure,
  fetchAllEntityTypesSuccess,
  RM_PROPERTY_TYPE_FROM_ENTITY_TYPE,
  removePropertyTypeFromEntityType,
  UPDATE_ENTITY_TYPE_METADATA_REQUEST,
  updateEntityTypeMetaDataFailure,
  updateEntityTypeMetaDataSuccess
} from './EntityTypesActionFactory';

import type {
  CreateEntityTypeRequestAction,
  DeleteEntityTypeRequestAction,
  UpdateEntityTypeMetaDataRequestAction
} from './EntityTypesActionFactory';

export function* watchAddPropertyTypeToEntityType() :Generator<*, *, *> {

  while (true) {
    const action = yield take(ADD_PROPERTY_TYPE_TO_ENTITY_TYPE);
    yield put(addPropertyTypeToEntityType.request());
    try {
      yield call(
        EntityDataModelApi.addPropertyTypeToEntityType,
        action.data.entityTypeId,
        action.data.propertyTypeId
      );
      yield put(
        addPropertyTypeToEntityType.success({
          entityTypeId: action.data.entityTypeId,
          propertyTypeId: action.data.propertyTypeId
        })
      );
    }
    catch (error) {
      yield put(
        addPropertyTypeToEntityType.failure({
          error,
          entityTypeId: action.data.entityTypeId,
          propertyTypeId: action.data.propertyTypeId
        })
      );
    }
    finally {
      yield put(addPropertyTypeToEntityType.finally());
    }
  }
}

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

export function* watchDeleteEntityTypeRequest() :Generator<*, *, *> {

  while (true) {
    const action :DeleteEntityTypeRequestAction = yield take(DELETE_ENTITY_TYPE_REQUEST);
    try {
      yield call(EntityDataModelApi.deleteEntityType, action.entityTypeId);
      yield put(deleteEntityTypeSuccess(action.entityTypeId));
    }
    catch (error) {
      yield put(deleteEntityTypeFailure(action.entityTypeId, error));
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

export function* watchRemovePropertyTypeFromEntityType() :Generator<*, *, *> {

  while (true) {
    const action = yield take(RM_PROPERTY_TYPE_FROM_ENTITY_TYPE);
    yield put(removePropertyTypeFromEntityType.request());
    try {
      yield call(
        EntityDataModelApi.removePropertyTypeFromEntityType,
        action.data.entityTypeId,
        action.data.propertyTypeId
      );
      yield put(
        removePropertyTypeFromEntityType.success({
          entityTypeId: action.data.entityTypeId,
          propertyTypeId: action.data.propertyTypeId
        })
      );
    }
    catch (error) {
      yield put(
        removePropertyTypeFromEntityType.failure({
          error,
          entityTypeId: action.data.entityTypeId,
          propertyTypeId: action.data.propertyTypeId
        })
      );
    }
    finally {
      yield put(removePropertyTypeFromEntityType.finally());
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
