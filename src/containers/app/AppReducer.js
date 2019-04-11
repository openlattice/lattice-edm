/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import {
  TOGGLE_ONLINE,
} from './AppActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  isOnline: true, // TODO: revert to true when ready to release
});

export default function reducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case TOGGLE_ONLINE: {
      // TODO: revert when ready to release
      // return state.set('isOnline', !state.get('isOnline'));
      return state;
    }

    default:
      return state;
  }
}
