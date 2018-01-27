/*
 * @flow
 */
import Immutable from 'immutable';
import { Models } from 'lattice';

import AbstractTypes from './AbstractTypes';
import type { AbstractType } from './AbstractTypes';

const { FullyQualifiedName } = Models;

type Params = {
  workingAbstractTypeType :AbstractType,
  associationTypes :?List<Map<*, *>>,
  entityTypes :?List<Map<*, *>>,
  propertyTypes :?List<Map<*, *>>
}

export function getWorkingAbstractTypes(params :Params) :List<Map<*, *>> {

  switch (params.workingAbstractTypeType) {
    case AbstractTypes.AssociationType:
      return params.associationTypes || Immutable.List();
    case AbstractTypes.EntityType:
      return params.entityTypes || Immutable.List();
    case AbstractTypes.PropertyType:
      return params.propertyTypes || Immutable.List();
    default:
      return Immutable.List();
  }
}

export type AbstractTypeFilterParams = {
  abstractTypes :List<Map<*, *>>,
  filterQuery :string,
  workingAbstractTypeType :AbstractType
}

export function filterAbstractTypes(params :AbstractTypeFilterParams) :List<Map<*, *>> {

  const {
    abstractTypes,
    filterQuery,
    workingAbstractTypeType
  } = params;

  return abstractTypes.filter((workingAbstractType :Map<*, *>) => {

    const abstractType :Map<*, *> = (workingAbstractTypeType === AbstractTypes.AssociationType)
      ? workingAbstractType.get('entityType', Immutable.Map())
      : workingAbstractType;

    const abstractTypeId :string = abstractType.get('id', '');
    const abstractTypeType :Map<string, string> = abstractType.get('type', Immutable.Map());
    const abstractTypeFqn :string = FullyQualifiedName.toString(abstractTypeType).toLowerCase();
    const abstractTypeTitle :string = abstractType.get('title', '').toLowerCase();

    let includeAbstractType :boolean = true;
    if (filterQuery && filterQuery.trim()) {
      const matchesId :boolean = (abstractTypeId === filterQuery);
      const filterTrimLowerCase :string = filterQuery.trim().toLowerCase();
      const matchesFqn :boolean = abstractTypeFqn.includes(filterTrimLowerCase);
      const matchesTitle :boolean = abstractTypeTitle.includes(filterTrimLowerCase);
      if (!matchesId && !matchesFqn && !matchesTitle) {
        includeAbstractType = false;
      }
    }

    return includeAbstractType;
  });
}
