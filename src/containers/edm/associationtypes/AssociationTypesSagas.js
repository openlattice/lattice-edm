/*
 * @flow
 */

import { Models } from 'lattice';
import { EntityDataModelApiActions, EntityDataModelApiSagas } from 'lattice-sagas';
import {
  call,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects';
import type { FQN } from 'lattice';

import Logger from '../../../utils/Logger';
import { isValidUUID } from '../../../utils/ValidationUtils';
import {
  ERR_ACTION_VALUE_NOT_DEFINED,
  ERR_AT_DOES_NOT_EXIST,
  ERR_FQN_EXISTS,
  ERR_WORKER_SAGA,
} from '../../../utils/Errors';
import {
  LOCAL_ADD_PT_TO_AT,
  LOCAL_ADD_SOURCE_ET_TO_AT,
  LOCAL_CREATE_ASSOCIATION_TYPE,
  LOCAL_DELETE_ASSOCIATION_TYPE,
  LOCAL_REMOVE_PT_FROM_AT,
  LOCAL_UPDATE_ASSOCIATION_TYPE_META,
  localAddPropertyTypeToAssociationType,
  localAddSourceEntityTypeToAssociationType,
  localCreateAssociationType,
  localDeleteAssociationType,
  localRemovePropertyTypeFromAssociationType,
  localUpdateAssociationTypeMeta,
} from './AssociationTypesActions';
import type { IndexMap, UpdateAssociationTypeMeta } from '../Types';

const LOG = new Logger('EntityTypesSagas');

const {
  addPropertyTypeToEntityType,
  addSrcEntityTypeToAssociationType,
  createAssociationType,
  deleteAssociationType,
  removePropertyTypeFromEntityType,
  updateAssociationTypeMetaData,
} = EntityDataModelApiActions;

const {
  addPropertyTypeToEntityTypeWorker,
  addSrcEntityTypeToAssociationTypeWorker,
  createAssociationTypeWorker,
  deleteAssociationTypeWorker,
  removePropertyTypeFromEntityTypeWorker,
  updateAssociationTypeMetaDataWorker,
} = EntityDataModelApiSagas;

const {
  AssociationType,
} = Models;

/*
 *
 * AssociationTypesActions.localAddPropertyTypeToAssociationType()
 *
 */

function* localAddPropertyTypeToAssociationTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localAddPropertyTypeToAssociationType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localAddPropertyTypeToAssociationType.request(id, value));

    const entityTypeId :?UUID = value.associationTypeId;
    const propertyTypeId :?UUID = value.propertyTypeId;

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline && isValidUUID(entityTypeId) && isValidUUID(propertyTypeId)) {
      const response :Object = yield call(
        addPropertyTypeToEntityTypeWorker,
        addPropertyTypeToEntityType({ entityTypeId, propertyTypeId })
      );
      if (response.error) throw response.error;
    }

    yield put(localAddPropertyTypeToAssociationType.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localAddPropertyTypeToAssociationType.failure(id));
  }
  finally {
    yield put(localAddPropertyTypeToAssociationType.finally(id));
  }
}

function* localAddPropertyTypeToAssociationTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_ADD_PT_TO_AT, localAddPropertyTypeToAssociationTypeWorker);
}

/*
 *
 * AssociationTypesActions.localAddSourceEntityTypeToAssociationType()
 *
 */

function* localAddSourceEntityTypeToAssociationTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localAddSourceEntityTypeToAssociationType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localAddSourceEntityTypeToAssociationType.request(id, value));

    const associationTypeId :?UUID = value.associationTypeId;
    const entityTypeId :?UUID = value.entityTypeId;

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline && isValidUUID(associationTypeId) && isValidUUID(entityTypeId)) {
      const response :Object = yield call(
        addSrcEntityTypeToAssociationTypeWorker,
        addSrcEntityTypeToAssociationType({ associationTypeId, entityTypeId })
      );
      if (response.error) throw response.error;
    }

    yield put(localAddSourceEntityTypeToAssociationType.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localAddSourceEntityTypeToAssociationType.failure(id));
  }
  finally {
    yield put(localAddSourceEntityTypeToAssociationType.finally(id));
  }
}

function* localAddSourceEntityTypeToAssociationTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_ADD_SOURCE_ET_TO_AT, localAddSourceEntityTypeToAssociationTypeWorker);
}

/*
 *
 * AssociationTypesActions.localCreateAssociationType()
 *
 */

function* localCreateAssociationTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localCreateAssociationType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localCreateAssociationType.request(id, value));

    const newAssociationType :AssociationType = value;
    const newAssociationTypeFQN :FQN = newAssociationType.entityType.type;
    const associationTypesIndexMap :IndexMap = yield select(
      state => state.getIn(['edm', 'associationTypes', 'associationTypesIndexMap'])
    );

    if (associationTypesIndexMap.has(newAssociationTypeFQN)) {
      yield put(localCreateAssociationType.failure(id, ERR_FQN_EXISTS));
      return;
    }

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    let newAssociationTypeId :?UUID = '';
    if (isOnline) {
      const response :Object = yield call(createAssociationTypeWorker, createAssociationType(newAssociationType));
      if (response.error) throw response.error;
      newAssociationTypeId = response.data;
    }

    yield put(localCreateAssociationType.success(id, newAssociationTypeId));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localCreateAssociationType.failure(id));
  }
  finally {
    yield put(localCreateAssociationType.finally(id));
  }
}

function* localCreateAssociationTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_CREATE_ASSOCIATION_TYPE, localCreateAssociationTypeWorker);
}

/*
 *
 * AssociationTypesActions.localDeleteAssociationType()
 *
 */

function* localDeleteAssociationTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localDeleteAssociationType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localDeleteAssociationType.request(id, value));

    const associationTypeFQN :FQN = value.associationTypeFQN;
    const associationTypeId :?UUID = value.associationTypeId;

    const associationTypesIndexMap :IndexMap = yield select(
      state => state.getIn(['edm', 'associationTypes', 'associationTypesIndexMap'])
    );

    if (!associationTypesIndexMap.has(associationTypeFQN)) {
      yield put(localDeleteAssociationType.failure(id, ERR_AT_DOES_NOT_EXIST));
      return;
    }

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline && isValidUUID(associationTypeId)) {
      const response :Object = yield call(deleteAssociationTypeWorker, deleteAssociationType(associationTypeId));
      if (response.error) throw response.error;
    }

    yield put(localDeleteAssociationType.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localDeleteAssociationType.failure(id));
  }
  finally {
    yield put(localDeleteAssociationType.finally(id));
  }
}

function* localDeleteAssociationTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_DELETE_ASSOCIATION_TYPE, localDeleteAssociationTypeWorker);
}

/*
 *
 * AssociationTypesActions.localRemovePropertyTypeFromAssociationType()
 *
 */

function* localRemovePropertyTypeFromAssociationTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localRemovePropertyTypeFromAssociationType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localRemovePropertyTypeFromAssociationType.request(id, value));

    const entityTypeId :?UUID = value.associationTypeId;
    const propertyTypeId :?UUID = value.propertyTypeId;

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline && isValidUUID(entityTypeId) && isValidUUID(propertyTypeId)) {
      const response :Object = yield call(
        removePropertyTypeFromEntityTypeWorker,
        removePropertyTypeFromEntityType({ entityTypeId, propertyTypeId })
      );
      if (response.error) throw response.error;
    }

    yield put(localRemovePropertyTypeFromAssociationType.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localRemovePropertyTypeFromAssociationType.failure(id));
  }
  finally {
    yield put(localRemovePropertyTypeFromAssociationType.finally(id));
  }
}

function* localRemovePropertyTypeFromAssociationTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_REMOVE_PT_FROM_AT, localRemovePropertyTypeFromAssociationTypeWorker);
}

/*
 *
 * AssociationTypesActions.localUpdateAssociationTypeMeta()
 *
 */

function* localUpdateAssociationTypeMetaWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localUpdateAssociationTypeMeta.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localUpdateAssociationTypeMeta.request(id, value));

    const {
      associationTypeId,
      metadata,
    } :UpdateAssociationTypeMeta = value;

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline && isValidUUID(associationTypeId)) {
      const response :Object = yield call(
        updateAssociationTypeMetaDataWorker,
        updateAssociationTypeMetaData({ associationTypeId, metadata }),
      );
      if (response.error) throw response.error;
    }

    yield put(localUpdateAssociationTypeMeta.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localUpdateAssociationTypeMeta.failure(id));
  }
  finally {
    yield put(localUpdateAssociationTypeMeta.finally(id));
  }
}

function* localUpdateAssociationTypeMetaWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_UPDATE_ASSOCIATION_TYPE_META, localUpdateAssociationTypeMetaWorker);
}

export {
  localAddPropertyTypeToAssociationTypeWatcher,
  localAddPropertyTypeToAssociationTypeWorker,
  localAddSourceEntityTypeToAssociationTypeWatcher,
  localAddSourceEntityTypeToAssociationTypeWorker,
  localCreateAssociationTypeWatcher,
  localCreateAssociationTypeWorker,
  localDeleteAssociationTypeWatcher,
  localDeleteAssociationTypeWorker,
  localRemovePropertyTypeFromAssociationTypeWatcher,
  localRemovePropertyTypeFromAssociationTypeWorker,
  localUpdateAssociationTypeMetaWatcher,
  localUpdateAssociationTypeMetaWorker,
};