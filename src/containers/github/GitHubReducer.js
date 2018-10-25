/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { Map, fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import * as Routes from '../../core/router/Routes';
import { openPullRequest } from './GitHubActions';

export const SUBMIT_STATES = {
  PRE_SUBMIT: 0,
  IS_SUBMITTING: 1,
  SUBMIT_SUCCESS: 2,
  SUBMIT_FAILURE: 3,
};

const INITIAL_STATE :Map<*, *> = fromJS({
  submitState: SUBMIT_STATES.PRE_SUBMIT,
});

export default function reducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case openPullRequest.case(action.type): {
      return openPullRequest.reducer(state, action, {
        REQUEST: () => state.set('submitState', SUBMIT_STATES.IS_SUBMITTING),
        SUCCESS: () => state.set('submitState', SUBMIT_STATES.SUBMIT_SUCCESS),
        FAILURE: () => state.set('submitState', SUBMIT_STATES.SUBMIT_FAILURE),
      });
    }

    // TODO: this feels hacky
    case LOCATION_CHANGE: {

      // we need to reset submitState when navigating away
      const { payload } = action;
      if (payload.pathname !== Routes.GITHUB) {
        return state.set('submitState', SUBMIT_STATES.PRE_SUBMIT);
      }

      return state;
    }

    default:
      return state;
  }
}
