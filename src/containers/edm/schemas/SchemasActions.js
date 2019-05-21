/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const LOCAL_CREATE_SCHEMA :'LOCAL_CREATE_SCHEMA' = 'LOCAL_CREATE_SCHEMA';
const localCreateSchema :RequestSequence = newRequestSequence(LOCAL_CREATE_SCHEMA);

const LOCAL_UPDATE_SCHEMA :'LOCAL_UPDATE_SCHEMA' = 'LOCAL_UPDATE_SCHEMA';
const localUpdateSchema :RequestSequence = newRequestSequence(LOCAL_UPDATE_SCHEMA);

export {
  LOCAL_CREATE_SCHEMA,
  LOCAL_UPDATE_SCHEMA,
  localCreateSchema,
  localUpdateSchema,
};
