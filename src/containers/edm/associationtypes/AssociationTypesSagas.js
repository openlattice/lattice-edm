/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  CREATE_ASSOCIATION_TYPE_REQUEST,
  createAssociationTypeFailure,
  createAssociationTypeSuccess,
  FETCH_ALL_ASSOCIATION_TYPES_REQUEST,
  fetchAllAssociationTypesFailure,
  fetchAllAssociationTypesSuccess,
  UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST,
  updateAssociationTypeMetaDataFailure,
  updateAssociationTypeMetaDataSuccess
} from './AssociationTypesActionFactory';

import type {
  CreateAssociationTypeRequestAction,
  UpdateAssociationTypeMetaDataRequestAction
} from './AssociationTypesActionFactory';

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

export function* watchUpdateAssociationTypeMetaDataRequest() :Generator<*, *, *> {

  while (true) {
    const action :UpdateAssociationTypeMetaDataRequestAction = yield take(UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST);
    try {
      yield call(
        EntityDataModelApi.updateEntityTypeMetaData,
        action.associationTypeId,
        action.metadata
      );
      debugger;
      yield put(updateAssociationTypeMetaDataSuccess(action.associationTypeId, action.metadata));
    }
    catch (error) {
      yield put(updateAssociationTypeMetaDataFailure(action.associationTypeId, error));
    }
  }
}
