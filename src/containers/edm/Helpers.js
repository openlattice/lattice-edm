/*
 * @flow
 */

import isEmpty from 'lodash/isEmpty';
import { Map } from 'immutable';

import AbstractTypes from '../../utils/AbstractTypes';

import type { AbstractTypeOverviewContainerProps } from './Types';

function maybeGetAbstractTypeFQNForNewlyCreatedAbstractType(
  selectedAbstractTypeFQN :FQN,
  prevProps :AbstractTypeOverviewContainerProps,
  nextProps :AbstractTypeOverviewContainerProps,
) :FQN {

  let nextFQN :FQN;
  let prevFQN :FQN;

  switch (nextProps.workingAbstractTypeType) {
    case AbstractTypes.AssociationType: {
      nextFQN = nextProps.newlyCreatedAssociationTypeFQN;
      prevFQN = prevProps.newlyCreatedAssociationTypeFQN;
      break;
    }
    case AbstractTypes.EntityType: {
      nextFQN = nextProps.newlyCreatedEntityTypeFQN;
      prevFQN = prevProps.newlyCreatedEntityTypeFQN;
      break;
    }
    case AbstractTypes.PropertyType: {
      nextFQN = nextProps.newlyCreatedPropertyTypeFQN;
      prevFQN = prevProps.newlyCreatedPropertyTypeFQN;
      break;
    }
    case AbstractTypes.Schema: {
      // TODO: implement me!!!
      return selectedAbstractTypeFQN;
    }
    default:
      // shouldn't be possible
      return selectedAbstractTypeFQN;
  }

  // to decide if the newly created abstract type fqn should be used, we have to check for two conditions:
  //   1. "SUCCESS" sets the new fqn value, previous fqn value is empty
  //   2. "FINALLY" clears the new fqn value, previous fqn value is not empty since it was set by "SUCCESS"
  if (nextFQN !== prevFQN) {
    // "SUCCESS" action
    if (!isEmpty(nextFQN) && isEmpty(prevFQN)) {
      return nextFQN;
    }
    // "FINALLY" action
    if (isEmpty(nextFQN) && !isEmpty(prevFQN)) {
      return prevFQN;
    }
  }

  return selectedAbstractTypeFQN;
}

function maybeGetAbstractTypeMatchingSelectedAbstractTypeFQN(
  selectedAbstractType :Map<*, *>,
  selectedAbstractTypeFQN :FQN,
  nextProps :AbstractTypeOverviewContainerProps
) :Map<*, *> {

  const {
    associationTypes,
    associationTypesById,
    entityTypes,
    entityTypesById,
    propertyTypes,
    propertyTypesIndexMap,
    schemas,
    schemasByFqn,
    workingAbstractTypeType
  } = nextProps;

  let selectedAbstractTypeIndex :number;
  switch (workingAbstractTypeType) {
    case AbstractTypes.AssociationType: {
      if (selectedAbstractTypeFQN) {
        selectedAbstractTypeIndex = associationTypesById.get(selectedAbstractTypeFQN, -1);
        if (selectedAbstractTypeIndex !== -1) {
          return associationTypes.get(selectedAbstractTypeIndex, Map());
        }
      }
      break;
    }
    case AbstractTypes.EntityType: {
      if (selectedAbstractTypeFQN) {
        selectedAbstractTypeIndex = entityTypesById.get(selectedAbstractTypeFQN, -1);
        if (selectedAbstractTypeIndex !== -1) {
          return entityTypes.get(selectedAbstractTypeIndex, Map());
        }
      }
      break;
    }
    case AbstractTypes.PropertyType: {
      if (selectedAbstractTypeFQN) {
        selectedAbstractTypeIndex = propertyTypesIndexMap.get(selectedAbstractTypeFQN, -1);
        if (selectedAbstractTypeIndex !== -1) {
          return propertyTypes.get(selectedAbstractTypeIndex, Map());
        }
      }
      break;
    }
    case AbstractTypes.Schema: {
      if (selectedAbstractTypeFQN) {
        selectedAbstractTypeIndex = schemasByFqn.get(selectedAbstractTypeFQN, -1);
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
  maybeGetAbstractTypeFQNForNewlyCreatedAbstractType,
  maybeGetAbstractTypeMatchingSelectedAbstractTypeFQN,
};
