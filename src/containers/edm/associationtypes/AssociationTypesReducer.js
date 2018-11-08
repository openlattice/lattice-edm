/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

const {
  addDstEntityTypeToAssociationType,
  addPropertyTypeToEntityType,
  addSrcEntityTypeToAssociationType,
  createAssociationType,
  deleteAssociationType,
  getEntityDataModel,
  removeDstEntityTypeFromAssociationType,
  removePropertyTypeFromEntityType,
  removeSrcEntityTypeFromAssociationType,
  reorderEntityTypePropertyTypes,
  updateAssociationTypeMetaData,
  updateSchema,
} = EntityDataModelApiActions;

const {
  AssociationType,
  AssociationTypeBuilder,
  EntityType,
  EntityTypeBuilder,
  FullyQualifiedName,
} = Models;

const {
  ActionTypes,
} = Types;

const INITIAL_STATE :Map<*, *> = fromJS({
  actions: {
    addDstEntityTypeToAssociationType: Map(),
    addPropertyTypeToEntityType: Map(),
    addSrcEntityTypeToAssociationType: Map(),
    createAssociationType: Map(),
    deleteAssociationType: Map(),
    removeDstEntityTypeFromAssociationType: Map(),
    removePropertyTypeFromEntityType: Map(),
    removeSrcEntityTypeFromAssociationType: Map(),
    reorderEntityTypePropertyTypes: Map(),
    updateAssociationTypeMetaData: Map(),
    updateSchema: Map(),
  },
  associationTypes: List(),
  associationTypesById: Map(),
  isCreatingNewAssociationType: false,
  isFetchingAllAssociationTypes: false,
  newlyCreatedAssociationTypeId: '',
});

