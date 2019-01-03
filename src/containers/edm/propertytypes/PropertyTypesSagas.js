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

import Logger from '../../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED, ERR_WORKER_SAGA } from '../../../utils/Errors';
import {
  LOCAL_CREATE_PROPERTY_TYPE,
  localCreatePropertyType,
} from './PropertyTypesActions';

import type { IndexMap } from '../Types';

const LOG = new Logger('PropertyTypesSagas');

const {
  createPropertyType,
} = EntityDataModelApiActions;

const {
  createPropertyTypeWorker,
} = EntityDataModelApiSagas;

const {
  FullyQualifiedName,
  PropertyType,
  PropertyTypeBuilder,
} = Models;

const ERR_FQN_EXISTS :string = 'FQN already exists';

function* localCreatePropertyTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localCreatePropertyType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localCreatePropertyType.request(id, value));

    let response :Object = {};
    const newPropertyType :PropertyType = value;
    const newPropertyTypeFQN :FQN = newPropertyType.type;
    const propertyTypesIndexMap :IndexMap = yield select(
      state => state.getIn(['edm', 'propertyTypes', 'propertyTypesIndexMap'])
    );

    if (propertyTypesIndexMap.has(newPropertyTypeFQN)) {
      yield put(localCreatePropertyType.failure(id, ERR_FQN_EXISTS));
      return;
    }

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    let newPropertyTypeId :UUID = '';
    if (isOnline) {
      response = yield call(createPropertyTypeWorker, createPropertyType(newPropertyType));
      if (response.error) throw response.error;
      newPropertyTypeId = response.data;
    }

    yield put(localCreatePropertyType.success(id, newPropertyTypeId));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localCreatePropertyType.failure(id));
  }
  finally {
    yield put(localCreatePropertyType.finally(id));
  }
}


function* localCreatePropertyTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_CREATE_PROPERTY_TYPE, localCreatePropertyTypeWorker);
}

export {
  localCreatePropertyTypeWatcher,
  localCreatePropertyTypeWorker,
};
