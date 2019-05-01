/*
 * @flow
 */

import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import { LOCATION_CHANGE } from 'connected-react-router';
import { Map } from 'immutable';
import type { DispatchAPI, MiddlewareAPI } from 'redux';

type TrackingAction = {
  +type :string;
  tracking ?:Object;
};

type Action =
  | TrackingAction;

type ActionMatcher = (action :Action) => boolean;

const matchTrackingEvent = (action :TrackingAction) => (
  (isPlainObject(action.tracking) && !isEmpty(action.tracking))
  || (action.type === LOCATION_CHANGE)
);

// https://github.com/markdalgleish/redux-tap
const tap = (matcher :ActionMatcher, callback :Function) => (
  (store :MiddlewareAPI<*, Action, *>) => (
    (next :DispatchAPI<Action>) => (
      (action :Action) => {
        const prevState = store.getState();
        const result = next(action);
        const nextState = store.getState();
        if (!isFunction(matcher)) {
          return result;
        }
        const isMatch = matcher(action);
        if (isMatch === true) {
          callback(action, prevState, nextState);
        }
        return result;
      }
    )
  )
);

function trackingMiddleware(eventsMap :Object) {
  return tap(matchTrackingEvent, (action :Action, prevState :Map, nextState :Map) => {
    if (isPlainObject(eventsMap) && !isEmpty(eventsMap)) {
      const handler = eventsMap[action.type];
      if (isFunction(handler)) {
        handler(action, prevState, nextState);
      }
    }
  });
}

export {
  trackingMiddleware,
};
