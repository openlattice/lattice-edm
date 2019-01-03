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
import { isValidUUID } from '../../../utils/ValidationUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED, ERR_WORKER_SAGA } from '../../../utils/Errors';
import {
  LOCAL_CREATE_PROPERTY_TYPE,
  LOCAL_DELETE_PROPERTY_TYPE,
  localCreatePropertyType,
  localDeletePropertyType,
} from './PropertyTypesActions';

import type { IndexMap } from '../Types';

const LOG = new Logger('PropertyTypesSagas');

const {
  createPropertyType,
  deletePropertyType,
} = EntityDataModelApiActions;

const {
  createPropertyTypeWorker,
  deletePropertyTypeWorker,
} = EntityDataModelApiSagas;

const {
  FullyQualifiedName,
  PropertyType,
  PropertyTypeBuilder,
} = Models;

const ERR_FQN_EXISTS :string = 'FQN already exists';
const ERR_PT_DOES_NOT_EXIST :string = 'PropertyType does not exist';

/*
 *
 * PropertyTypesActions.localCreatePropertyType()
 *
 */

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

/*
 *
 * PropertyTypesActions.localDeletePropertyType()
 *
 */

function* localDeletePropertyTypeWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(localDeletePropertyType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(localDeletePropertyType.request(id, value));

    let response :Object = {};
    const propertyTypeId :FQN | UUID = value;
    const propertyTypesIndexMap :IndexMap = yield select(
      state => state.getIn(['edm', 'propertyTypes', 'propertyTypesIndexMap'])
    );

    if (!propertyTypesIndexMap.has(propertyTypeId)) {
      yield put(localDeletePropertyType.failure(id, ERR_PT_DOES_NOT_EXIST));
      return;
    }

    const isOnline :boolean = yield select(
      state => state.getIn(['app', 'isOnline'])
    );

    if (isOnline && isValidUUID(propertyTypeId)) {
      response = yield call(deletePropertyTypeWorker, deletePropertyType(propertyTypeId));
      if (response.error) throw response.error;
    }

    yield put(localDeletePropertyType.success(id, propertyTypeId));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(localDeletePropertyType.failure(id));
  }
  finally {
    yield put(localDeletePropertyType.finally(id));
  }
}

function* localDeletePropertyTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(LOCAL_DELETE_PROPERTY_TYPE, localDeletePropertyTypeWorker);
}

export {
  localCreatePropertyTypeWatcher,
  localCreatePropertyTypeWorker,
  localDeletePropertyTypeWatcher,
  localDeletePropertyTypeWorker,
};
