/*
 * @flow
 */

import { List, Map } from 'immutable';
import { Models } from 'lattice';

import AbstractTypes from './AbstractTypes';
import type { AbstractType } from './AbstractTypes';

const { FullyQualifiedName } = Models;

type Params = {
  associationTypes :?List<Map<*, *>>;
  entityTypes :?List<Map<*, *>>;
  propertyTypes :?List<Map<*, *>>;
  schemas :?List<Map<*, *>>;
  workingAbstractTypeType :AbstractType;
};

export function getWorkingAbstractTypes(params :Params) :List<Map<*, *>> {

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
      ? workingAbstractType.get('entityType', Map())
      : workingAbstractType;

    const abstractTypeId :string = abstractType.get('id', '');
    const abstractTypeType :Map<string, string> = abstractType.get('type', Map());
    const abstractTypeFqn :string = (workingAbstractTypeType === AbstractTypes.Schema)
      ? FullyQualifiedName.toString(abstractType.get('fqn', Map())).toLowerCase()
      : FullyQualifiedName.toString(abstractTypeType).toLowerCase();
    const abstractTypeTitle :string = abstractType.get('title', '').toLowerCase();

    let includeAbstractType :boolean = true;
    if (filterQuery && filterQuery.trim()) {
      const filterTrimLowerCase :string = filterQuery.trim().toLowerCase();
      const matchesId :boolean = abstractTypeId.includes(filterTrimLowerCase);
      const matchesFqn :boolean = abstractTypeFqn.includes(filterTrimLowerCase);
      const matchesTitle :boolean = abstractTypeTitle.includes(filterTrimLowerCase);
      if (!matchesId && !matchesFqn && !matchesTitle) {
        includeAbstractType = false;
      }
    }

    return includeAbstractType;
  });
}
