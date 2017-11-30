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
  RM_DST_ET_FROM_AT,
  removeDestinationEntityTypeFromAssociationType,
  RM_SRC_ET_FROM_AT,
  removeSourceEntityTypeFromAssociationType
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
