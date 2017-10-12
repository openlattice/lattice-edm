/*
 * @flow
 */

import Immutable from 'immutable';

import {
  FETCH_ALL_ASSOCIATION_TYPES_FAILURE,
  FETCH_ALL_ASSOCIATION_TYPES_REQUEST,
  FETCH_ALL_ASSOCIATION_TYPES_SUCCESS
} from './AssociationTypesActionFactory';

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  associationTypes: Immutable.List(),
  isFetchingAllAssociationTypes: false
});

export default function associationTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case FETCH_ALL_ASSOCIATION_TYPES_REQUEST:
      return state.set('isFetchingAllAssociationTypes', true);

    case FETCH_ALL_ASSOCIATION_TYPES_SUCCESS:
      return state
        .set('isFetchingAllAssociationTypes', false)
        .set('associationTypes', Immutable.fromJS(action.associationTypes));

    case FETCH_ALL_ASSOCIATION_TYPES_FAILURE:
      return state
        .set('isFetchingAllAssociationTypes', false)
        .set('associationTypes', Immutable.List());

    default:
      return state;
  }
}
