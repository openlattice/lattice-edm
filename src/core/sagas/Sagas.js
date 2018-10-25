/*
 * @flow
 */

import { AuthSagas } from 'lattice-auth';
import { EntityDataModelApiSagas } from 'lattice-sagas';
import { all, fork } from 'redux-saga/effects';

import * as GitHubSagas from '../../containers/github/GitHubSagas';
import * as SyncSagas from '../../containers/sync/SyncSagas';

// injected by Webpack.DefinePlugin
declare var __ENV_PROD__ :boolean;

export default function* sagas() :Generator<*, *, *> {

  const required = [
    // "lattice-auth" Sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" Sagas
    fork(EntityDataModelApiSagas.getEntityDataModelWatcher),

    // SyncSagas
    fork(SyncSagas.syncProdEntityDataModelWatcher),
  ];

  const optional = [
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

    // GitHubSagas
    fork(GitHubSagas.openPullRequestWatcher),
  ];

  if (__ENV_PROD__) {
    yield all(required);
  }
  else {
    yield all([
      ...required,
      ...optional,
    ]);
  }
}
