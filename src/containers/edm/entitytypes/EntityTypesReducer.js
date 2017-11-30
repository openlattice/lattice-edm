/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import {
  addPropertyTypeToEntityType,
  removePropertyTypeFromEntityType
} from './EntityTypesActionFactory';

import type { SequenceAction } from '../../../core/redux/RequestSequence';

const {
  createEntityType,
  deleteEntityType,
  getAllEntityTypes,
  updateEntityTypeMetaData
} = EntityDataModelApiActionFactory;

const {
  EntityType,
  EntityTypeBuilder
} = Models;

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  entityTypeIdToDelete: '',
  entityTypes: Immutable.List(),
  entityTypesById: Immutable.Map(),
  isCreatingNewEntityType: false,
  isFetchingAllEntityTypes: false,
  newlyCreatedEntityTypeId: '',
  tempEntityType: null,
  updateActionsMap: Immutable.Map()
});

export default function entityTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

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

    case deleteEntityType.case(action.type): {
      return deleteEntityType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = (action :any);
          return state.set('entityTypeIdToDelete', seqAction.value);
        },
        SUCCESS: () => {

          const entityTypeId :string = state.get('entityTypeIdToDelete', '');
          const entityTypeIndex :number = state.getIn(['entityTypesById', entityTypeId], -1);

          if (entityTypeIndex === -1) {
            return state;
          }

          const current :List<Map<*, *>> = state.get('entityTypes', Immutable.List());
          const updated :List<Map<*, *>> = current.delete(entityTypeIndex);

          // !!! BUG !!! - need to update id -> index mapping
          const currentById :Map<string, number> = state.get('entityTypesById', Immutable.Map());
          const updatedById :Map<string, number> = currentById.delete(entityTypeId);

          return state
            .set('entityTypes', updated)
            .set('entityTypesById', updatedById);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          return state.set('entityTypeIdToDelete', '');
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

    case updateEntityTypeMetaData.case(action.type): {
      return updateEntityTypeMetaData.reducer(state, action, {
        REQUEST: () => {
          // TODO: this is not ideal. figure out a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['updateActionsMap', seqAction.id], Immutable.fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const updateSeqAction :Map<*, *> = state.getIn(['updateActionsMap', seqAction.id], Immutable.Map());

          if (updateSeqAction.isEmpty()) {
            return state;
          }

          const entityTypeId :string = updateSeqAction.getIn(['value', 'id'], '');
          const entityTypeIndex :number = state.getIn(['entityTypesById', entityTypeId], -1);
          if (entityTypeIndex < 0) {
            return state;
          }

          const metadata :Map<*, *> = updateSeqAction.getIn(['value', 'metadata'], Immutable.Map());
          if (metadata.has('description')) {
            return state.setIn(['entityTypes', entityTypeIndex, 'description'], metadata.get('description'));
          }
          else if (metadata.has('title')) {
            return state.setIn(['entityTypes', entityTypeIndex, 'title'], metadata.get('title'));
          }
          else if (metadata.has('type')) {
            // TODO: potential bug with how immutable.js deals with custom objects
            // TODO: consider storing plain object instead of FullyQualifiedName object
            return state.setIn(['entityTypes', entityTypeIndex, 'type'], metadata.get('type'));
          }

          return state;
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['updateActionsMap', seqAction.id]);
        }
      });
    }

    default:
      return state;
  }
}
