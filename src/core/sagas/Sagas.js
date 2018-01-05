/*
 * @flow
 */

import { AuthSagas } from 'lattice-auth';
import { EntityDataModelApiSagas } from 'lattice-sagas';
import { fork } from 'redux-saga/effects';

import * as AssociationTypesSagas from '../../containers/edm/associationtypes/AssociationTypesSagas';
import * as EntityTypesSagas from '../../containers/edm/entitytypes/EntityTypesSagas';

export default function* sagas() :Generator<*, *, *> {

  yield [
    // AuthSagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogin),
    fork(AuthSagas.watchLogout),

    // Lattice Sagas
    fork(EntityDataModelApiSagas.createAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.createEntityTypeWatcher),
    fork(EntityDataModelApiSagas.createPropertyTypeWatcher),
    fork(EntityDataModelApiSagas.deleteAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.deleteEntityTypeWatcher),
    fork(EntityDataModelApiSagas.deletePropertyTypeWatcher),
    fork(EntityDataModelApiSagas.getAllAssociationTypesWatcher),
    fork(EntityDataModelApiSagas.getAllEntityTypesWatcher),
    fork(EntityDataModelApiSagas.getAllPropertyTypesWatcher),
    fork(EntityDataModelApiSagas.updateAssociationTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updateEntityTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updatePropertyTypeMetaDataWatcher),

    // EntityTypesSagas
    fork(EntityTypesSagas.watchAddPropertyTypeToEntityType),
    fork(EntityTypesSagas.watchRemovePropertyTypeFromEntityType),

    // AssociationTypesSagas
    fork(AssociationTypesSagas.watchAddDestinationEntityTypeToAssociationType),
    fork(AssociationTypesSagas.watchAddSourceEntityTypeToAssociationType),
    fork(AssociationTypesSagas.watchRemoveDestinationEntityTypeFromAssociationType),
    fork(AssociationTypesSagas.watchRemoveSourceEntityTypeFromAssociationType)
  ];
}
