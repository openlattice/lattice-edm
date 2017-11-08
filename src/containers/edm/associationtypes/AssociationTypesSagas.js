/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  ADD_DST_ET_TO_AT,
  addDestinationEntityTypeToAssociationType,
  ADD_SRC_ET_TO_AT,
  addSourceEntityTypeToAssociationType,
  CREATE_ASSOCIATION_TYPE_REQUEST,
  createAssociationTypeFailure,
  createAssociationTypeSuccess,
  DELETE_ASSOCIATION_TYPE_REQUEST,
  deleteAssociationTypeFailure,
  deleteAssociationTypeSuccess,
  FETCH_ALL_ASSOCIATION_TYPES_REQUEST,
  fetchAllAssociationTypesFailure,
  fetchAllAssociationTypesSuccess,
  RM_DST_ET_FROM_AT,
  removeDestinationEntityTypeFromAssociationType,
  RM_SRC_ET_FROM_AT,
  removeSourceEntityTypeFromAssociationType,
  UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST,
  updateAssociationTypeMetaDataFailure,
  updateAssociationTypeMetaDataSuccess
} from './AssociationTypesActionFactory';

import type {
  CreateAssociationTypeRequestAction,
  DeleteAssociationTypeRequestAction,
  UpdateAssociationTypeMetaDataRequestAction
} from './AssociationTypesActionFactory';

export function* watchAddDestinationEntityTypeToAssociationType() :Generator<*, *, *> {

  while (true) {
    const action = yield take(ADD_DST_ET_TO_AT);
    yield put(addDestinationEntityTypeToAssociationType.request());
    try {
      yield call(
        EntityDataModelApi.addDstEntityTypeToAssociationType,
        action.data.associationTypeId,
        action.data.entityTypeId
      );
      yield put(
        addDestinationEntityTypeToAssociationType.success({
          associationTypeId: action.data.associationTypeId,
          entityTypeId: action.data.entityTypeId
        })
      );
    }
    catch (error) {
      yield put(addDestinationEntityTypeToAssociationType.failure({ error }));
    }
    finally {
      yield put(addDestinationEntityTypeToAssociationType.finally());
    }
  }
}

export function* watchAddSourceEntityTypeToAssociationType() :Generator<*, *, *> {

  while (true) {
    const action = yield take(ADD_SRC_ET_TO_AT);
    yield put(addSourceEntityTypeToAssociationType.request());
    try {
      yield call(
        EntityDataModelApi.addSrcEntityTypeToAssociationType,
        action.data.associationTypeId,
        action.data.entityTypeId
      );
      yield put(
        addSourceEntityTypeToAssociationType.success({
          associationTypeId: action.data.associationTypeId,
          entityTypeId: action.data.entityTypeId
        })
      );
    }
    catch (error) {
      yield put(addSourceEntityTypeToAssociationType.failure({ error }));
    }
    finally {
      yield put(addSourceEntityTypeToAssociationType.finally());
    }
  }
}

export function* watchCreateAssociationTypeRequest() :Generator<*, *, *> {

  while (true) {
    const action :CreateAssociationTypeRequestAction = yield take(CREATE_ASSOCIATION_TYPE_REQUEST);
    try {
      const response = yield call(EntityDataModelApi.createAssociationType, action.associationType);
      yield put(createAssociationTypeSuccess(action.associationType, response));
    }
    catch (error) {
      yield put(createAssociationTypeFailure(action.associationType, error));
    }
  }
}

export function* watchDeleteAssociationTypeRequest() :Generator<*, *, *> {

  while (true) {
    const action :DeleteAssociationTypeRequestAction = yield take(DELETE_ASSOCIATION_TYPE_REQUEST);
    try {
      yield call(EntityDataModelApi.deleteAssociationType, action.associationTypeId);
      yield put(deleteAssociationTypeSuccess(action.associationTypeId));
    }
    catch (error) {
      yield put(deleteAssociationTypeFailure(action.associationTypeId, error));
    }
  }
}

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

export function* watchRemoveDestinationEntityTypeFromAssociationType() :Generator<*, *, *> {

  while (true) {
    const action = yield take(RM_DST_ET_FROM_AT);
    yield put(removeDestinationEntityTypeFromAssociationType.request());
    try {
      yield call(
        EntityDataModelApi.removeDstEntityTypeFromAssociationType,
        action.data.associationTypeId,
        action.data.entityTypeId
      );
      yield put(
        removeDestinationEntityTypeFromAssociationType.success({
          associationTypeId: action.data.associationTypeId,
          entityTypeId: action.data.entityTypeId
        })
      );
    }
    catch (error) {
      yield put(removeDestinationEntityTypeFromAssociationType.failure({ error }));
    }
    finally {
      yield put(removeDestinationEntityTypeFromAssociationType.finally());
    }
  }
}

export function* watchRemoveSourceEntityTypeFromAssociationType() :Generator<*, *, *> {

  while (true) {
    const action = yield take(RM_SRC_ET_FROM_AT);
    yield put(removeSourceEntityTypeFromAssociationType.request());
    try {
      yield call(
        EntityDataModelApi.removeSrcEntityTypeFromAssociationType,
        action.data.associationTypeId,
        action.data.entityTypeId
      );
      yield put(
        removeSourceEntityTypeFromAssociationType.success({
          associationTypeId: action.data.associationTypeId,
          entityTypeId: action.data.entityTypeId
        })
      );
    }
    catch (error) {
      yield put(removeSourceEntityTypeFromAssociationType.failure({ error }));
    }
    finally {
      yield put(removeSourceEntityTypeFromAssociationType.finally());
    }
  }
}

export function* watchUpdateAssociationTypeMetaDataRequest() :Generator<*, *, *> {

  while (true) {
    const action :UpdateAssociationTypeMetaDataRequestAction = yield take(UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST);
    try {
      yield call(
        EntityDataModelApi.updateEntityTypeMetaData,
        action.associationTypeId,
        action.metadata
      );
      yield put(updateAssociationTypeMetaDataSuccess(action.associationTypeId, action.metadata));
    }
    catch (error) {
      yield put(updateAssociationTypeMetaDataFailure(action.associationTypeId, error));
    }
  }
}
