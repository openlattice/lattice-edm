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
  ERR_ET_DOES_NOT_EXIST,
  ERR_FQN_EXISTS,
  ERR_WORKER_SAGA,
} from '../../../utils/Errors';
import {
  LOCAL_CREATE_ENTITY_TYPE,
  LOCAL_DELETE_ENTITY_TYPE,
  LOCAL_UPDATE_ENTITY_TYPE_META,
  localCreateEntityType,
  localDeleteEntityType,
  localUpdateEntityTypeMeta,
} from './EntityTypesActions';
import type { IndexMap, UpdateEntityTypeMeta } from '../Types';

const LOG = new Logger('EntityTypesSagas');

const {
  createEntityType,
  deleteEntityType,
  updateEntityTypeMetaData,
} = EntityDataModelApiActions;

const {
  createEntityTypeWorker,
  deleteEntityTypeWorker,
  updateEntityTypeMetaDataWorker,
} = EntityDataModelApiSagas;

const {
  EntityType,
} = Models;

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
      metadata,
      entityTypeId,
    } :UpdateEntityTypeMeta = value;

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline && isValidUUID(entityTypeId)) {
      const response :Object = yield call(
        updateEntityTypeMetaDataWorker,
        updateEntityTypeMetaData({ metadata, entityTypeId })
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
  localCreateEntityTypeWatcher,
  localCreateEntityTypeWorker,
  localDeleteEntityTypeWatcher,
  localDeleteEntityTypeWorker,
  localUpdateEntityTypeMetaWatcher,
  localUpdateEntityTypeMetaWorker,
};
