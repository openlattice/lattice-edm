/*
 * @flow
 */

import { EntityDataModelApiActions, EntityDataModelApiSagas } from 'lattice-sagas';
import {
  call,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects';
import type { FQN, Schema } from 'lattice';

import Logger from '../../../utils/Logger';
import {
  ERR_ACTION_VALUE_NOT_DEFINED,
  ERR_FQN_EXISTS,
  ERR_WORKER_SAGA,
} from '../../../utils/Errors';
import {
  LOCAL_CREATE_SCHEMA,
  localCreateSchema,
} from './SchemasActions';
import type { IndexMap } from '../Types';

const LOG = new Logger('SchemasSagas');

const {
  createSchema,
} = EntityDataModelApiActions;

const {
  createSchemaWorker,
} = EntityDataModelApiSagas;

/*
 *
 * PropertyTypesActions.localCreateSchema()
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

export {
  localCreateSchemaWatcher,
  localCreateSchemaWorker,
};
