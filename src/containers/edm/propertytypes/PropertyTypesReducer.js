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
  propertyTypesById: Immutable.Map(),
  isFetchingAllPropertyTypes: false
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case FETCH_ALL_PROPERTY_TYPES_REQUEST:
      return state.set('isFetchingAllPropertyTypes', true);

    case FETCH_ALL_PROPERTY_TYPES_SUCCESS: {

      const propertyTypes :List<Map<*, *>> = Immutable.fromJS(action.propertyTypes);
      const propertyTypesById :Map<string, Map<*, *>> = Immutable.Map()
        .withMutations((map :Map<string, Map<*, *>>) => {
          propertyTypes.forEach((propertyType :Map<*, *>) => {
            map.set(propertyType.get('id'), propertyType);
          });
        });

      return state
        .set('isFetchingAllPropertyTypes', false)
        .set('propertyTypes', propertyTypes)
        .set('propertyTypesById', propertyTypesById);
    }

    case FETCH_ALL_PROPERTY_TYPES_FAILURE:
      return state
        .set('isFetchingAllPropertyTypes', false)
        .set('propertyTypes', Immutable.List());

    default:
      return state;
  }
}
