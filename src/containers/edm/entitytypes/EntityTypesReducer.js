/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import {
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

const { createEntityType, getAllEntityTypes } = EntityDataModelApiActionFactory;
const { EntityType, EntityTypeBuilder } = Models;

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  entityTypes: Immutable.List(),
  entityTypesById: Immutable.Map(),
  isCreatingNewEntityType: false,
  isFetchingAllEntityTypes: false,
  newlyCreatedEntityTypeId: '',
  tempEntityType: null
});

export default function entityTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

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

    case createEntityType.case(action.type): {
      return createEntityType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewEntityType', true)
            .set('newlyCreatedEntityTypeId', '')
            .set('tempEntityType', seqAction.value);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const newEntityTypeId :string = seqAction.value;
          const tempEntityType :EntityType = state.get('tempEntityType');

          const newEntityType :EntityType = new EntityTypeBuilder()
            .setId(newEntityTypeId)
            .setType(tempEntityType.type)
            .setTitle(tempEntityType.title)
            .setDescription(tempEntityType.description)
            .setKey(tempEntityType.key)
            .setPropertyTypes(tempEntityType.properties)
            .setBaseType(tempEntityType.baseType)
            .setCategory(tempEntityType.category)
            .setSchemas(tempEntityType.schemas)
            .build();

          const iEntityType :Map<*, *> = newEntityType.asImmutable();
          const current :List<Map<*, *>> = state.get('entityTypes', Immutable.List());
          const updated :List<Map<*, *>> = current.push(iEntityType);

          const currentById :Map<string, number> = state.get('entityTypesById', Immutable.Map());
          const updatedById :Map<string, number> = currentById.set(newEntityTypeId, updated.size - 1);

          return state
            .set('newlyCreatedEntityTypeId', newEntityTypeId)
            .set('entityTypes', updated)
            .set('entityTypesById', updatedById);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          return state
            .set('isCreatingNewEntityType', false)
            .set('newlyCreatedEntityTypeId', '')
            .set('tempEntityType', null);
        }
      });
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
