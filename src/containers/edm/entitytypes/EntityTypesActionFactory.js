/*
 * @flow
 */

import { newRequestSequence } from '../../../core/redux/RequestSequence';

import type { RequestSequence } from '../../../core/redux/RequestSequence';

const ADD_PROPERTY_TYPE_TO_ENTITY_TYPE :'ADD_PROPERTY_TYPE_TO_ENTITY_TYPE' = 'ADD_PROPERTY_TYPE_TO_ENTITY_TYPE';
const addPropertyTypeToEntityType :RequestSequence = newRequestSequence(ADD_PROPERTY_TYPE_TO_ENTITY_TYPE);

const RM_PROPERTY_TYPE_FROM_ENTITY_TYPE :'RM_PROPERTY_TYPE_FROM_ENTITY_TYPE' = 'RM_PROPERTY_TYPE_FROM_ENTITY_TYPE';
const removePropertyTypeFromEntityType :RequestSequence = newRequestSequence(RM_PROPERTY_TYPE_FROM_ENTITY_TYPE);

export {
  ADD_PROPERTY_TYPE_TO_ENTITY_TYPE,
  RM_PROPERTY_TYPE_FROM_ENTITY_TYPE
};

export {
  addPropertyTypeToEntityType,
  removePropertyTypeFromEntityType
};
