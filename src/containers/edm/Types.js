/*
 * @flow
 */

import { List, Map } from 'immutable';
import type { FQN } from 'lattice';

import type { AbstractType } from '../../utils/AbstractTypes';

type IndexMap = Map<FQN | UUID, number>;

type AbstractTypeOverviewContainerProps = {
  associationTypes :List<Map<*, *>>;
  associationTypesById :Map<string, number>;
  entityTypes :List<Map<*, *>>;
  entityTypesIndexMap :IndexMap;
  isFetchingEntityDataModel :boolean;
  newlyCreatedAssociationTypeId :UUID; // eslint-disable-line react/no-unused-prop-types
  newlyCreatedEntityTypeFQN :FQN; // eslint-disable-line react/no-unused-prop-types
  newlyCreatedPropertyTypeFQN :FQN; // eslint-disable-line react/no-unused-prop-types
  propertyTypes :List<Map<*, *>>;
  propertyTypesIndexMap :IndexMap;
  schemas :List<Map<*, *>>;
  schemasByFqn :Map<string, number>;
  workingAbstractTypeType :AbstractType;
};

type AbstractTypeOverviewContainerState = {
  filterQuery :string;
  selectedAbstractTypeFQN :?FQN;
  showCreateNewAbstractTypeCard :boolean;
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
  UpdateEntityTypeMeta,
  UpdatePropertyTypeMeta,
};
