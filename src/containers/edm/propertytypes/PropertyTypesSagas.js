/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  CREATE_PROPERTY_TYPE_REQUEST,
  createPropertyTypeFailure,
  createPropertyTypeSuccess,
  FETCH_ALL_PROPERTY_TYPES_REQUEST,
  fetchAllPropertyTypesFailure,
  fetchAllPropertyTypesSuccess
} from './PropertyTypesActionFactory';

export function* watchCreatePropertyTypeRequest() :Generator<*, *, *> {

  while (true) {
    const action :Object = yield take(CREATE_PROPERTY_TYPE_REQUEST);
    try {
      const response = yield call(EntityDataModelApi.createPropertyType, action.propertyType);
      yield put(createPropertyTypeSuccess(action.propertyType, response));
    }
    catch (error) {
      yield put(createPropertyTypeFailure(action.propertyType, error));
    }
  }
}

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
