/*
 * @flow
 */

import Immutable from 'immutable';

import {
  FETCH_ALL_ENTITY_TYPES_FAILURE,
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  FETCH_ALL_ENTITY_TYPES_SUCCESS
} from './EntityTypesActionFactory';

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  entityTypes: Immutable.List(),
  isFetchingAllEntityTypes: false
});

export default function entityTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case FETCH_ALL_ENTITY_TYPES_REQUEST:
      return state.set('isFetchingAllEntityTypes', true);

    case FETCH_ALL_ENTITY_TYPES_SUCCESS: {

      const allEntityTypes :List<Map<*, *>> = Immutable.fromJS(action.entityTypes);
      const entityTypesStrict :List<Map<*, *>> = allEntityTypes.filter((entityType :Map<*, *>) => {
        return entityType.get('category') === 'EntityType';
      });

      return state
        .set('isFetchingAllEntityTypes', false)
        .set('entityTypes', entityTypesStrict);
    }

    case FETCH_ALL_ENTITY_TYPES_FAILURE:
      return state
        .set('isFetchingAllEntityTypes', false)
        .set('entityTypes', Immutable.List());

    default:
      return state;
  }
}
