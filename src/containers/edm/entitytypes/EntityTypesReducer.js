/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

const {
  addPropertyTypeToEntityType,
  createEntityType,
  deleteEntityType,
  getEntityDataModel,
  removePropertyTypeFromEntityType,
  reorderEntityTypePropertyTypes,
  updateEntityTypeMetaData,
  updateSchema,
} = EntityDataModelApiActions;

const {
  EntityType,
  EntityTypeBuilder,
  FullyQualifiedName,
} = Models;

const {
  ActionTypes,
} = Types;

const INITIAL_STATE :Map<*, *> = fromJS({
  actions: {
    addPropertyTypeToEntityType: Map(),
    createEntityType: Map(),
    deleteEntityType: Map(),
    removePropertyTypeFromEntityType: Map(),
    reorderEntityTypePropertyTypes: Map(),
    updateEntityTypeMetaData: Map(),
    updateSchema: Map(),
  },
  entityTypes: List(),
  entityTypesById: Map(),
  isCreatingNewEntityType: false,
  isFetchingAllEntityTypes: false,
  newlyCreatedEntityTypeId: '',
});

export default function entityTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case createEntityType.case(action.type): {
      return createEntityType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewEntityType', true)
            .set('newlyCreatedEntityTypeId', '')
            .setIn(['actions', 'createEntityType', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'createEntityType', seqAction.id], Map());

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const newEntityTypeId :string = (seqAction.value :any);
          const tempEntityType :EntityType = storedSeqAction.get('value');

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
          const current :List<Map<*, *>> = state.get('entityTypes', List());
          const updated :List<Map<*, *>> = current.push(iEntityType);

          const currentById :Map<string, number> = state.get('entityTypesById', Map());
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
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewEntityType', false)
            .set('newlyCreatedEntityTypeId', '')
            .deleteIn(['actions', 'createEntityType', seqAction.id]);
        }
      });
    }

    case deleteEntityType.case(action.type): {
      return deleteEntityType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'deleteEntityType', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'deleteEntityType', seqAction.id], Map());
          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetId :string = storedSeqAction.get('value');
          const targetIndex :number = state.getIn(['entityTypesById', targetId], -1);
          if (targetIndex === -1) {
            return state;
          }

          const currentEntityTypes :List<Map<*, *>> = state.get('entityTypes', List());
          const updatedEntityTypes :List<Map<*, *>> = currentEntityTypes.delete(targetIndex);
          const updatedEntityTypesById :Map<string, number> = Map()
            .withMutations((byIdMap :Map<string, number>) => {
              updatedEntityTypes.forEach((entityType :Map<*, *>, entityTypeIndex :number) => {
                byIdMap.set(entityType.get('id'), entityTypeIndex);
              });
            });

          return state
            .set('entityTypes', updatedEntityTypes)
            .set('entityTypesById', updatedEntityTypesById);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'deleteEntityType', seqAction.id]);
        }
      });
    }

    case getEntityDataModel.case(action.type): {
      return getEntityDataModel.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingAllEntityTypes', true);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);

          if (seqAction.value) {
            const allEntityTypes :List<Map<*, *>> = fromJS(seqAction.value.entityTypes);
            const entityTypesStrict :List<Map<*, *>> = allEntityTypes.filter((entityType :Map<*, *>) => {
              return entityType.get('category') === 'EntityType';
            });
            const entityTypesById :Map<string, number> = Map()
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
            .set('entityTypes', List())
            .set('entityTypesById', Map());
        },
        FINALLY: () => {
          return state.set('isFetchingAllEntityTypes', false);
        }
      });
    }

    case addPropertyTypeToEntityType.case(action.type): {
      return addPropertyTypeToEntityType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'addPropertyTypeToEntityType', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'addPropertyTypeToEntityType', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetId :string = storedSeqAction.getIn(['value', 'entityTypeId']);
          const targetIndex :number = state.getIn(['entityTypesById', targetId], -1);

          // don't do anything if the EntityType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const propertyTypeIdToAdd :string = storedSeqAction.getIn(['value', 'propertyTypeId']);
          const currentEntityType :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
          const currentPropertyTypeIds :List<string> = currentEntityType.get('properties', List());
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
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'addPropertyTypeToEntityType', seqAction.id]);
        }
      });
    }

    case removePropertyTypeFromEntityType.case(action.type): {
      return removePropertyTypeFromEntityType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'removePropertyTypeFromEntityType', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'removePropertyTypeFromEntityType', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetId :string = storedSeqAction.getIn(['value', 'entityTypeId']);
          const targetIndex :number = state.getIn(['entityTypesById', targetId], -1);

          // don't do anything if the EntityType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const currentEntityType :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
          const currentPropertyTypeIds :List<string> = currentEntityType.get('properties', List());
          const removalIndex :number = currentPropertyTypeIds.findIndex((propertyTypeId :string) => {
            return propertyTypeId === storedSeqAction.getIn(['value', 'propertyTypeId']);
          });

          // don't do anything if the PropertyType being removed is not actually in the list
          if (removalIndex === -1) {
            return state;
          }

          const updatedPropertyTypeIds :List<string> = currentPropertyTypeIds.delete(removalIndex);
          const updatedEntityType :Map<*, *> = currentEntityType.set('properties', updatedPropertyTypeIds);
          return state.setIn(['entityTypes', targetIndex], updatedEntityType);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'removePropertyTypeFromEntityType', seqAction.id]);
        }
      });
    }

    case reorderEntityTypePropertyTypes.case(action.type): {
      return reorderEntityTypePropertyTypes.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'reorderEntityTypePropertyTypes', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'reorderEntityTypePropertyTypes', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetId :string = storedSeqAction.getIn(['value', 'entityTypeId']);
          const targetIndex :number = state.getIn(['entityTypesById', targetId], -1);

          // don't do anything if the EntityType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const reorderedPropertyTypeIds :List<string> = storedSeqAction.getIn(['value', 'propertyTypeIds'], List());
          const currentEntityType :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
          const updatedEntityType :Map<*, *> = currentEntityType.set('properties', reorderedPropertyTypeIds);
          return state.setIn(['entityTypes', targetIndex], updatedEntityType);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'reorderEntityTypePropertyTypes', seqAction.id]);
        }
      });
    }

    case updateEntityTypeMetaData.case(action.type): {
      return updateEntityTypeMetaData.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'updateEntityTypeMetaData', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'updateEntityTypeMetaData', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const entityTypeId :string = storedSeqAction.getIn(['value', 'entityTypeId']);
          const entityTypeIndex :number = state.getIn(['entityTypesById', entityTypeId], -1);
          if (entityTypeIndex < 0) {
            return state;
          }

          const metadata :Map<*, *> = storedSeqAction.getIn(['value', 'metadata']);
          if (metadata.has('description')) {
            return state.setIn(['entityTypes', entityTypeIndex, 'description'], metadata.get('description'));
          }
          if (metadata.has('title')) {
            return state.setIn(['entityTypes', entityTypeIndex, 'title'], metadata.get('title'));
          }
          if (metadata.has('type')) {
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
          return state.deleteIn(['actions', 'updateEntityTypeMetaData', seqAction.id]);
        }
      });
    }

    case updateSchema.case(action.type): {
      return updateSchema.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn(['actions', 'updateSchema', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'updateSchema', seqAction.id], Map());
          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const schemaFqn :FullyQualifiedName = new FullyQualifiedName(storedSeqAction.getIn(['value', 'schemaFqn']));
          const actionEntityTypeIds :List<string> = storedSeqAction.getIn(['value', 'entityTypeIds'], List());
          // TODO: ":string" should be ":ActionType"
          const actionType :string = storedSeqAction.getIn(['value', 'action']);

          let updatedState :Map<*, *> = state;
          actionEntityTypeIds.forEach((entityTypeId :string) => {
            const entityTypeIndex :number = state.getIn(['entityTypesById', entityTypeId], -1);
            if (entityTypeIndex >= 0) {
              const existingSchemas :List<FullyQualifiedName> = updatedState.getIn(
                ['entityTypes', entityTypeIndex, 'schemas'],
                List(),
              );
              if (actionType === ActionTypes.ADD) {
                const updatedSchemas :List<FullyQualifiedName> = existingSchemas.push(schemaFqn);
                updatedState = updatedState.setIn(['entityTypes', entityTypeIndex, 'schemas'], updatedSchemas);
              }
              else if (actionType === ActionTypes.REMOVE) {
                const targetIndex :number = existingSchemas.findIndex((fqn :FullyQualifiedName) => (
                  FullyQualifiedName.toString(fqn) === schemaFqn.toString()
                ));
                if (targetIndex >= 0) {
                  const updatedSchemas :List<FullyQualifiedName> = existingSchemas.delete(targetIndex);
                  updatedState = updatedState.setIn(['entityTypes', entityTypeIndex, 'schemas'], updatedSchemas);
                }
              }
            }
          });

          return updatedState;
        },
        FAILURE: () => {
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn(['actions', 'updateSchema', seqAction.id]);
        },
      });
    }

    default:
      return state;
  }
}
