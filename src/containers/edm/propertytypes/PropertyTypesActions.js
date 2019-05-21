/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const LOCAL_CREATE_PROPERTY_TYPE :'LOCAL_CREATE_PROPERTY_TYPE' = 'LOCAL_CREATE_PROPERTY_TYPE';
const localCreatePropertyType :RequestSequence = newRequestSequence(LOCAL_CREATE_PROPERTY_TYPE);

const LOCAL_DELETE_PROPERTY_TYPE :'LOCAL_DELETE_PROPERTY_TYPE' = 'LOCAL_DELETE_PROPERTY_TYPE';
const localDeletePropertyType :RequestSequence = newRequestSequence(LOCAL_DELETE_PROPERTY_TYPE);

const LOCAL_UPDATE_PROPERTY_TYPE_META :'LOCAL_UPDATE_PROPERTY_TYPE_META' = 'LOCAL_UPDATE_PROPERTY_TYPE_META';
const localUpdatePropertyTypeMeta :RequestSequence = newRequestSequence(LOCAL_UPDATE_PROPERTY_TYPE_META);

export {
  LOCAL_CREATE_PROPERTY_TYPE,
  LOCAL_DELETE_PROPERTY_TYPE,
  LOCAL_UPDATE_PROPERTY_TYPE_META,
  localCreatePropertyType,
  localDeletePropertyType,
  localUpdatePropertyTypeMeta,
};
