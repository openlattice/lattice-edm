/*
 * @flow
 */

import { AuthSagas } from 'lattice-auth';
import { EntityDataModelApiSagas } from 'lattice-sagas';
import { fork } from 'redux-saga/effects';

export default function* sagas() :Generator<*, *, *> {

  yield [
    // "lattice-auth" Sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" Sagas
    fork(EntityDataModelApiSagas.addDestinationEntityTypeToAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.addPropertyTypeToEntityTypeWatcher),
    fork(EntityDataModelApiSagas.addSourceEntityTypeToAssociationTypeWatcher),
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
    fork(EntityDataModelApiSagas.removeDestinationEntityTypeFromAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.removePropertyTypeFromEntityTypeWatcher),
    fork(EntityDataModelApiSagas.removeSourceEntityTypeFromAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.reorderEntityTypePropertyTypesWatcher),
    fork(EntityDataModelApiSagas.updateAssociationTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updateEntityTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updatePropertyTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updateSchemaWatcher)
  ];
}
