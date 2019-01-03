/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOCAL_CREATE_PROPERTY_TYPE :'LOCAL_CREATE_PROPERTY_TYPE' = 'LOCAL_CREATE_PROPERTY_TYPE';
const localCreatePropertyType :RequestSequence = newRequestSequence(LOCAL_CREATE_PROPERTY_TYPE);

const LOCAL_DELETE_PROPERTY_TYPE :'LOCAL_DELETE_PROPERTY_TYPE' = 'LOCAL_DELETE_PROPERTY_TYPE';
const localDeletePropertyType :RequestSequence = newRequestSequence(LOCAL_DELETE_PROPERTY_TYPE);

export {
  LOCAL_CREATE_PROPERTY_TYPE,
  LOCAL_DELETE_PROPERTY_TYPE,
  localCreatePropertyType,
  localDeletePropertyType,
};
