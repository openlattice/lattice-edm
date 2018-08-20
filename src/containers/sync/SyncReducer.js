/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { Map, fromJS } from 'immutable';

import {
  syncProdEntityDataModel,
} from './SyncActionFactory';

const INITIAL_STATE :Map<*, *> = fromJS({
  isSyncing: false,
  syncSuccess: false,
});

export default function syncEdmReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case syncProdEntityDataModel.case(action.type): {
      return syncProdEntityDataModel.reducer(state, action, {
        REQUEST: () => state.set('isSyncing', true),
        SUCCESS: () => state.set('syncSuccess', true),
        FAILURE: () => state.set('syncSuccess', false).set('conflicts', action.value),
        FINALLY: () => state.set('isSyncing', false),
      });
    }

    default:
      return state;
  }
}
