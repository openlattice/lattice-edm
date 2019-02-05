/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOCAL_CREATE_ENTITY_TYPE :'LOCAL_CREATE_ENTITY_TYPE' = 'LOCAL_CREATE_ENTITY_TYPE';
const localCreateEntityType :RequestSequence = newRequestSequence(LOCAL_CREATE_ENTITY_TYPE);

const LOCAL_DELETE_ENTITY_TYPE :'LOCAL_DELETE_ENTITY_TYPE' = 'LOCAL_DELETE_ENTITY_TYPE';
const localDeleteEntityType :RequestSequence = newRequestSequence(LOCAL_DELETE_ENTITY_TYPE);

const LOCAL_UPDATE_ENTITY_TYPE_META :'LOCAL_UPDATE_ENTITY_TYPE_META' = 'LOCAL_UPDATE_ENTITY_TYPE_META';
const localUpdateEntityTypeMeta :RequestSequence = newRequestSequence(LOCAL_UPDATE_ENTITY_TYPE_META);

export {
  LOCAL_CREATE_ENTITY_TYPE,
  LOCAL_DELETE_ENTITY_TYPE,
  LOCAL_UPDATE_ENTITY_TYPE_META,
  localCreateEntityType,
  localDeleteEntityType,
  localUpdateEntityTypeMeta,
};
