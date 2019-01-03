/*
 * @flow
 */

import { List, Map } from 'immutable';

import type { AbstractType } from '../../utils/AbstractTypes';

type IndexMap = Map<FQN | UUID, number>;

type AbstractTypeOverviewContainerProps = {
  associationTypes :List<Map<*, *>>;
  associationTypesById :Map<string, number>;
  entityTypes :List<Map<*, *>>;
  entityTypesById :Map<string, number>;
  isFetchingEntityDataModel :boolean;
  newlyCreatedAssociationTypeId :UUID; // eslint-disable-line react/no-unused-prop-types
  newlyCreatedEntityTypeId :UUID; // eslint-disable-line react/no-unused-prop-types
  newlyCreatedPropertyTypeId :FQN | UUID; // eslint-disable-line react/no-unused-prop-types
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
  selectedAbstractTypeId :FQN | UUID;
  showCreateNewAbstractTypeCard :boolean;
};

export type {
  AbstractTypeOverviewContainerProps,
  AbstractTypeOverviewContainerState,
  IndexMap,
};
