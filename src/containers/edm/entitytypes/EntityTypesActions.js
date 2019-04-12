/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOCAL_ADD_PT_TO_ET :'LOCAL_ADD_PT_TO_ET' = 'LOCAL_ADD_PT_TO_ET';
const localAddPropertyTypeToEntityType :RequestSequence = newRequestSequence(LOCAL_ADD_PT_TO_ET);

const LOCAL_CREATE_ENTITY_TYPE :'LOCAL_CREATE_ENTITY_TYPE' = 'LOCAL_CREATE_ENTITY_TYPE';
const localCreateEntityType :RequestSequence = newRequestSequence(LOCAL_CREATE_ENTITY_TYPE);

const LOCAL_DELETE_ENTITY_TYPE :'LOCAL_DELETE_ENTITY_TYPE' = 'LOCAL_DELETE_ENTITY_TYPE';
const localDeleteEntityType :RequestSequence = newRequestSequence(LOCAL_DELETE_ENTITY_TYPE);

const LOCAL_REMOVE_PT_FROM_ET :'LOCAL_REMOVE_PT_FROM_ET' = 'LOCAL_REMOVE_PT_FROM_ET';
const localRemovePropertyTypeFromEntityType :RequestSequence = newRequestSequence(LOCAL_REMOVE_PT_FROM_ET);

const LOCAL_UPDATE_ENTITY_TYPE_META :'LOCAL_UPDATE_ENTITY_TYPE_META' = 'LOCAL_UPDATE_ENTITY_TYPE_META';
const localUpdateEntityTypeMeta :RequestSequence = newRequestSequence(LOCAL_UPDATE_ENTITY_TYPE_META);

export {
  LOCAL_ADD_PT_TO_ET,
  LOCAL_CREATE_ENTITY_TYPE,
  LOCAL_DELETE_ENTITY_TYPE,
  LOCAL_REMOVE_PT_FROM_ET,
  LOCAL_UPDATE_ENTITY_TYPE_META,
  localAddPropertyTypeToEntityType,
  localCreateEntityType,
  localDeleteEntityType,
  localRemovePropertyTypeFromEntityType,
  localUpdateEntityTypeMeta,
};
