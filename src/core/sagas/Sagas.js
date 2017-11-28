/*
 * @flow
 */

import { EntityDataModelApiSagas } from 'lattice-sagas';
import { fork } from 'redux-saga/effects';

import * as AuthSagas from '../auth/AuthSagas';
import * as AssociationTypesSagas from '../../containers/edm/associationtypes/AssociationTypesSagas';
import * as EntityTypesSagas from '../../containers/edm/entitytypes/EntityTypesSagas';
import * as PropertyTypesSagas from '../../containers/edm/propertytypes/PropertyTypesSagas';

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
    fork(EntityDataModelApiSagas.getAllAssociationTypesWatcher),
    fork(EntityDataModelApiSagas.getAllEntityTypesWatcher),
    fork(EntityDataModelApiSagas.getAllPropertyTypesWatcher),

    // PropertyTypesSagas
    fork(PropertyTypesSagas.watchCreatePropertyTypeRequest),
    fork(PropertyTypesSagas.watchDeletePropertyTypeRequest),
    fork(PropertyTypesSagas.watchUpdatePropertyTypeMetaDataRequest),

    // EntityTypesSagas
    fork(EntityTypesSagas.watchAddPropertyTypeToEntityType),
    fork(EntityTypesSagas.watchCreateEntityTypeRequest),
    fork(EntityTypesSagas.watchDeleteEntityTypeRequest),
    fork(EntityTypesSagas.watchRemovePropertyTypeFromEntityType),
    fork(EntityTypesSagas.watchUpdateEntityTypeMetaDataRequest),

    // AssociationTypesSagas
    fork(AssociationTypesSagas.watchAddDestinationEntityTypeToAssociationType),
    fork(AssociationTypesSagas.watchAddSourceEntityTypeToAssociationType),
    fork(AssociationTypesSagas.watchCreateAssociationTypeRequest),
    fork(AssociationTypesSagas.watchDeleteAssociationTypeRequest),
    fork(AssociationTypesSagas.watchRemoveDestinationEntityTypeFromAssociationType),
    fork(AssociationTypesSagas.watchRemoveSourceEntityTypeFromAssociationType),
    fork(AssociationTypesSagas.watchUpdateAssociationTypeMetaDataRequest)
  ];
}
