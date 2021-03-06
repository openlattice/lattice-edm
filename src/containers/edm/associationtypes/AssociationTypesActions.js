/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const LOCAL_ADD_DST_ET_TO_AT :'LOCAL_ADD_DST_ET_TO_AT' = 'LOCAL_ADD_DST_ET_TO_AT';
const localAddDstEntityTypeToAssociationType :RequestSequence = newRequestSequence(LOCAL_ADD_DST_ET_TO_AT);

const LOCAL_ADD_PT_TO_AT :'LOCAL_ADD_PT_TO_AT' = 'LOCAL_ADD_PT_TO_AT';
const localAddPropertyTypeToAssociationType :RequestSequence = newRequestSequence(LOCAL_ADD_PT_TO_AT);

const LOCAL_ADD_SRC_ET_TO_AT :'LOCAL_ADD_SRC_ET_TO_AT' = 'LOCAL_ADD_SRC_ET_TO_AT';
const localAddSrcEntityTypeToAssociationType :RequestSequence = newRequestSequence(LOCAL_ADD_SRC_ET_TO_AT);

const LOCAL_CREATE_ASSOCIATION_TYPE :'LOCAL_CREATE_ASSOCIATION_TYPE' = 'LOCAL_CREATE_ASSOCIATION_TYPE';
const localCreateAssociationType :RequestSequence = newRequestSequence(LOCAL_CREATE_ASSOCIATION_TYPE);

const LOCAL_DELETE_ASSOCIATION_TYPE :'LOCAL_DELETE_ASSOCIATION_TYPE' = 'LOCAL_DELETE_ASSOCIATION_TYPE';
const localDeleteAssociationType :RequestSequence = newRequestSequence(LOCAL_DELETE_ASSOCIATION_TYPE);

const LOCAL_REMOVE_DST_ET_FROM_AT :'LOCAL_REMOVE_DST_ET_FROM_AT' = 'LOCAL_REMOVE_DST_ET_FROM_AT';
const localRemoveDstEntityTypeFromAssociationType :RequestSequence = newRequestSequence(LOCAL_REMOVE_DST_ET_FROM_AT);

const LOCAL_REMOVE_PT_FROM_AT :'LOCAL_REMOVE_PT_FROM_AT' = 'LOCAL_REMOVE_PT_FROM_AT';
const localRemovePropertyTypeFromAssociationType :RequestSequence = newRequestSequence(LOCAL_REMOVE_PT_FROM_AT);

const LOCAL_REMOVE_SRC_ET_FROM_AT :'LOCAL_REMOVE_SRC_ET_FROM_AT' = 'LOCAL_REMOVE_SRC_ET_FROM_AT';
const localRemoveSrcEntityTypeFromAssociationType :RequestSequence = newRequestSequence(LOCAL_REMOVE_SRC_ET_FROM_AT);

const LOCAL_UPDATE_ASSOCIATION_TYPE_META :'LOCAL_UPDATE_ASSOCIATION_TYPE_META' = 'LOCAL_UPDATE_ASSOCIATION_TYPE_META';
const localUpdateAssociationTypeMeta :RequestSequence = newRequestSequence(LOCAL_UPDATE_ASSOCIATION_TYPE_META);

export {
  LOCAL_ADD_DST_ET_TO_AT,
  LOCAL_ADD_PT_TO_AT,
  LOCAL_ADD_SRC_ET_TO_AT,
  LOCAL_CREATE_ASSOCIATION_TYPE,
  LOCAL_DELETE_ASSOCIATION_TYPE,
  LOCAL_REMOVE_DST_ET_FROM_AT,
  LOCAL_REMOVE_PT_FROM_AT,
  LOCAL_REMOVE_SRC_ET_FROM_AT,
  LOCAL_UPDATE_ASSOCIATION_TYPE_META,
  localAddDstEntityTypeToAssociationType,
  localAddPropertyTypeToAssociationType,
  localAddSrcEntityTypeToAssociationType,
  localCreateAssociationType,
  localDeleteAssociationType,
  localRemoveDstEntityTypeFromAssociationType,
  localRemovePropertyTypeFromAssociationType,
  localRemoveSrcEntityTypeFromAssociationType,
  localUpdateAssociationTypeMeta,
};
