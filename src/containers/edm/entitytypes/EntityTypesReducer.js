/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';

import {
  CREATE_ENTITY_TYPE_FAILURE,
  CREATE_ENTITY_TYPE_REQUEST,
  CREATE_ENTITY_TYPE_SUCCESS,
  DELETE_ENTITY_TYPE_FAILURE,
  DELETE_ENTITY_TYPE_REQUEST,
  DELETE_ENTITY_TYPE_SUCCESS,
  FETCH_ALL_ENTITY_TYPES_FAILURE,
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  FETCH_ALL_ENTITY_TYPES_SUCCESS,
  UPDATE_ENTITY_TYPE_METADATA_FAILURE,
  UPDATE_ENTITY_TYPE_METADATA_REQUEST,
  UPDATE_ENTITY_TYPE_METADATA_SUCCESS,
  removePropertyTypeFromEntityType
} from './EntityTypesActionFactory';

import type { Action } from './EntityTypesActionFactory';
import type { SequenceAction } from '../../../core/redux/RequestSequence';

const { EntityType, EntityTypeBuilder } = Models;

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  entityTypes: Immutable.List(),
  entityTypesById: Immutable.Map(),
  isCreatingNewEntityType: false,
  isFetchingAllEntityTypes: false,
  newlyCreatedEntityTypeId: ''
});

export default function entityTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case CREATE_ENTITY_TYPE_FAILURE:
      return state
        .set('isCreatingNewEntityType', false)
        .set('newlyCreatedEntityTypeId', '');

    case CREATE_ENTITY_TYPE_REQUEST:
      return state
        .set('isCreatingNewEntityType', true)
        .set('newlyCreatedEntityTypeId', '');

    case CREATE_ENTITY_TYPE_SUCCESS: {

      const entityType :EntityType = new EntityTypeBuilder()
        .setId(action.entityTypeId)
        .setType(action.entityType.type)
        .setTitle(action.entityType.title)
        .setDescription(action.entityType.description)
        .setKey(action.entityType.key)
        .setPropertyTypes(action.entityType.properties)
        .setCategory(action.entityType.category)
        .build();

      const iEntityType :Map<*, *> = entityType.asImmutable();
      const current :List<Map<*, *>> = state.get('entityTypes', Immutable.List());
      const updated :List<Map<*, *>> = current.push(iEntityType);

      const currentById :Map<string, number> = state.get('entityTypesById', Immutable.Map());
      const updatedById :Map<string, number> = currentById.set(action.entityTypeId, updated.size - 1);

      return state
        .set('isCreatingNewEntityType', false)
        .set('newlyCreatedEntityTypeId', action.entityTypeId)
        .set('entityTypes', updated)
        .set('entityTypesById', updatedById);
    }

    case DELETE_ENTITY_TYPE_FAILURE:
    case DELETE_ENTITY_TYPE_REQUEST:
      return state;

    case DELETE_ENTITY_TYPE_SUCCESS: {

      const entityTypeId :string = action.entityTypeId;
      const entityTypeIndex :number = state.getIn(['entityTypesById', entityTypeId], -1);

      if (entityTypeIndex === -1) {
        return state;
      }
      const current :List<Map<*, *>> = state.get('entityTypes', Immutable.List());
      const updated :List<Map<*, *>> = current.delete(entityTypeIndex);

      const currentById :Map<string, number> = state.get('entityTypesById', Immutable.Map());
      const updatedById :Map<string, number> = currentById.delete(entityTypeId);

      return state
        .set('entityTypes', updated)
        .set('entityTypesById', updatedById);
    }

    case FETCH_ALL_ENTITY_TYPES_FAILURE:
      return state
        .set('isFetchingAllEntityTypes', false)
        .set('entityTypes', Immutable.List())
        .set('entityTypesById', Immutable.Map());

    case FETCH_ALL_ENTITY_TYPES_REQUEST:
      return state.set('isFetchingAllEntityTypes', true);

    case FETCH_ALL_ENTITY_TYPES_SUCCESS: {

      const allEntityTypes :List<Map<*, *>> = Immutable.fromJS(action.entityTypes);
      const entityTypesStrict :List<Map<*, *>> = allEntityTypes.filter((entityType :Map<*, *>) => {
        return entityType.get('category') === 'EntityType';
      });

      const entityTypesById :Map<string, number> = Immutable.Map()
        .withMutations((byIdMap :Map<string, number>) => {
          entityTypesStrict.forEach((entityType :Map<*, *>, entityTypeIndex :number) => {
            byIdMap.set(entityType.get('id'), entityTypeIndex);
          });
        });

      return state
        .set('isFetchingAllEntityTypes', false)
        .set('entityTypes', entityTypesStrict)
        .set('entityTypesById', entityTypesById);
    }

    case UPDATE_ENTITY_TYPE_METADATA_FAILURE:
    case UPDATE_ENTITY_TYPE_METADATA_REQUEST:
      return state;

    case UPDATE_ENTITY_TYPE_METADATA_SUCCESS: {

      const entityTypeId :string = action.entityTypeId;
      const entityTypeIndex :number = state.getIn(['entityTypesById', entityTypeId], -1);
      if (entityTypeIndex < 0) {
        return state;
      }

      if (action.metadata.description) {
        return state.setIn(['entityTypes', entityTypeIndex, 'description'], action.metadata.description);
      }
      else if (action.metadata.title) {
        return state.setIn(['entityTypes', entityTypeIndex, 'title'], action.metadata.title);
      }
      else if (action.metadata.type) {
        // TODO: potential bug with how immutable.js deals with custom objects
        // TODO: consider storing plain object instead of FullyQualifiedName object
        return state.setIn(['entityTypes', entityTypeIndex, 'type'], action.metadata.type);
      }

      return state;
    }

    case (removePropertyTypeFromEntityType.case(action.type)): {
      return removePropertyTypeFromEntityType.reducer(state, action, {
        SUCCESS: () => {

          const seqAction = ((action :any) :SequenceAction);
          const targetEntityTypeId :string = seqAction.data.entityTypeId;
          const targetPropertyTypeId :string = seqAction.data.propertyTypeId;

          const targetEntityTypeIndex :number = state.getIn(['entityTypesById', targetEntityTypeId], -1);

          if (targetEntityTypeIndex === -1) {
            return state;
          }

          const currentEntityType :Map<*, *> = state.getIn(['entityTypes', targetEntityTypeIndex], Immutable.Map());
          const currentPropertyTypeIds :List<string> = currentEntityType.get('properties', Immutable.List());
          const propertyTypeIndex :number = currentPropertyTypeIds.findIndex((propertyTypeId :string) => {
            return propertyTypeId === targetPropertyTypeId;
          });

          if (propertyTypeIndex === -1) {
            return state;
          }

          const updatedPropertyTypeIds :List<string> = currentPropertyTypeIds.delete(propertyTypeIndex);
          const updatedEntityType :Map<*, *> = currentEntityType.set('properties', updatedPropertyTypeIds);
          return state.setIn(['entityTypes', targetEntityTypeIndex], updatedEntityType);
        }
      });
    }

    default:
      return state;
  }
}
