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
  LOCAL_ADD_PT_TO_AT,
  LOCAL_CREATE_ASSOCIATION_TYPE,
  LOCAL_DELETE_ASSOCIATION_TYPE,
  LOCAL_REMOVE_PT_FROM_AT,
  LOCAL_UPDATE_ASSOCIATION_TYPE_META,
  localAddPropertyTypeToAssociationType,
  localCreateAssociationType,
  localDeleteAssociationType,
  localRemovePropertyTypeFromAssociationType,
  localUpdateAssociationTypeMeta,
} from './AssociationTypesActions';
import type { IndexMap } from '../Types';

const LOG = new Logger('EntityTypesSagas');

const {
  createAssociationType,
} = EntityDataModelApiActions;

const {
  createAssociationTypeWorker,
} = EntityDataModelApiSagas;

const {
  AssociationType,
} = Models;

/*
 *
 * EntityTypesActions.localCreateAssociationType()
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

export {
  localCreateAssociationTypeWatcher,
  localCreateAssociationTypeWorker,
};
