/*
 * @flow
 */

import { newRequestSequence } from '../../../core/redux/RequestSequence';

import type { RequestSequence } from '../../../core/redux/RequestSequence';

const ADD_DST_ET_TO_AT :'ADD_DST_ET_TO_AT' = 'ADD_DST_ET_TO_AT';
const addDestinationEntityTypeToAssociationType :RequestSequence = newRequestSequence(ADD_DST_ET_TO_AT);

const ADD_SRC_ET_TO_AT :'ADD_SRC_ET_TO_AT' = 'ADD_SRC_ET_TO_AT';
const addSourceEntityTypeToAssociationType :RequestSequence = newRequestSequence(ADD_SRC_ET_TO_AT);

const RM_DST_ET_FROM_AT :'RM_DST_ET_FROM_AT' = 'RM_DST_ET_FROM_AT';
const removeDestinationEntityTypeFromAssociationType :RequestSequence = newRequestSequence(RM_DST_ET_FROM_AT);

const RM_SRC_ET_FROM_AT :'RM_SRC_ET_FROM_AT' = 'RM_SRC_ET_FROM_AT';
const removeSourceEntityTypeFromAssociationType :RequestSequence = newRequestSequence(RM_SRC_ET_FROM_AT);

export {
  ADD_DST_ET_TO_AT,
  ADD_SRC_ET_TO_AT,
  RM_DST_ET_FROM_AT,
  RM_SRC_ET_FROM_AT
};

export {
  addDestinationEntityTypeToAssociationType,
  addSourceEntityTypeToAssociationType,
  removeDestinationEntityTypeFromAssociationType,
  removeSourceEntityTypeFromAssociationType
};
