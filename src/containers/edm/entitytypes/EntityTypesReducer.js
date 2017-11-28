/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import {
  CREATE_ENTITY_TYPE_FAILURE,
  CREATE_ENTITY_TYPE_REQUEST,
  CREATE_ENTITY_TYPE_SUCCESS,
  DELETE_ENTITY_TYPE_FAILURE,
  DELETE_ENTITY_TYPE_REQUEST,
  DELETE_ENTITY_TYPE_SUCCESS,
  UPDATE_ENTITY_TYPE_METADATA_FAILURE,
  UPDATE_ENTITY_TYPE_METADATA_REQUEST,
  UPDATE_ENTITY_TYPE_METADATA_SUCCESS,
  addPropertyTypeToEntityType,
  removePropertyTypeFromEntityType
} from './EntityTypesActionFactory';

import type { Action } from './EntityTypesActionFactory';
import type { SequenceAction } from '../../../core/redux/RequestSequence';

const { getAllEntityTypes } = EntityDataModelApiActionFactory;
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
        .setBaseType(action.entityType.baseType)
        .setCategory(action.entityType.category)
        .setSchemas(action.entityType.schemas)
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

    case getAllEntityTypes.case(action.type): {
      return getAllEntityTypes.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingAllEntityTypes', true);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);

          if (seqAction.value) {
            const allEntityTypes :List<Map<*, *>> = Immutable.fromJS(seqAction.value);
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
              .set('entityTypes', entityTypesStrict)
              .set('entityTypesById', entityTypesById);
          }

          return state;
        },
        FAILURE: () => {
          return state
            .set('entityTypes', Immutable.List())
            .set('entityTypesById', Immutable.Map());
        },
        FINALLY: () => {
          return state.set('isFetchingAllEntityTypes', false);
        }
      });
    }

    case addPropertyTypeToEntityType.case(action.type): {
      return addPropertyTypeToEntityType.reducer(state, action, {
        SUCCESS: () => {

          const seqAction = ((action :any) :SequenceAction);
          const targetId :string = seqAction.data.entityTypeId;
          const targetIndex :number = state.getIn(['entityTypesById', targetId], -1);

          // don't do anything if the EntityType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const propertyTypeIdToAdd :string = seqAction.data.propertyTypeId;
          const currentEntityType :Map<*, *> = state.getIn(['entityTypes', targetIndex], Immutable.Map());
          const currentPropertyTypeIds :List<string> = currentEntityType.get('properties', Immutable.List());
          const propertyTypeIndex :number = currentPropertyTypeIds.findIndex((propertyTypeId :string) => {
            return propertyTypeId === propertyTypeIdToAdd;
          });

          // don't do anything if the PropertyType being added is already in the list
          if (propertyTypeIndex !== -1) {
            return state;
          }

          const updatedPropertyTypeIds :List<string> = currentPropertyTypeIds.push(propertyTypeIdToAdd);
          const updatedEntityType :Map<*, *> = currentEntityType.set('properties', updatedPropertyTypeIds);
          return state.setIn(['entityTypes', targetIndex], updatedEntityType);
        }
      });
    }

    case removePropertyTypeFromEntityType.case(action.type): {
      return removePropertyTypeFromEntityType.reducer(state, action, {
        SUCCESS: () => {

          const seqAction = ((action :any) :SequenceAction);
          const targetId :string = seqAction.data.entityTypeId;
          const targetIndex :number = state.getIn(['entityTypesById', targetId], -1);

          // don't do anything if the EntityType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const currentEntityType :Map<*, *> = state.getIn(['entityTypes', targetIndex], Immutable.Map());
          const currentPropertyTypeIds :List<string> = currentEntityType.get('properties', Immutable.List());
          const removalIndex :number = currentPropertyTypeIds.findIndex((propertyTypeId :string) => {
            return propertyTypeId === seqAction.data.propertyTypeId;
          });

          // don't do anything if the PropertyType being removed is not actually in the list
          if (removalIndex === -1) {
            return state;
          }

          const updatedPropertyTypeIds :List<string> = currentPropertyTypeIds.delete(removalIndex);
          const updatedEntityType :Map<*, *> = currentEntityType.set('properties', updatedPropertyTypeIds);
          return state.setIn(['entityTypes', targetIndex], updatedEntityType);
        }
      });
    }

    default:
      return state;
  }
}
