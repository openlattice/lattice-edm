/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { Map, fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import * as Routes from '../../core/router/Routes';
import { syncProdEntityDataModel } from './SyncActionFactory';

// TODO: stop copying things
export const SYNC_STATES = {
  PRE_SYNC: 0,
  IS_SYNCING: 1,
  SYNC_SUCCESS: 2,
  SYNC_FAILURE: 3
};

const INITIAL_STATE :Map<*, *> = fromJS({
  syncState: SYNC_STATES.PRE_SYNC,
});

export default function syncEdmReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case syncProdEntityDataModel.case(action.type): {
      return syncProdEntityDataModel.reducer(state, action, {
        REQUEST: () => state.set('syncState', SYNC_STATES.IS_SYNCING),
        SUCCESS: () => state.set('syncState', SYNC_STATES.SYNC_SUCCESS),
        FAILURE: () => state.set('syncState', SYNC_STATES.SYNC_FAILURE),
      });
    }

    // TODO: this feels hacky
    case LOCATION_CHANGE: {

      // we need to reset syncState when navigating away
      const { payload } = action;
      if (payload.pathname !== Routes.SYNC) {
        return state.set('syncState', SYNC_STATES.PRE_SYNC);
      }

      return state;
    }

    default:
      return state;
  }
}
