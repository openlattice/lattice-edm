/*
 * @flow
 */

import { List, Map } from 'immutable';

import type { AbstractType } from '../../utils/AbstractTypes';

type IndexMap = Map<FQN, number>;

type AbstractTypeOverviewContainerProps = {
  associationTypes :List<Map<*, *>>;
  associationTypesById :Map<string, number>;
  entityTypes :List<Map<*, *>>;
  entityTypesById :Map<string, number>;
  isFetchingEntityDataModel :boolean;
  newlyCreatedAssociationTypeId :UUID; // eslint-disable-line react/no-unused-prop-types
  newlyCreatedEntityTypeId :UUID; // eslint-disable-line react/no-unused-prop-types
  newlyCreatedPropertyTypeFQN :FQN; // eslint-disable-line react/no-unused-prop-types
  propertyTypes :List<Map<*, *>>;
  propertyTypesIndexMap :IndexMap;
  schemas :List<Map<*, *>>;
  schemasByFqn :Map<string, number>;
  workingAbstractTypeType :AbstractType;
};

type AbstractTypeOverviewContainerState = {
  filterQuery :string;
  filteredTypes :List<Map<*, *>>;
  selectedAbstractType :Map<*, *>;
  selectedAbstractTypeFQN :FQN;
  showCreateNewAbstractTypeCard :boolean;
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
  UpdatePropertyTypeMeta,
};
