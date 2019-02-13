/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOCAL_CREATE_SCHEMA :'LOCAL_CREATE_SCHEMA' = 'LOCAL_CREATE_SCHEMA';
const localCreateSchema :RequestSequence = newRequestSequence(LOCAL_CREATE_SCHEMA);

const LOCAL_DELETE_SCHEMA :'LOCAL_DELETE_SCHEMA' = 'LOCAL_DELETE_SCHEMA';
const localDeleteSchema :RequestSequence = newRequestSequence(LOCAL_DELETE_SCHEMA);

const LOCAL_UPDATE_SCHEMA :'LOCAL_UPDATE_SCHEMA' = 'LOCAL_UPDATE_SCHEMA';
const localUpdateSchema :RequestSequence = newRequestSequence(LOCAL_UPDATE_SCHEMA);

export {
  LOCAL_CREATE_SCHEMA,
  LOCAL_DELETE_SCHEMA,
  LOCAL_UPDATE_SCHEMA,
  localCreateSchema,
  localDeleteSchema,
  localUpdateSchema,
};
