/*
 * @flow
 */

import isEmpty from 'lodash/isEmpty';
import { Map } from 'immutable';

import AbstractTypes from '../../utils/AbstractTypes';

import type { AbstractTypeOverviewContainerProps } from './Types';

function maybeGetAbstractTypeIdForNewlyCreatedAbstractType(
  selectedAbstractTypeId :string,
  prevProps :AbstractTypeOverviewContainerProps,
  nextProps :AbstractTypeOverviewContainerProps
) :string {

  let prevId;
  let nextId;

  switch (nextProps.workingAbstractTypeType) {
    case AbstractTypes.AssociationType: {
      nextId = nextProps.newlyCreatedAssociationTypeId;
      prevId = prevProps.newlyCreatedAssociationTypeId;
      break;
    }
    case AbstractTypes.EntityType: {
      nextId = nextProps.newlyCreatedEntityTypeId;
      prevId = prevProps.newlyCreatedEntityTypeId;
      break;
    }
    case AbstractTypes.PropertyType: {
      nextId = nextProps.newlyCreatedPropertyTypeId;
      prevId = prevProps.newlyCreatedPropertyTypeId;
      break;
    }
    case AbstractTypes.Schema: {
      // TODO: implement me!!!
      return selectedAbstractTypeId;
    }
    default:
      // shouldn't be possible
      return selectedAbstractTypeId;
  }

  // to decide if the newly created abstract type id should be used, we have to check for two conditions:
  //   1. "SUCCESS" sets the new id value, previous id value is empty
  //   2. "FINALLY" clears the new id value, previous id value is not empty since it was set by "SUCCESS"
  if (nextId !== prevId) {
    // "SUCCESS" action
    if (!isEmpty(nextId) && isEmpty(prevId)) {
      return nextId;
    }
    // "FINALLY" action
    if (isEmpty(nextId) && !isEmpty(prevId)) {
      return prevId;
    }
  }

  return selectedAbstractTypeId;
}

function maybeGetAbstractTypeMatchingSelectedAbstractTypeId(
  selectedAbstractType :Map<*, *>,
  selectedAbstractTypeId :string,
  nextProps :AbstractTypeOverviewContainerProps
) :Map<*, *> {

  const {
    associationTypes,
    associationTypesById,
    entityTypes,
    entityTypesById,
    propertyTypes,
    propertyTypesById,
    schemas,
    schemasByFqn,
    workingAbstractTypeType
  } = nextProps;

  let selectedAbstractTypeIndex :number;
  switch (workingAbstractTypeType) {
    case AbstractTypes.AssociationType: {
      if (selectedAbstractTypeId) {
        selectedAbstractTypeIndex = associationTypesById.get(selectedAbstractTypeId, -1);
        if (selectedAbstractTypeIndex !== -1) {
          return associationTypes.get(selectedAbstractTypeIndex, Map());
        }
      }
      break;
    }
    case AbstractTypes.EntityType: {
      if (selectedAbstractTypeId) {
        selectedAbstractTypeIndex = entityTypesById.get(selectedAbstractTypeId, -1);
        if (selectedAbstractTypeIndex !== -1) {
          return entityTypes.get(selectedAbstractTypeIndex, Map());
        }
      }
      break;
    }
    case AbstractTypes.PropertyType: {
      if (selectedAbstractTypeId) {
        selectedAbstractTypeIndex = propertyTypesById.get(selectedAbstractTypeId, -1);
        if (selectedAbstractTypeIndex !== -1) {
          return propertyTypes.get(selectedAbstractTypeIndex, Map());
        }
      }
      break;
    }
    case AbstractTypes.Schema: {
      if (selectedAbstractTypeId) {
        selectedAbstractTypeIndex = schemasByFqn.get(selectedAbstractTypeId, -1);
        if (selectedAbstractTypeIndex !== -1) {
          return schemas.get(selectedAbstractTypeIndex, Map());
        }
      }
      break;
    }
    default:
      break;
  }

  return selectedAbstractType;
}

export {
  maybeGetAbstractTypeIdForNewlyCreatedAbstractType,
  maybeGetAbstractTypeMatchingSelectedAbstractTypeId
};
