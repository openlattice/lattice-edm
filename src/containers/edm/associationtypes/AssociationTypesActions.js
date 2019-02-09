/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOCAL_ADD_PT_TO_AT :'LOCAL_ADD_PT_TO_AT' = 'LOCAL_ADD_PT_TO_AT';
const localAddPropertyTypeToAssociationType :RequestSequence = newRequestSequence(LOCAL_ADD_PT_TO_AT);

const LOCAL_ADD_SOURCE_ET_TO_AT :'LOCAL_ADD_SOURCE_ET_TO_AT' = 'LOCAL_ADD_SOURCE_ET_TO_AT';
const localAddSourceEntityTypeToAssociationType :RequestSequence = newRequestSequence(LOCAL_ADD_SOURCE_ET_TO_AT);

const LOCAL_CREATE_ASSOCIATION_TYPE :'LOCAL_CREATE_ASSOCIATION_TYPE' = 'LOCAL_CREATE_ASSOCIATION_TYPE';
const localCreateAssociationType :RequestSequence = newRequestSequence(LOCAL_CREATE_ASSOCIATION_TYPE);

const LOCAL_DELETE_ASSOCIATION_TYPE :'LOCAL_DELETE_ASSOCIATION_TYPE' = 'LOCAL_DELETE_ASSOCIATION_TYPE';
const localDeleteAssociationType :RequestSequence = newRequestSequence(LOCAL_DELETE_ASSOCIATION_TYPE);

const LOCAL_REMOVE_PT_FROM_AT :'LOCAL_REMOVE_PT_FROM_AT' = 'LOCAL_REMOVE_PT_FROM_AT';
const localRemovePropertyTypeFromAssociationType :RequestSequence = newRequestSequence(LOCAL_REMOVE_PT_FROM_AT);

const LOCAL_UPDATE_ASSOCIATION_TYPE_META :'LOCAL_UPDATE_ASSOCIATION_TYPE_META' = 'LOCAL_UPDATE_ASSOCIATION_TYPE_META';
const localUpdateAssociationTypeMeta :RequestSequence = newRequestSequence(LOCAL_UPDATE_ASSOCIATION_TYPE_META);

export {
  LOCAL_ADD_PT_TO_AT,
  LOCAL_ADD_SOURCE_ET_TO_AT,
  LOCAL_CREATE_ASSOCIATION_TYPE,
  LOCAL_DELETE_ASSOCIATION_TYPE,
  LOCAL_REMOVE_PT_FROM_AT,
  LOCAL_UPDATE_ASSOCIATION_TYPE_META,
  localAddPropertyTypeToAssociationType,
  localAddSourceEntityTypeToAssociationType,
  localCreateAssociationType,
  localDeleteAssociationType,
  localRemovePropertyTypeFromAssociationType,
  localUpdateAssociationTypeMeta,
};
