/*
 * @flow
 */

import { AuthSagas } from 'lattice-auth';
import { EntityDataModelApiSagas } from 'lattice-sagas';
import { fork } from 'redux-saga/effects';

import * as SyncSagas from '../../containers/sync/SyncSagas';

export default function* sagas() :Generator<*, *, *> {

  yield [
    // "lattice-auth" Sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" Sagas
    fork(EntityDataModelApiSagas.addDstEntityTypeToAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.addPropertyTypeToEntityTypeWatcher),
    fork(EntityDataModelApiSagas.addSrcEntityTypeToAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.createAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.createEntityTypeWatcher),
    fork(EntityDataModelApiSagas.createPropertyTypeWatcher),
    fork(EntityDataModelApiSagas.createSchemaWatcher),
    fork(EntityDataModelApiSagas.deleteAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.deleteEntityTypeWatcher),
    fork(EntityDataModelApiSagas.deletePropertyTypeWatcher),
    fork(EntityDataModelApiSagas.getAllAssociationTypesWatcher),
    fork(EntityDataModelApiSagas.getAllEntityTypesWatcher),
    fork(EntityDataModelApiSagas.getAllPropertyTypesWatcher),
    fork(EntityDataModelApiSagas.getAllSchemasWatcher),
    fork(EntityDataModelApiSagas.getEntityDataModelDiffWatcher),
    fork(EntityDataModelApiSagas.getEntityDataModelVersionWatcher),
    fork(EntityDataModelApiSagas.removeDstEntityTypeFromAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.removePropertyTypeFromEntityTypeWatcher),
    fork(EntityDataModelApiSagas.removeSrcEntityTypeFromAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.reorderEntityTypePropertyTypesWatcher),
    fork(EntityDataModelApiSagas.updateAssociationTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updateEntityDataModelWatcher),
    fork(EntityDataModelApiSagas.updateEntityTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updatePropertyTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updateSchemaWatcher),

    // SyncSagas
    fork(SyncSagas.syncProdEntityDataModelWatcher),
  ];
}
