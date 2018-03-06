/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

const {
  addDestinationEntityTypeToAssociationType,
  addPropertyTypeToEntityType,
  addSourceEntityTypeToAssociationType,
  createAssociationType,
  deleteAssociationType,
  getAllAssociationTypes,
  removeDestinationEntityTypeFromAssociationType,
  removePropertyTypeFromEntityType,
  removeSourceEntityTypeFromAssociationType,
  reorderEntityTypePropertyTypes,
  updateAssociationTypeMetaData
} = EntityDataModelApiActionFactory;

const {
  AssociationType,
  AssociationTypeBuilder,
  EntityType,
  EntityTypeBuilder
} = Models;

const INITIAL_STATE :Map<*, *> = fromJS({
  actions: {
    addDestinationEntityTypeToAssociationType: Map(),
    addPropertyTypeToEntityType: Map(),
    addSourceEntityTypeToAssociationType: Map(),
    createAssociationType: Map(),
    deleteAssociationType: Map(),
    removeDestinationEntityTypeFromAssociationType: Map(),
    removePropertyTypeFromEntityType: Map(),
    removeSourceEntityTypeFromAssociationType: Map(),
    reorderEntityTypePropertyTypes: Map(),
    updateAssociationTypeMetaData: Map()
  },
  associationTypes: List(),
  associationTypesById: Map(),
  isCreatingNewAssociationType: false,
  isFetchingAllAssociationTypes: false,
  newlyCreatedAssociationTypeId: ''
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

    case getAllAssociationTypes.case(action.type): {
      return getAllAssociationTypes.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingAllAssociationTypes', true);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);

          if (seqAction.value) {
            const allAssociationTypes :List<Map<*, *>> = fromJS(seqAction.value);
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

    case addDestinationEntityTypeToAssociationType.case(action.type): {
      return addDestinationEntityTypeToAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(
            ['actions', 'addDestinationEntityTypeToAssociationType', seqAction.id],
            fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'addDestinationEntityTypeToAssociationType', seqAction.id],
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
          return state.deleteIn(['actions', 'addDestinationEntityTypeToAssociationType', seqAction.id]);
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

    case addSourceEntityTypeToAssociationType.case(action.type): {
      return addSourceEntityTypeToAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(
            ['actions', 'addSourceEntityTypeToAssociationType', seqAction.id],
            fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'addSourceEntityTypeToAssociationType', seqAction.id],
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
          return state.deleteIn(['actions', 'addSourceEntityTypeToAssociationType', seqAction.id]);
        }
      });
    }

    case removeDestinationEntityTypeFromAssociationType.case(action.type): {
      return removeDestinationEntityTypeFromAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(
            ['actions', 'removeDestinationEntityTypeFromAssociationType', seqAction.id],
            fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'removeDestinationEntityTypeFromAssociationType', seqAction.id],
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
          return state.deleteIn(['actions', 'removeDestinationEntityTypeFromAssociationType', seqAction.id]);
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

    case removeSourceEntityTypeFromAssociationType.case(action.type): {
      return removeSourceEntityTypeFromAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(
            ['actions', 'removeSourceEntityTypeFromAssociationType', seqAction.id],
            fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'removeSourceEntityTypeFromAssociationType', seqAction.id],
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
          return state.deleteIn(['actions', 'removeSourceEntityTypeFromAssociationType', seqAction.id]);
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

          const associationTypeId :string = storedSeqAction.getIn(['value', 'id']);
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
          else if (metadata.has('title')) {
            return state.setIn(
              ['associationTypes', associationTypeIndex, 'entityType', 'title'],
              metadata.get('title')
            );
          }
          else if (metadata.has('type')) {
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

    default:
      return state;
  }
}
