/*
 * @flow
 */

import Immutable from 'immutable';

import {
  FETCH_ALL_PROPERTY_TYPES_FAILURE,
  FETCH_ALL_PROPERTY_TYPES_REQUEST,
  FETCH_ALL_PROPERTY_TYPES_SUCCESS
} from './PropertyTypesActionFactory';

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  propertyTypes: Immutable.List(),
  isFetchingAllPropertyTypes: false
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case FETCH_ALL_PROPERTY_TYPES_REQUEST:
      return state.set('isFetchingAllPropertyTypes', true);

    case FETCH_ALL_PROPERTY_TYPES_FAILURE:
      return state
        .set('isFetchingAllPropertyTypes', false)
        .set('propertyTypes', Immutable.List());

    case FETCH_ALL_PROPERTY_TYPES_SUCCESS:
      return state
        .set('isFetchingAllPropertyTypes', false)
        .set('propertyTypes', Immutable.fromJS(action.propertyTypes));

    default:
      return state;
  }
}
