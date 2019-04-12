/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { EntityDataModelApiActions, EntityDataModelApiSagas } from 'lattice-sagas';
import type { FQN, Schema } from 'lattice';

import Logger from '../../../utils/Logger';
import {
  ERR_ACTION_VALUE_NOT_DEFINED,
  ERR_FQN_EXISTS,
  ERR_WORKER_SAGA,
} from '../../../utils/Errors';
import {
  LOCAL_CREATE_SCHEMA,
  LOCAL_UPDATE_SCHEMA,
  localCreateSchema,
  localUpdateSchema,
} from './SchemasActions';
import type { IndexMap } from '../Types';

const LOG = new Logger('SchemasSagas');

const {
  createSchema,
  updateSchema,
} = EntityDataModelApiActions;

const {
  createSchemaWorker,
  updateSchemaWorker,
} = EntityDataModelApiSagas;

/*
 *
 * SchemasActions.localCreateSchema()
 *
 */

function* localCreateSchemaWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localCreateSchema.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localCreateSchema.request(id, value));

    const newSchema :Schema = value;
    const newSchemaFQN :FQN = newSchema.fqn;
    const schemasIndexMap :IndexMap = yield select(
      state => state.getIn(['edm', 'schemas', 'schemasIndexMap'])
    );

    if (schemasIndexMap.has(newSchemaFQN)) {
      yield put(localCreateSchema.failure(id, ERR_FQN_EXISTS));
      return;
    }

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline) {
      const response :Object = yield call(createSchemaWorker, createSchema(newSchema));
      if (response.error) throw response.error;
    }

    yield put(localCreateSchema.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localCreateSchema.failure(id));
  }
  finally {
    yield put(localCreateSchema.finally(id));
  }
}

function* localCreateSchemaWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_CREATE_SCHEMA, localCreateSchemaWorker);
}

/*
 *
 * SchemasActions.localUpdateSchema()
 *
 */

function* localUpdateSchemaWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localUpdateSchema.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localUpdateSchema.request(id, value));

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline) {

      const {
        actionType,
        entityTypes,
        propertyTypes,
        schemaFQN,
      } = value;

      let { entityTypeIds, propertyTypeIds } = value;

      if (entityTypes && entityTypes.length > 0 && (!entityTypeIds || entityTypeIds.length === 0)) {
        entityTypeIds = entityTypes.map((entityType :Map<*, *>) => entityType.get('id'));
      }

      if (propertyTypes && propertyTypes.length > 0 && (!propertyTypeIds || propertyTypeIds.length === 0)) {
        propertyTypeIds = propertyTypes.map((propertyType :Map<*, *>) => propertyType.get('id'));
      }

      const response :Object = yield call(
        updateSchemaWorker,
        updateSchema({
          entityTypeIds,
          propertyTypeIds,
          schemaFQN,
          action: actionType,
        })
      );
      if (response.error) throw response.error;
    }

    yield put(localUpdateSchema.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localUpdateSchema.failure(id));
  }
  finally {
    yield put(localUpdateSchema.finally(id));
  }
}

function* localUpdateSchemaWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_UPDATE_SCHEMA, localUpdateSchemaWorker);
}

export {
  localCreateSchemaWatcher,
  localCreateSchemaWorker,
  localUpdateSchemaWatcher,
  localUpdateSchemaWorker,
};
