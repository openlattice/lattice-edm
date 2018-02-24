/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import Immutable from 'immutable';
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
  updateAssociationTypeMetaData
} = EntityDataModelApiActionFactory;

const {
  AssociationType,
  AssociationTypeBuilder,
  EntityType,
  EntityTypeBuilder
} = Models;

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  actions: {
    addDestinationEntityTypeToAssociationType: Immutable.Map(),
    addPropertyTypeToEntityType: Immutable.Map(),
    addSourceEntityTypeToAssociationType: Immutable.Map(),
    createAssociationType: Immutable.Map(),
    deleteAssociationType: Immutable.Map(),
    removeDestinationEntityTypeFromAssociationType: Immutable.Map(),
    removePropertyTypeFromEntityType: Immutable.Map(),
    removeSourceEntityTypeFromAssociationType: Immutable.Map(),
    updateAssociationTypeMetaData: Immutable.Map()
  },
  associationTypes: Immutable.List(),
  associationTypesById: Immutable.Map(),
  isCreatingNewAssociationType: false,
  isFetchingAllAssociationTypes: false,
  newlyCreatedAssociationTypeId: ''
});

export default function associationTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case createAssociationType.case(action.type): {
      return createAssociationType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewAssociationType', true)
            .set('newlyCreatedAssociationTypeId', '')
            .setIn(
              ['actions', 'createAssociationType', seqAction.id],
              Immutable.fromJS(seqAction)
            );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'createAssociationType', seqAction.id],
            Immutable.Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const newAssociationEntityTypeId :string = seqAction.value;
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
          const current :List<Map<*, *>> = state.get('associationTypes', Immutable.List());
          const updated :List<Map<*, *>> = current.push(iAssociationType);

          const currentById :Map<string, number> = state.get('associationTypesById', Immutable.Map());
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
          return state.setIn(
            ['actions', 'deleteAssociationType', seqAction.id],
            Immutable.fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'deleteAssociationType', seqAction.id],
            Immutable.Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const associationTypeId :string = storedSeqAction.get('value');
          const associationTypeIndex :number = state.getIn(['associationTypesById', associationTypeId], -1);

          if (associationTypeIndex === -1) {
            return state;
          }

          const current :List<Map<*, *>> = state.get('associationTypes', Immutable.List());
          const updated :List<Map<*, *>> = current.delete(associationTypeIndex);

          // !!! BUG !!! - need to update id -> index mapping
          // TODO: fix bug
          const currentById :Map<string, number> = state.get('associationTypesById', Immutable.Map());
          const updatedById :Map<string, number> = currentById.delete(associationTypeId);

          return state
            .set('associationTypes', updated)
            .set('associationTypesById', updatedById);
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
            const allAssociationTypes :List<Map<*, *>> = Immutable.fromJS(seqAction.value);
            const associationTypesById :Map<string, number> = Immutable.Map()
              .withMutations((byIdMap :Map<string, number>) => {
                allAssociationTypes.forEach((associationType :Map<*, *>, associationTypeIndex :number) => {
                  const entityType :Map<*, *> = associationType.get('entityType', Immutable.Map());
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
            .set('associationTypes', Immutable.List())
            .set('associationTypesById', Immutable.Map());
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
            Immutable.fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'addDestinationEntityTypeToAssociationType', seqAction.id],
            Immutable.Map()
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
          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Immutable.Map());
          const currentDestinationEntityTypeIds :List<string> = currentAssociationType.get('dst', Immutable.List());
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
          return state.setIn(
            ['actions', 'addPropertyTypeToEntityType', seqAction.id],
            Immutable.fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'addPropertyTypeToEntityType', seqAction.id],
            Immutable.Map()
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
          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Immutable.Map());
          const currentPropertyTypeIds :List<string> = currentAssociationType.getIn(
            ['entityType', 'properties'],
            Immutable.List()
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
            Immutable.fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'addSourceEntityTypeToAssociationType', seqAction.id],
            Immutable.Map()
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
          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Immutable.Map());
          const currentSourceEntityTypeIds :List<string> = currentAssociationType.get('src', Immutable.List());
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
            Immutable.fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'removeDestinationEntityTypeFromAssociationType', seqAction.id],
            Immutable.Map()
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

          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Immutable.Map());
          const currentDestinationEntityTypeIds :List<string> = currentAssociationType.get('dst', Immutable.List());
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
          return state.setIn(
            ['actions', 'removePropertyTypeFromEntityType', seqAction.id],
            Immutable.fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'removePropertyTypeFromEntityType', seqAction.id],
            Immutable.Map()
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

          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Immutable.Map());
          const currentPropertyTypeIds :List<string> = currentAssociationType.getIn(
            ['entityType', 'properties'],
            Immutable.List()
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
            Immutable.fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'removeSourceEntityTypeFromAssociationType', seqAction.id],
            Immutable.Map()
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

          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Immutable.Map());
          const currentSourceEntityTypeIds :List<string> = currentAssociationType.get('src', Immutable.List());
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

    case updateAssociationTypeMetaData.case(action.type): {
      return updateAssociationTypeMetaData.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(
            ['actions', 'updateAssociationTypeMetaData', seqAction.id],
            Immutable.fromJS(seqAction)
          );
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'updateAssociationTypeMetaData', seqAction.id],
            Immutable.Map()
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
