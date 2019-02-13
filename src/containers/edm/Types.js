/*
 * @flow
 */

import { List, Map } from 'immutable';
import type { FQN } from 'lattice';

import type { AbstractType } from '../../utils/AbstractTypes';

type IndexMap = Map<FQN | UUID, number>;

type AbstractTypeOverviewContainerProps = {
  associationTypes :List<Map<*, *>>;
  associationTypesIndexMap :IndexMap;
  entityTypes :List<Map<*, *>>;
  entityTypesIndexMap :IndexMap;
  isFetchingEntityDataModel :boolean;
  newlyCreatedAssociationTypeFQN :FQN;
  newlyCreatedEntityTypeFQN :FQN;
  newlyCreatedPropertyTypeFQN :FQN;
  newlyCreatedSchemaFQN :FQN;
  propertyTypes :List<Map<*, *>>;
  propertyTypesIndexMap :IndexMap;
  schemas :List<Map<*, *>>;
  schemasIndexMap :IndexMap;
  workingAbstractTypeType :AbstractType;
};

type AbstractTypeOverviewContainerState = {
  filterQuery :string;
  selectedAbstractTypeFQN :?FQN;
  showCreateNewAbstractTypeCard :boolean;
};

type UpdateAssociationTypeMeta = {
  associationTypeFQN :FQN;
  associationTypeId :?UUID;
  metadata :Object;
};

type UpdateEntityTypeMeta = {
  entityTypeFQN :FQN;
  entityTypeId :?UUID;
  metadata :Object;
};

type UpdatePropertyTypeMeta = {
  metadata :Object;
  propertyTypeFQN :FQN;
  propertyTypeId :?UUID;
};

export type {
  AbstractTypeOverviewContainerProps,
  AbstractTypeOverviewContainerState,
  IndexMap,
  UpdateAssociationTypeMeta,
  UpdateEntityTypeMeta,
  UpdatePropertyTypeMeta,
};
