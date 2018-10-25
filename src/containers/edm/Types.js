/*
 * @flow
 */

import { List, Map } from 'immutable';

import type { AbstractType } from '../../utils/AbstractTypes';

export type AbstractTypeOverviewContainerProps = {
  associationTypes :List<Map<*, *>>;
  associationTypesById :Map<string, number>;
  entityTypes :List<Map<*, *>>;
  entityTypesById :Map<string, number>;
  isFetchingEntityDataModel :boolean;
  newlyCreatedAssociationTypeId :string; // eslint-disable-line react/no-unused-prop-types
  newlyCreatedEntityTypeId :string; // eslint-disable-line react/no-unused-prop-types
  newlyCreatedPropertyTypeId :string; // eslint-disable-line react/no-unused-prop-types
  propertyTypes :List<Map<*, *>>;
  propertyTypesById :Map<string, number>;
  schemas :List<Map<*, *>>;
  schemasByFqn :Map<string, number>;
  workingAbstractTypeType :AbstractType;
};

export type AbstractTypeOverviewContainerState = {
  filterQuery :string;
  filteredTypes :List<Map<*, *>>;
  selectedAbstractType :Map<*, *>;
  selectedAbstractTypeId :string;
  showCreateNewAbstractTypeCard :boolean;
};
