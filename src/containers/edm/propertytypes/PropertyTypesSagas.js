/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  DELETE_PROPERTY_TYPE_REQUEST,
  deletePropertyTypeFailure,
  deletePropertyTypeSuccess,
  UPDATE_PROPERTY_TYPE_METADATA_REQUEST,
  updatePropertyTypeMetaDataFailure,
  updatePropertyTypeMetaDataSuccess
} from './PropertyTypesActionFactory';

import type {
  DeletePropertyTypeRequestAction,
  UpdatePropertyTypeMetaDataRequestAction
} from './PropertyTypesActionFactory';

export function* watchDeletePropertyTypeRequest() :Generator<*, *, *> {

  while (true) {
    const action :DeletePropertyTypeRequestAction = yield take(DELETE_PROPERTY_TYPE_REQUEST);
    try {
      yield call(EntityDataModelApi.deletePropertyType, action.propertyTypeId);
      yield put(deletePropertyTypeSuccess(action.propertyTypeId));
    }
    catch (error) {
      yield put(deletePropertyTypeFailure(action.propertyTypeId, error));
    }
  }
}

export function* watchUpdatePropertyTypeMetaDataRequest() :Generator<*, *, *> {

  while (true) {
    const action :UpdatePropertyTypeMetaDataRequestAction = yield take(UPDATE_PROPERTY_TYPE_METADATA_REQUEST);
    try {
      yield call(
        EntityDataModelApi.updatePropertyTypeMetaData,
        action.propertyTypeId,
        action.metadata
      );
      yield put(updatePropertyTypeMetaDataSuccess(action.propertyTypeId, action.metadata));
    }
    catch (error) {
      yield put(updatePropertyTypeMetaDataFailure(action.propertyTypeId, error));
    }
  }
}
