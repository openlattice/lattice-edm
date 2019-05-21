/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SYNC_PROD_EDM :'SYNC_PROD_EDM' = 'SYNC_PROD_EDM';
const syncProdEntityDataModel :RequestSequence = newRequestSequence(SYNC_PROD_EDM);

export {
  SYNC_PROD_EDM,
  syncProdEntityDataModel
};
