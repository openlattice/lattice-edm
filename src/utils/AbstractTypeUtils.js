/*
 * @flow
 */

import { List, Map } from 'immutable';
import { Models } from 'lattice';
import type { FQN } from 'lattice';

import AbstractTypes from './AbstractTypes';
import Logger from './Logger';
import type { AbstractType } from './AbstractTypes';
import type { AbstractTypeOverviewContainerProps } from '../containers/edm/Types';

const LOG :Logger = new Logger('AbstractTypeUtils');
const { FullyQualifiedName } = Models;

type GetWorkingAbstractTypesParams = {
  associationTypes :List<Map<*, *>>;
  entityTypes :List<Map<*, *>>;
  propertyTypes :List<Map<*, *>>;
  schemas :List<Map<*, *>>;
  workingAbstractTypeType :AbstractType;
};

function getWorkingAbstractTypes(params :GetWorkingAbstractTypesParams) :List<Map<*, *>> {

  switch (params.workingAbstractTypeType) {
    case AbstractTypes.AssociationType:
      return params.associationTypes || List();
    case AbstractTypes.EntityType:
      return params.entityTypes || List();
    case AbstractTypes.PropertyType:
      return params.propertyTypes || List();
    case AbstractTypes.Schema:
      return params.schemas || List();
    default:
      return List();
  }
}

type FilterAbstractTypesParams = {
  abstractTypes :List<Map<*, *>>;
  filterQuery :string;
  workingAbstractTypeType :AbstractType;
};

function filterAbstractTypes(params :FilterAbstractTypesParams) :List<Map<*, *>> {

  const {
    abstractTypes,
    filterQuery,
    workingAbstractTypeType
  } = params;

  return abstractTypes.filter((workingAbstractType :Map<*, *>) => {

    const abstractType :Map<*, *> = (workingAbstractTypeType === AbstractTypes.AssociationType)
      ? workingAbstractType.get('entityType', Map())
      : workingAbstractType;

    const abstractTypeId :?string = abstractType.get('id', '');
    const abstractTypeType :Map<string, string> = abstractType.get('type', Map());
    const abstractTypeFQN :string = (workingAbstractTypeType === AbstractTypes.Schema)
      ? FullyQualifiedName.toString(abstractType.get('fqn', Map())).toLowerCase()
      : FullyQualifiedName.toString(abstractTypeType).toLowerCase();
    const abstractTypeTitle :string = abstractType.get('title', '').toLowerCase();
    const abstractTypeDescription :string = abstractType.get('description', '').toLowerCase();

    let includeAbstractType :boolean = true;
    if (filterQuery && filterQuery.trim()) {
      const filterTrimLowerCase :string = filterQuery.trim().toLowerCase();
      const matchesId :boolean = !!abstractTypeId && abstractTypeId.includes(filterTrimLowerCase);
      const matchesFQN :boolean = abstractTypeFQN.includes(filterTrimLowerCase);
      const matchesTitle :boolean = abstractTypeTitle.includes(filterTrimLowerCase);
      const matchesDescription :boolean = abstractTypeDescription.includes(filterTrimLowerCase);
      if (!matchesId && !matchesFQN && !matchesTitle && !matchesDescription) {
        includeAbstractType = false;
      }
    }

    return includeAbstractType;
  });
}

function maybeGetAbstractTypeMatchingFQN(
  abstractTypeFQN :?FQN,
  props :AbstractTypeOverviewContainerProps,
) :?Map<*, *> {

  const {
    associationTypes,
    associationTypesIndexMap,
    entityTypes,
    entityTypesIndexMap,
    propertyTypes,
    propertyTypesIndexMap,
    schemas,
    schemasIndexMap,
    workingAbstractTypeType,
  } = props;

  let abstractTypeIndex :number;
  switch (workingAbstractTypeType) {
    case AbstractTypes.AssociationType: {
      if (FullyQualifiedName.isValid(abstractTypeFQN)) {
        abstractTypeIndex = associationTypesIndexMap.get(abstractTypeFQN, -1);
        if (abstractTypeIndex !== -1) {
          return associationTypes.get(abstractTypeIndex, Map());
        }
      }
      break;
    }
    case AbstractTypes.EntityType: {
      if (FullyQualifiedName.isValid(abstractTypeFQN)) {
        abstractTypeIndex = entityTypesIndexMap.get(abstractTypeFQN, -1);
        if (abstractTypeIndex !== -1) {
          return entityTypes.get(abstractTypeIndex, Map());
        }
      }
      break;
    }
    case AbstractTypes.PropertyType: {
      if (FullyQualifiedName.isValid(abstractTypeFQN)) {
        abstractTypeIndex = propertyTypesIndexMap.get(abstractTypeFQN, -1);
        if (abstractTypeIndex !== -1) {
          return propertyTypes.get(abstractTypeIndex, Map());
        }
      }
      break;
    }
    case AbstractTypes.Schema: {
      if (FullyQualifiedName.isValid(abstractTypeFQN)) {
        abstractTypeIndex = schemasIndexMap.get(abstractTypeFQN, -1);
        if (abstractTypeIndex !== -1) {
          return schemas.get(abstractTypeIndex, Map());
        }
      }
      break;
    }
    default:
      LOG.error('invalid abstract type', workingAbstractTypeType);
      break;
  }

  return undefined;
}

function maybeGetNewlyCreatedAbstractTypeFQN(
  prevProps :AbstractTypeOverviewContainerProps,
  nextProps :AbstractTypeOverviewContainerProps,
) :?FQN {

  let nextFQN :?FQN;
  let prevFQN :?FQN;

  switch (nextProps.workingAbstractTypeType) {
    case AbstractTypes.AssociationType: {
      prevFQN = prevProps.newlyCreatedAssociationTypeFQN;
      nextFQN = nextProps.newlyCreatedAssociationTypeFQN;
      break;
    }
    case AbstractTypes.EntityType: {
      prevFQN = prevProps.newlyCreatedEntityTypeFQN;
      nextFQN = nextProps.newlyCreatedEntityTypeFQN;
      break;
    }
    case AbstractTypes.PropertyType: {
      prevFQN = prevProps.newlyCreatedPropertyTypeFQN;
      nextFQN = nextProps.newlyCreatedPropertyTypeFQN;
      break;
    }
    case AbstractTypes.Schema: {
      prevFQN = prevProps.newlyCreatedSchemaFQN;
      nextFQN = nextProps.newlyCreatedSchemaFQN;
      break;
    }
    default:
      LOG.error('invalid abstract type', nextProps.workingAbstractTypeType);
      return undefined;
  }

  // to decide if the newly created abstract type fqn should be used, we have to check for two conditions:
  //   1. "SUCCESS" sets the new fqn value, previous fqn value is empty
  //   2. "FINALLY" clears the new fqn value, previous fqn value is not empty since it was set by "SUCCESS"
  if (FullyQualifiedName.isValid(nextFQN) && !FullyQualifiedName.isValid(prevFQN)) {
    // "SUCCESS" action
    return nextFQN;
  }

  if (!FullyQualifiedName.isValid(nextFQN) && FullyQualifiedName.isValid(prevFQN)) {
    // "FINALLY" action
    return prevFQN;
  }

  return undefined;
}

export {
  filterAbstractTypes,
  getWorkingAbstractTypes,
  maybeGetAbstractTypeMatchingFQN,
  maybeGetNewlyCreatedAbstractTypeFQN,
};

export type {
  GetWorkingAbstractTypesParams,
  FilterAbstractTypesParams,
};
