/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  ADD_PROPERTY_TYPE_TO_ENTITY_TYPE,
  addPropertyTypeToEntityType,
  RM_PROPERTY_TYPE_FROM_ENTITY_TYPE,
  removePropertyTypeFromEntityType
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
      yield put(addPropertyTypeToEntityType.failure({ error }));
    }
    finally {
      yield put(addPropertyTypeToEntityType.finally());
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
      yield put(removePropertyTypeFromEntityType.failure({ error }));
    }
    finally {
      yield put(removePropertyTypeFromEntityType.finally());
    }
  }
}
