/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';

import {
  CREATE_PROPERTY_TYPE_FAILURE,
  CREATE_PROPERTY_TYPE_REQUEST,
  CREATE_PROPERTY_TYPE_SUCCESS,
  FETCH_ALL_PROPERTY_TYPES_FAILURE,
  FETCH_ALL_PROPERTY_TYPES_REQUEST,
  FETCH_ALL_PROPERTY_TYPES_SUCCESS
} from './PropertyTypesActionFactory';

import type { Action } from './PropertyTypesActionFactory';

const { PropertyType, PropertyTypeBuilder } = Models;

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  propertyTypes: Immutable.List(),
  propertyTypesById: Immutable.Map(),
  isCreatingNewPropertyType: false,
  isFetchingAllPropertyTypes: false,
  newlyCreatedPropertyTypeId: ''
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case CREATE_PROPERTY_TYPE_REQUEST:
      return state
        .set('isCreatingNewPropertyType', true)
        .set('newlyCreatedPropertyTypeId', '');

    case CREATE_PROPERTY_TYPE_SUCCESS: {

      const propertyType :PropertyType = new PropertyTypeBuilder()
        .setId(action.propertyTypeId)
        .setType(action.propertyType.type)
        .setTitle(action.propertyType.title)
        .setDescription(action.propertyType.description)
        .setDataType(action.propertyType.datatype)
        .setPii(action.propertyType.piiValue)
        .setAnalyzer(action.propertyType.analyzer)
        .build();

      const iPropertyType :Map<*, *> = propertyType.asImmutable();
      const current :List<Map<*, *>> = state.get('propertyTypes', Immutable.List());
      const updated :List<Map<*, *>> = current.push(iPropertyType);

      const currentById :Map<string, Map<*, *>> = state.get('propertyTypesById', Immutable.Map());
      const updatedById :Map<string, Map<*, *>> = currentById.set(action.propertyTypeId, iPropertyType);

      return state
        .set('isCreatingNewPropertyType', false)
        .set('newlyCreatedPropertyTypeId', action.propertyTypeId)
        .set('propertyTypes', updated)
        .set('propertyTypesById', updatedById);
    }

    case CREATE_PROPERTY_TYPE_FAILURE:
      return state
        .set('isCreatingNewPropertyType', false)
        .set('newlyCreatedPropertyTypeId', '');

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
