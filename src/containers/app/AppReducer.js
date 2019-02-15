/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import {
  TOGGLE_ONLINE,
} from './AppActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  isOnline: false,
});

export default function reducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case TOGGLE_ONLINE: {
      return state.set('isOnline', !state.get('isOnline'));
    }

    default:
      return state;
  }
}
