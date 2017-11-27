/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';

import {
  CREATE_PROPERTY_TYPE_FAILURE,
  CREATE_PROPERTY_TYPE_REQUEST,
  CREATE_PROPERTY_TYPE_SUCCESS,
  DELETE_PROPERTY_TYPE_FAILURE,
  DELETE_PROPERTY_TYPE_REQUEST,
  DELETE_PROPERTY_TYPE_SUCCESS,
  FETCH_ALL_PROPERTY_TYPES_FAILURE,
  FETCH_ALL_PROPERTY_TYPES_REQUEST,
  FETCH_ALL_PROPERTY_TYPES_SUCCESS,
  UPDATE_PROPERTY_TYPE_METADATA_FAILURE,
  UPDATE_PROPERTY_TYPE_METADATA_REQUEST,
  UPDATE_PROPERTY_TYPE_METADATA_SUCCESS
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

    case CREATE_PROPERTY_TYPE_FAILURE:
      return state
        .set('isCreatingNewPropertyType', false)
        .set('newlyCreatedPropertyTypeId', '');

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
        .setPii(action.propertyType.piiField)
        .setAnalyzer(action.propertyType.analyzer)
        .setSchemas(action.propertyType.schemas)
        .build();

      const iPropertyType :Map<*, *> = propertyType.asImmutable();
      const current :List<Map<*, *>> = state.get('propertyTypes', Immutable.List());
      const updated :List<Map<*, *>> = current.push(iPropertyType);

      const currentById :Map<string, number> = state.get('propertyTypesById', Immutable.Map());
      const updatedById :Map<string, number> = currentById.set(action.propertyTypeId, updated.size - 1);

      return state
        .set('isCreatingNewPropertyType', false)
        .set('newlyCreatedPropertyTypeId', action.propertyTypeId)
        .set('propertyTypes', updated)
        .set('propertyTypesById', updatedById);
    }

    case DELETE_PROPERTY_TYPE_FAILURE:
    case DELETE_PROPERTY_TYPE_REQUEST:
      return state;

    case DELETE_PROPERTY_TYPE_SUCCESS: {

      const propertyTypeId :string = action.propertyTypeId;
      const propertyTypeIndex :number = state.getIn(['propertyTypesById', propertyTypeId], -1);

      if (propertyTypeIndex === -1) {
        return state;
      }
      const current :List<Map<*, *>> = state.get('propertyTypes', Immutable.List());
      const updated :List<Map<*, *>> = current.delete(propertyTypeIndex);

      const currentById :Map<string, number> = state.get('propertyTypesById', Immutable.Map());
      const updatedById :Map<string, number> = currentById.delete(propertyTypeId);

      return state
        .set('propertyTypes', updated)
        .set('propertyTypesById', updatedById);
    }

    case FETCH_ALL_PROPERTY_TYPES_FAILURE:
      return state
        .set('isFetchingAllPropertyTypes', false)
        .set('propertyTypes', Immutable.List())
        .set('propertyTypesById', Immutable.Map());

    case FETCH_ALL_PROPERTY_TYPES_REQUEST:
      return state.set('isFetchingAllPropertyTypes', true);

    case FETCH_ALL_PROPERTY_TYPES_SUCCESS: {

      const propertyTypes :List<Map<*, *>> = Immutable.fromJS(action.propertyTypes);
      const propertyTypesById :Map<string, number> = Immutable.Map()
        .withMutations((byIdMap :Map<string, number>) => {
          propertyTypes.forEach((propertyType :Map<*, *>, propertyTypeIndex :number) => {
            byIdMap.set(propertyType.get('id'), propertyTypeIndex);
          });
        });

      return state
        .set('isFetchingAllPropertyTypes', false)
        .set('propertyTypes', propertyTypes)
        .set('propertyTypesById', propertyTypesById);
    }

    case UPDATE_PROPERTY_TYPE_METADATA_FAILURE:
    case UPDATE_PROPERTY_TYPE_METADATA_REQUEST:
      return state;

    case UPDATE_PROPERTY_TYPE_METADATA_SUCCESS: {

      const propertyTypeId :string = action.propertyTypeId;
      const propertyTypeIndex :number = state.getIn(['propertyTypesById', propertyTypeId], -1);
      if (propertyTypeIndex < 0) {
        return state;
      }

      if (action.metadata.description) {
        return state.setIn(['propertyTypes', propertyTypeIndex, 'description'], action.metadata.description);
      }
      else if (action.metadata.title) {
        return state.setIn(['propertyTypes', propertyTypeIndex, 'title'], action.metadata.title);
      }
      else if (action.metadata.type) {
        // TODO: potential bug with how immutable.js deals with custom objects
        // TODO: consider storing plain object instead of FullyQualifiedName object
        return state.setIn(['propertyTypes', propertyTypeIndex, 'type'], action.metadata.type);
      }

      return state;
    }

    default:
      return state;
  }
}
