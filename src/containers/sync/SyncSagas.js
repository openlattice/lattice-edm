/*
 * @flow
 */

/* eslint-disable no-use-before-define */

import Lattice, { Models } from 'lattice';
import { EntityDataModelApiActionFactory, EntityDataModelApiSagas } from 'lattice-sagas';
import { call, put, takeEvery } from 'redux-saga/effects';

import { resetLatticeConfig } from '../../utils/Utils';
import {
  SYNC_PROD_EDM,
  syncProdEntityDataModel,
} from './SyncActionFactory';

// injected by Webpack.DefinePlugin
declare var __ENV_PROD__ :boolean;

const {
  getEntityDataModel,
  getEntityDataModelDiff,
  getEntityDataModelVersion,
  updateEntityDataModel,
} = EntityDataModelApiActionFactory;

const {
  getEntityDataModelWorker,
  getEntityDataModelDiffWorker,
  getEntityDataModelVersionWorker,
  updateEntityDataModelWorker,
} = EntityDataModelApiSagas;

const { FullyQualifiedName } = Models;

const OL_AUDIT_FQN :FullyQualifiedName = new FullyQualifiedName('OPENLATTICE_AUDIT', 'AUDIT');

function removeOpenLatticeAuditType(edm :Object) :Object {

  const propertyTypes = edm.propertyTypes.filter(
    propertyType => FullyQualifiedName.toString(propertyType.type) !== OL_AUDIT_FQN.toString()
  );

  const entityTypes = edm.entityTypes.filter(
    enitityType => FullyQualifiedName.toString(enitityType.type) !== OL_AUDIT_FQN.toString()
  );

  const associationTypes = edm.associationTypes.filter(
    associationType => FullyQualifiedName.toString(associationType.entityType.type) !== OL_AUDIT_FQN.toString()
  );

  return Object.assign({}, edm, { propertyTypes, entityTypes, associationTypes });
}

function* syncProdEntityDataModelWatcher() :Generator<*, *, *> {

  yield takeEvery(SYNC_PROD_EDM, syncProdEntityDataModelWorker);
}

function* syncProdEntityDataModelWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(syncProdEntityDataModel.request(action.id));

    if (__ENV_PROD__) {
      throw new Error('Sync is not allowed on prod.');
    }

    let response :Object = yield call(getEntityDataModelVersionWorker, getEntityDataModelVersion());
    if (response.error) {
      throw new Error(response.error);
    }
    const localVersion :string = response.data;

    /*
     * the authToken doesn't actually matter since the prod EDM endpoint is publicly available. setting authToken to
     * null will result in requests without an "Authorization" header, which is what we want
     */
    Lattice.configure({ authToken: null, baseUrl: 'production' });
    response = yield call(getEntityDataModelWorker, getEntityDataModel());
    if (response.error) {
      throw new Error(response.error);
    }
    let prodEntityDataModel :Object = response.data;
    prodEntityDataModel = removeOpenLatticeAuditType(prodEntityDataModel);
    prodEntityDataModel = Object.assign({}, prodEntityDataModel, { version: localVersion });

    // revert back to initial configuration
    resetLatticeConfig();
    response = yield call(getEntityDataModelDiffWorker, getEntityDataModelDiff(prodEntityDataModel));
    if (response.error) {
      throw new Error(response.error);
    }
    const { conflicts, diff } = response.data;
    if (conflicts !== null) {
      throw new Error(response.error);
    }

    response = yield call(updateEntityDataModelWorker, updateEntityDataModel(diff));
    if (response.error) {
      throw new Error(response.error);
    }

    // finally, we're done
    yield put(syncProdEntityDataModel.success(action.id));
  }
  catch (error) {
    yield put(syncProdEntityDataModel.failure(action.id, error));
  }
  finally {
    // making sure to revert back to initial configuration
    resetLatticeConfig();
    yield put(syncProdEntityDataModel.finally(action.id));
  }
}

export {
  syncProdEntityDataModelWatcher,
  syncProdEntityDataModelWorker,
};
