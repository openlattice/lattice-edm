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
  fetchAllAssociationTypesSuccess
} from './AssociationTypesActionFactory';

export function* watchCreateAssociationTypeRequest() :Generator<*, *, *> {

  while (true) {
    const action :Object = yield take(CREATE_ASSOCIATION_TYPE_REQUEST);
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
