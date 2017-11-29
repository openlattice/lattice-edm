/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  UPDATE_PROPERTY_TYPE_METADATA_REQUEST,
  updatePropertyTypeMetaDataFailure,
  updatePropertyTypeMetaDataSuccess
} from './PropertyTypesActionFactory';

import type {
  UpdatePropertyTypeMetaDataRequestAction
} from './PropertyTypesActionFactory';

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