export default function associationTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case createAssociationType.case(action.type): {
      return createAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewAssociationType', true)
            .set('newlyCreatedAssociationTypeId', '')
            .setIn(['actions', 'createAssociationType', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'createAssociationType', seqAction.id], Map());

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const newAssociationEntityTypeId :string = (seqAction.value :any);
          const tempAssociationType :AssociationType = storedSeqAction.get('value');

          const newAssociationEntityType :EntityType = new EntityTypeBuilder()
            .setId(newAssociationEntityTypeId)
            .setType(tempAssociationType.entityType.type)
            .setTitle(tempAssociationType.entityType.title)
            .setDescription(tempAssociationType.entityType.description)
            .setKey(tempAssociationType.entityType.key)
            .setPropertyTypes(tempAssociationType.entityType.properties)
            .setBaseType(tempAssociationType.entityType.baseType)
            .setCategory(tempAssociationType.entityType.category)
            .setSchemas(tempAssociationType.entityType.schemas)
            .build();

          const newAssociationType :AssociationType = new AssociationTypeBuilder()
            .setEntityType(newAssociationEntityType)
            .setSourceEntityTypeIds(tempAssociationType.src)
            .setDestinationEntityTypeIds(tempAssociationType.dst)
            .setBidirectional(tempAssociationType.bidirectional)
            .build();

          const iAssociationType :Map<*, *> = newAssociationType.asImmutable();
          const current :List<Map<*, *>> = state.get('associationTypes', List());
          const updated :List<Map<*, *>> = current.push(iAssociationType);

          const currentById :Map<string, number> = state.get('associationTypesById', Map());
          const updatedById :Map<string, number> = currentById.set(newAssociationEntityTypeId, updated.size - 1);

          return state
            .set('newlyCreatedAssociationTypeId', newAssociationEntityTypeId)
            .set('associationTypes', updated)
            .set('associationTypesById', updatedById);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewAssociationType', false)
            .set('newlyCreatedAssociationTypeId', '')
            .deleteIn(['actions', 'createAssociationType', seqAction.id]);
        }
      });
    }

    case deleteAssociationType.case(action.type): {
      return deleteAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'deleteAssociationType', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'deleteAssociationType', seqAction.id], Map());
          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetId :string = storedSeqAction.get('value');
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);
          if (targetIndex === -1) {
            return state;
          }

          const currentAssociationTypes :List<Map<*, *>> = state.get('associationTypes', List());
          const updatedAssociationTypes :List<Map<*, *>> = currentAssociationTypes.delete(targetIndex);
          const updatedAssociationTypesById :Map<string, number> = Map()
            .withMutations((byIdMap :Map<string, number>) => {
              updatedAssociationTypes.forEach((associationType :Map<*, *>, associationTypeIndex :number) => {
                const entityType :Map<*, *> = associationType.get('entityType', Map());
                byIdMap.set(entityType.get('id'), associationTypeIndex);
              });
            });

          return state
            .set('associationTypes', updatedAssociationTypes)
            .set('associationTypesById', updatedAssociationTypesById);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'deleteAssociationType', seqAction.id]);
        }
      });
    }

    case getEntityDataModel.case(action.type): {
      return getEntityDataModel.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingAllAssociationTypes', true);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);

          if (seqAction.value) {
            const allAssociationTypes :List<Map<*, *>> = fromJS(seqAction.value.associationTypes);
            const associationTypesById :Map<string, number> = Map()
              .withMutations((byIdMap :Map<string, number>) => {
                allAssociationTypes.forEach((associationType :Map<*, *>, associationTypeIndex :number) => {
                  const entityType :Map<*, *> = associationType.get('entityType', Map());
                  byIdMap.set(entityType.get('id'), associationTypeIndex);
                });
              });

            return state
              .set('associationTypes', allAssociationTypes)
              .set('associationTypesById', associationTypesById);
          }

          return state;
        },
        FAILURE: () => {
          return state
            .set('associationTypes', List())
            .set('associationTypesById', Map());
        },
        FINALLY: () => {
          return state.set('isFetchingAllAssociationTypes', false);
        }
      });
    }

    case addDstEntityTypeToAssociationType.case(action.type): {
      return addDstEntityTypeToAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(
            ['actions', 'addDstEntityTypeToAssociationType', seqAction.id],
            fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'addDstEntityTypeToAssociationType', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const entityTypeIdToAdd :string = storedSeqAction.getIn(['value', 'entityTypeId']);
          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
          const currentDestinationEntityTypeIds :List<string> = currentAssociationType.get('dst', List());
          const entityTypeIndex :number = currentDestinationEntityTypeIds.findIndex((entityTypeId :string) => {
            return entityTypeId === entityTypeIdToAdd;
          });

          // don't do anything if the EntityType being added is already in the list
          if (entityTypeIndex !== -1) {
            return state;
          }

          const updatedDestinationEntityTypeIds :List<string> = currentDestinationEntityTypeIds.push(entityTypeIdToAdd);
          const updatedAssociationType :Map<*, *> = currentAssociationType.set('dst', updatedDestinationEntityTypeIds);
          return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'addDstEntityTypeToAssociationType', seqAction.id]);
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
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const propertyTypeIdToAdd :string = storedSeqAction.getIn(['value', 'propertyTypeId']);
          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
          const currentPropertyTypeIds :List<string> = currentAssociationType.getIn(
            ['entityType', 'properties'],
            List()
          );
          const propertyTypeIndex :number = currentPropertyTypeIds.findIndex((propertyTypeId :string) => {
            return propertyTypeId === propertyTypeIdToAdd;
          });

          // don't do anything if the PropertyType being added is already in the list
          if (propertyTypeIndex !== -1) {
            return state;
          }

          const updatedPropertyTypeIds :List<string> = currentPropertyTypeIds.push(propertyTypeIdToAdd);
          const updatedAssociationType :Map<*, *> = currentAssociationType.setIn(
            ['entityType', 'properties'],
            updatedPropertyTypeIds
          );
          return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
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

    case addSrcEntityTypeToAssociationType.case(action.type): {
      return addSrcEntityTypeToAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(
            ['actions', 'addSrcEntityTypeToAssociationType', seqAction.id],
            fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'addSrcEntityTypeToAssociationType', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const entityTypeIdToAdd :string = storedSeqAction.getIn(['value', 'entityTypeId']);
          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
          const currentSourceEntityTypeIds :List<string> = currentAssociationType.get('src', List());
          const entityTypeIndex :number = currentSourceEntityTypeIds.findIndex((entityTypeId :string) => {
            return entityTypeId === entityTypeIdToAdd;
          });

          // don't do anything if the EntityType being added is already in the list
          if (entityTypeIndex !== -1) {
            return state;
          }

          const updatedSourceEntityTypeIds :List<string> = currentSourceEntityTypeIds.push(entityTypeIdToAdd);
          const updatedAssociationType :Map<*, *> = currentAssociationType.set('src', updatedSourceEntityTypeIds);
          return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'addSrcEntityTypeToAssociationType', seqAction.id]);
        }
      });
    }

    case removeDstEntityTypeFromAssociationType.case(action.type): {
      return removeDstEntityTypeFromAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(
            ['actions', 'removeDstEntityTypeFromAssociationType', seqAction.id],
            fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'removeDstEntityTypeFromAssociationType', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
          const currentDestinationEntityTypeIds :List<string> = currentAssociationType.get('dst', List());
          const removalIndex :number = currentDestinationEntityTypeIds.findIndex((entityTypeId :string) => {
            return entityTypeId === storedSeqAction.getIn(['value', 'entityTypeId']);
          });

          // don't do anything if the EntityType being removed is not actually in the list
          if (removalIndex === -1) {
            return state;
          }

          const updatedDestinationEntityTypeIds :List<string> = currentDestinationEntityTypeIds.delete(removalIndex);
          const updatedAssociationType :Map<*, *> = currentAssociationType.set('dst', updatedDestinationEntityTypeIds);
          return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'removeDstEntityTypeFromAssociationType', seqAction.id]);
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
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
          const currentPropertyTypeIds :List<string> = currentAssociationType.getIn(
            ['entityType', 'properties'],
            List()
          );
          const removalIndex :number = currentPropertyTypeIds.findIndex((propertyTypeId :string) => {
            return propertyTypeId === storedSeqAction.getIn(['value', 'propertyTypeId']);
          });

          // don't do anything if the PropertyType being removed is not actually in the list
          if (removalIndex === -1) {
            return state;
          }

          const updatedPropertyTypeIds :List<string> = currentPropertyTypeIds.delete(removalIndex);
          const updatedAssociationType :Map<*, *> = currentAssociationType.setIn(
            ['entityType', 'properties'],
            updatedPropertyTypeIds
          );
          return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
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

    case removeSrcEntityTypeFromAssociationType.case(action.type): {
      return removeSrcEntityTypeFromAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(
            ['actions', 'removeSrcEntityTypeFromAssociationType', seqAction.id],
            fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'removeSrcEntityTypeFromAssociationType', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
          const currentSourceEntityTypeIds :List<string> = currentAssociationType.get('src', List());
          const removalIndex :number = currentSourceEntityTypeIds.findIndex((entityTypeId :string) => {
            return entityTypeId === storedSeqAction.getIn(['value', 'entityTypeId']);
          });

          // don't do anything if the EntityType being removed is not actually in the list
          if (removalIndex === -1) {
            return state;
          }

          const updatedSourceEntityTypeIds :List<string> = currentSourceEntityTypeIds.delete(removalIndex);
          const updatedAssociationType :Map<*, *> = currentAssociationType.set('src', updatedSourceEntityTypeIds);
          return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'removeSrcEntityTypeFromAssociationType', seqAction.id]);
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
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const reorderedPropertyTypeIds :List<string> = storedSeqAction.getIn(['value', 'propertyTypeIds'], List());
          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
          const updatedAssociationType :Map<*, *> = currentAssociationType.setIn(
            ['entityType', 'properties'],
            reorderedPropertyTypeIds
          );

          return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
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

    case updateAssociationTypeMetaData.case(action.type): {
      return updateAssociationTypeMetaData.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'updateAssociationTypeMetaData', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'updateAssociationTypeMetaData', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const associationTypeId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
          const associationTypeIndex :number = state.getIn(['associationTypesById', associationTypeId], -1);
          if (associationTypeIndex < 0) {
            return state;
          }

          const metadata :Map<*, *> = storedSeqAction.getIn(['value', 'metadata']);
          if (metadata.has('description')) {
            return state.setIn(
              ['associationTypes', associationTypeIndex, 'entityType', 'description'],
              metadata.get('description')
            );
          }
          if (metadata.has('title')) {
            return state.setIn(
              ['associationTypes', associationTypeIndex, 'entityType', 'title'],
              metadata.get('title')
            );
          }
          if (metadata.has('type')) {
            // TODO: potential bug with how immutable.js deals with custom objects
            // TODO: consider storing plain object instead of FullyQualifiedName object
            return state.setIn(
              ['associationTypes', associationTypeIndex, 'entityType', 'type'],
              metadata.get('type')
            );
          }

          return state;
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'updateAssociationTypeMetaData', seqAction.id]);
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
          const actionAssociationTypeIds :List<string> = storedSeqAction.getIn(['value', 'entityTypeIds'], List());
          // TODO: ":string" should be ":ActionType"
          const actionType :string = storedSeqAction.getIn(['value', 'action']);

          let updatedState :Map<*, *> = state;
          actionAssociationTypeIds.forEach((associationTypeId :string) => {
            const associationTypeIndex :number = state.getIn(['associationTypesById', associationTypeId], -1);
            if (associationTypeIndex >= 0) {
              const existingSchemas :List<FullyQualifiedName> = updatedState.getIn(
                ['associationTypes', associationTypeIndex, 'entityType', 'schemas'],
                List(),
              );
              if (actionType === ActionTypes.ADD) {
                const updatedSchemas :List<FullyQualifiedName> = existingSchemas.push(schemaFqn);
                updatedState = updatedState.setIn(
                  ['associationTypes', associationTypeIndex, 'entityType', 'schemas'],
                  updatedSchemas,
                );
              }
              else if (actionType === ActionTypes.REMOVE) {
                const targetIndex :number = existingSchemas.findIndex((fqn :FullyQualifiedName) => (
                  FullyQualifiedName.toString(fqn) === schemaFqn.toString()
                ));
                if (targetIndex >= 0) {
                  const updatedSchemas :List<FullyQualifiedName> = existingSchemas.delete(targetIndex);
                  updatedState = updatedState.setIn(
                    ['associationTypes', associationTypeIndex, 'entityType', 'schemas'],
                    updatedSchemas,
                  );
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
