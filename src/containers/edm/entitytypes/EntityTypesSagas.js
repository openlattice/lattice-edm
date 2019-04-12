/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import type { FQN, EntityType } from 'lattice';
import { EntityDataModelApiActions, EntityDataModelApiSagas } from 'lattice-sagas';

import Logger from '../../../utils/Logger';
import { isValidUUID } from '../../../utils/ValidationUtils';
import {
  ERR_ACTION_VALUE_NOT_DEFINED,
  ERR_ET_DOES_NOT_EXIST,
  ERR_FQN_EXISTS,
  ERR_WORKER_SAGA,
} from '../../../utils/Errors';
import {
  LOCAL_ADD_PT_TO_ET,
  LOCAL_CREATE_ENTITY_TYPE,
  LOCAL_DELETE_ENTITY_TYPE,
  LOCAL_REMOVE_PT_FROM_ET,
  LOCAL_UPDATE_ENTITY_TYPE_META,
  localAddPropertyTypeToEntityType,
  localCreateEntityType,
  localDeleteEntityType,
  localRemovePropertyTypeFromEntityType,
  localUpdateEntityTypeMeta,
} from './EntityTypesActions';
import type { IndexMap, UpdateEntityTypeMeta } from '../Types';

const LOG = new Logger('EntityTypesSagas');

const {
  addPropertyTypeToEntityType,
  createEntityType,
  deleteEntityType,
  removePropertyTypeFromEntityType,
  updateEntityTypeMetaData,
} = EntityDataModelApiActions;

const {
  addPropertyTypeToEntityTypeWorker,
  createEntityTypeWorker,
  deleteEntityTypeWorker,
  removePropertyTypeFromEntityTypeWorker,
  updateEntityTypeMetaDataWorker,
} = EntityDataModelApiSagas;

/*
 *
 * EntityTypesActions.localAddPropertyTypeToEntityType()
 *
 */

function* localAddPropertyTypeToEntityTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localAddPropertyTypeToEntityType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localAddPropertyTypeToEntityType.request(id, value));

    const {
      entityTypeId,
      propertyTypeId,
    } = value;

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

    yield put(localAddPropertyTypeToEntityType.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localAddPropertyTypeToEntityType.failure(id));
  }
  finally {
    yield put(localAddPropertyTypeToEntityType.finally(id));
  }
}

function* localAddPropertyTypeToEntityTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_ADD_PT_TO_ET, localAddPropertyTypeToEntityTypeWorker);
}

/*
 *
 * EntityTypesActions.localCreateEntityType()
 *
 */

function* localCreateEntityTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localCreateEntityType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localCreateEntityType.request(id, value));

    const newEntityType :EntityType = value;
    const newEntityTypeFQN :FQN = newEntityType.type;
    const entityTypesIndexMap :IndexMap = yield select(
      state => state.getIn(['edm', 'entityTypes', 'entityTypesIndexMap'])
    );

    if (entityTypesIndexMap.has(newEntityTypeFQN)) {
      yield put(localCreateEntityType.failure(id, ERR_FQN_EXISTS));
      return;
    }

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    let newEntityTypeId :?UUID = '';
    if (isOnline) {
      const response :Object = yield call(createEntityTypeWorker, createEntityType(newEntityType));
      if (response.error) throw response.error;
      newEntityTypeId = response.data;
    }

    yield put(localCreateEntityType.success(id, newEntityTypeId));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localCreateEntityType.failure(id));
  }
  finally {
    yield put(localCreateEntityType.finally(id));
  }
}

function* localCreateEntityTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_CREATE_ENTITY_TYPE, localCreateEntityTypeWorker);
}

/*
 *
 * EntityTypesActions.localDeleteEntityType()
 *
 */

function* localDeleteEntityTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localDeleteEntityType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localDeleteEntityType.request(id, value));

    const entityTypeFQN :FQN = value.entityTypeFQN;
    const entityTypeId :?UUID = value.entityTypeId;

    const entityTypesIndexMap :IndexMap = yield select(
      state => state.getIn(['edm', 'entityTypes', 'entityTypesIndexMap'])
    );

    if (!entityTypesIndexMap.has(entityTypeFQN)) {
      yield put(localDeleteEntityType.failure(id, ERR_ET_DOES_NOT_EXIST));
      return;
    }

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline && isValidUUID(entityTypeId)) {
      const response :Object = yield call(deleteEntityTypeWorker, deleteEntityType(entityTypeId));
      if (response.error) throw response.error;
    }

    yield put(localDeleteEntityType.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localDeleteEntityType.failure(id));
  }
  finally {
    yield put(localDeleteEntityType.finally(id));
  }
}

function* localDeleteEntityTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_DELETE_ENTITY_TYPE, localDeleteEntityTypeWorker);
}

/*
 *
 * EntityTypesActions.localRemovePropertyTypeFromEntityType()
 *
 */

function* localRemovePropertyTypeFromEntityTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localRemovePropertyTypeFromEntityType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localRemovePropertyTypeFromEntityType.request(id, value));

    const {
      entityTypeId,
      propertyTypeId,
    } = value;

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

    yield put(localRemovePropertyTypeFromEntityType.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localRemovePropertyTypeFromEntityType.failure(id));
  }
  finally {
    yield put(localRemovePropertyTypeFromEntityType.finally(id));
  }
}

function* localRemovePropertyTypeFromEntityTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_REMOVE_PT_FROM_ET, localRemovePropertyTypeFromEntityTypeWorker);
}

/*
 *
 * EntityTypesActions.localUpdateEntityTypeMeta()
 *
 */

function* localUpdateEntityTypeMetaWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localUpdateEntityTypeMeta.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localUpdateEntityTypeMeta.request(id, value));

    const {
      entityTypeId,
      metadata,
    } :UpdateEntityTypeMeta = value;

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline && isValidUUID(entityTypeId)) {
      const response :Object = yield call(
        updateEntityTypeMetaDataWorker,
        updateEntityTypeMetaData({ entityTypeId, metadata })
      );
      if (response.error) throw response.error;
    }

    yield put(localUpdateEntityTypeMeta.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localUpdateEntityTypeMeta.failure(id));
  }
  finally {
    yield put(localUpdateEntityTypeMeta.finally(id));
  }
}

function* localUpdateEntityTypeMetaWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_UPDATE_ENTITY_TYPE_META, localUpdateEntityTypeMetaWorker);
}

export {
  localAddPropertyTypeToEntityTypeWatcher,
  localAddPropertyTypeToEntityTypeWorker,
  localCreateEntityTypeWatcher,
  localCreateEntityTypeWorker,
  localDeleteEntityTypeWatcher,
  localDeleteEntityTypeWorker,
  localRemovePropertyTypeFromEntityTypeWatcher,
  localRemovePropertyTypeFromEntityTypeWorker,
  localUpdateEntityTypeMetaWatcher,
  localUpdateEntityTypeMetaWorker,
};
