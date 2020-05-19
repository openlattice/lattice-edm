/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { EntityDataModelApiSagas } from 'lattice-sagas';

import * as AssociationTypesSagas from '../../containers/edm/associationtypes/AssociationTypesSagas';
import * as EntityTypesSagas from '../../containers/edm/entitytypes/EntityTypesSagas';
import * as GitHubSagas from '../../containers/github/GitHubSagas';
import * as PropertyTypesSagas from '../../containers/edm/propertytypes/PropertyTypesSagas';
import * as SchemasSagas from '../../containers/edm/schemas/SchemasSagas';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" sagas
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
    fork(EntityDataModelApiSagas.getEntityDataModelWatcher),
    fork(EntityDataModelApiSagas.removeDestinationEntityTypeFromAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.removePropertyTypeFromEntityTypeWatcher),
    fork(EntityDataModelApiSagas.removeSourceEntityTypeFromAssociationTypeWatcher),
    fork(EntityDataModelApiSagas.updateAssociationTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updateEntityTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updatePropertyTypeMetaDataWatcher),
    fork(EntityDataModelApiSagas.updateSchemaWatcher),

    // AssociationTypesSagas
    fork(AssociationTypesSagas.localAddDstEntityTypeToAssociationTypeWatcher),
    fork(AssociationTypesSagas.localAddPropertyTypeToAssociationTypeWatcher),
    fork(AssociationTypesSagas.localAddSrcEntityTypeToAssociationTypeWatcher),
    fork(AssociationTypesSagas.localCreateAssociationTypeWatcher),
    fork(AssociationTypesSagas.localDeleteAssociationTypeWatcher),
    fork(AssociationTypesSagas.localRemoveDstEntityTypeFromAssociationTypeWatcher),
    fork(AssociationTypesSagas.localRemovePropertyTypeFromAssociationTypeWatcher),
    fork(AssociationTypesSagas.localRemoveSrcEntityTypeFromAssociationTypeWatcher),
    fork(AssociationTypesSagas.localUpdateAssociationTypeMetaWatcher),

    // EntityTypesSagas
    fork(EntityTypesSagas.localAddPropertyTypeToEntityTypeWatcher),
    fork(EntityTypesSagas.localCreateEntityTypeWatcher),
    fork(EntityTypesSagas.localDeleteEntityTypeWatcher),
    fork(EntityTypesSagas.localRemovePropertyTypeFromEntityTypeWatcher),
    fork(EntityTypesSagas.localUpdateEntityTypeMetaWatcher),

    // GitHubSagas
    fork(GitHubSagas.openPullRequestWatcher),

    // PropertyTypesSagas
    fork(PropertyTypesSagas.localCreatePropertyTypeWatcher),
    fork(PropertyTypesSagas.localDeletePropertyTypeWatcher),
    fork(PropertyTypesSagas.localUpdatePropertyTypeMetaWatcher),

    // SchemasSagas
    fork(SchemasSagas.localCreateSchemaWatcher),
    fork(SchemasSagas.localUpdateSchemaWatcher),
  ]);
}
