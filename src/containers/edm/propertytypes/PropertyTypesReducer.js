/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import {
  DELETE_PROPERTY_TYPE_FAILURE,
  DELETE_PROPERTY_TYPE_REQUEST,
  DELETE_PROPERTY_TYPE_SUCCESS,
  UPDATE_PROPERTY_TYPE_METADATA_FAILURE,
  UPDATE_PROPERTY_TYPE_METADATA_REQUEST,
  UPDATE_PROPERTY_TYPE_METADATA_SUCCESS
} from './PropertyTypesActionFactory';

import type { Action } from './PropertyTypesActionFactory';

const { createPropertyType, getAllPropertyTypes } = EntityDataModelApiActionFactory;
const { PropertyType, PropertyTypeBuilder } = Models;

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  propertyTypes: Immutable.List(),
  propertyTypesById: Immutable.Map(),
  isCreatingNewPropertyType: false,
  isFetchingAllPropertyTypes: false,
  newlyCreatedPropertyTypeId: '',
  tempPropertyType: null
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

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

    case createPropertyType.case(action.type): {
      return createPropertyType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewPropertyType', true)
            .set('newlyCreatedPropertyTypeId', '')
            .set('tempPropertyType', seqAction.value);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const newPropertyTypeId :string = seqAction.value;
          const tempPropertyType :PropertyType = state.get('tempPropertyType');

          const newPropertyType :PropertyType = new PropertyTypeBuilder()
            .setId(newPropertyTypeId)
            .setType(tempPropertyType.type)
            .setTitle(tempPropertyType.title)
            .setDescription(tempPropertyType.description)
            .setDataType(tempPropertyType.datatype)
            .setPii(tempPropertyType.piiField)
            .setAnalyzer(tempPropertyType.analyzer)
            .setSchemas(tempPropertyType.schemas)
            .build();

          const iPropertyType :Map<*, *> = newPropertyType.asImmutable();
          const current :List<Map<*, *>> = state.get('propertyTypes', Immutable.List());
          const updated :List<Map<*, *>> = current.push(iPropertyType);

          const currentById :Map<string, number> = state.get('propertyTypesById', Immutable.Map());
          const updatedById :Map<string, number> = currentById.set(newPropertyTypeId, updated.size - 1);

          return state
            .set('newlyCreatedPropertyTypeId', newPropertyTypeId)
            .set('propertyTypes', updated)
            .set('propertyTypesById', updatedById);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          return state
            .set('isCreatingNewPropertyType', false)
            .set('newlyCreatedPropertyTypeId', '')
            .set('tempPropertyType', null);
        }
      });
    }

    case getAllPropertyTypes.case(action.type): {
      return getAllPropertyTypes.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingAllPropertyTypes', true);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);

          if (seqAction.value) {
            const propertyTypes :List<Map<*, *>> = Immutable.fromJS(seqAction.value);
            const propertyTypesById :Map<string, number> = Immutable.Map()
              .withMutations((byIdMap :Map<string, number>) => {
                propertyTypes.forEach((propertyType :Map<*, *>, propertyTypeIndex :number) => {
                  byIdMap.set(propertyType.get('id'), propertyTypeIndex);
                });
              });
            return state
              .set('propertyTypes', propertyTypes)
              .set('propertyTypesById', propertyTypesById);
          }

          return state;
        },
        FAILURE: () => {
          return state
            .set('propertyTypes', Immutable.List())
            .set('propertyTypesById', Immutable.Map());
        },
        FINALLY: () => {
          return state.set('isFetchingAllPropertyTypes', false);
        }
      });
    }

    default:
      return state;
  }
}
