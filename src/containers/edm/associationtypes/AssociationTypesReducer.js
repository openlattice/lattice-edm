/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import {
  DELETE_ASSOCIATION_TYPE_FAILURE,
  DELETE_ASSOCIATION_TYPE_REQUEST,
  DELETE_ASSOCIATION_TYPE_SUCCESS,
  UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE,
  UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST,
  UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS,
  addDestinationEntityTypeToAssociationType,
  addSourceEntityTypeToAssociationType,
  removeDestinationEntityTypeFromAssociationType,
  removeSourceEntityTypeFromAssociationType
} from './AssociationTypesActionFactory';

import type { SequenceAction } from '../../../core/redux/RequestSequence';

const {
  createAssociationType,
  getAllAssociationTypes
} = EntityDataModelApiActionFactory;

const {
  AssociationType,
  AssociationTypeBuilder,
  EntityType,
  EntityTypeBuilder
} = Models;

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  associationTypes: Immutable.List(),
  associationTypesById: Immutable.Map(),
  isCreatingNewAssociationType: false,
  isFetchingAllAssociationTypes: false,
  newlyCreatedAssociationTypeId: '',
  tempAssociationType: null
});

export default function associationTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case DELETE_ASSOCIATION_TYPE_FAILURE:
    case DELETE_ASSOCIATION_TYPE_REQUEST:
      return state;

    case DELETE_ASSOCIATION_TYPE_SUCCESS: {

      const associationTypeId :string = action.associationTypeId;
      const associationTypeIndex :number = state.getIn(['associationTypesById', associationTypeId], -1);

      if (associationTypeIndex === -1) {
        return state;
      }
      const current :List<Map<*, *>> = state.get('associationTypes', Immutable.List());
      const updated :List<Map<*, *>> = current.delete(associationTypeIndex);

      // !!! BUG !!! - need to update id -> index mapping
      const currentById :Map<string, number> = state.get('associationTypesById', Immutable.Map());
      const updatedById :Map<string, number> = currentById.delete(associationTypeId);

      return state
        .set('associationTypes', updated)
        .set('associationTypesById', updatedById);
    }

    case UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE:
    case UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST:
      return state;

    case UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS: {

      const associationTypeId :string = action.associationTypeId;
      const associationTypeIndex :number = state.getIn(['associationTypesById', associationTypeId], -1);
      if (associationTypeIndex < 0) {
        return state;
      }

      if (action.metadata.description) {
        return state.setIn(
          ['associationTypes', associationTypeIndex, 'entityType', 'description'],
          action.metadata.description
        );
      }
      else if (action.metadata.title) {
        return state.setIn(
          ['associationTypes', associationTypeIndex, 'entityType', 'title'],
          action.metadata.title
        );
      }
      else if (action.metadata.type) {
        // TODO: potential bug with how immutable.js deals with custom objects
        // TODO: consider storing plain object instead of FullyQualifiedName object
        return state.setIn(
          ['associationTypes', associationTypeIndex, 'entityType', 'type'],
          action.metadata.type
        );
      }

      return state;
    }

    case createAssociationType.case(action.type): {
      return createAssociationType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewAssociationType', true)
            .set('newlyCreatedAssociationTypeId', '')
            .set('tempAssociationType', seqAction.value);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const newAssociationEntityTypeId :string = seqAction.value;
          const tempAssociationType :AssociationType = state.get('tempAssociationType');

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
          return state
            .set('isCreatingNewAssociationType', false)
            .set('newlyCreatedAssociationTypeId', '')
            .set('tempAssociationType', null);
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
        SUCCESS: () => {

          const seqAction = ((action :any) :SequenceAction);
          const targetId :string = seqAction.data.associationTypeId;
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const entityTypeIdToAdd :string = seqAction.data.entityTypeId;
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
        }
      });
    }

    case addSourceEntityTypeToAssociationType.case(action.type): {
      return addSourceEntityTypeToAssociationType.reducer(state, action, {
        SUCCESS: () => {

          const seqAction = ((action :any) :SequenceAction);
          const targetId :string = seqAction.data.associationTypeId;
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const entityTypeIdToAdd :string = seqAction.data.entityTypeId;
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
        }
      });
    }

    case removeDestinationEntityTypeFromAssociationType.case(action.type): {
      return removeDestinationEntityTypeFromAssociationType.reducer(state, action, {
        SUCCESS: () => {

          const seqAction = ((action :any) :SequenceAction);
          const targetId :string = seqAction.data.associationTypeId;
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Immutable.Map());
          const currentDestinationEntityTypeIds :List<string> = currentAssociationType.get('dst', Immutable.List());
          const removalIndex :number = currentDestinationEntityTypeIds.findIndex((entityTypeId :string) => {
            return entityTypeId === seqAction.data.entityTypeId;
          });

          // don't do anything if the EntityType being removed is not actually in the list
          if (removalIndex === -1) {
            return state;
          }

          const updatedDestinationEntityTypeIds :List<string> = currentDestinationEntityTypeIds.delete(removalIndex);
          const updatedAssociationType :Map<*, *> = currentAssociationType.set('dst', updatedDestinationEntityTypeIds);
          return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
        }
      });
    }

    case removeSourceEntityTypeFromAssociationType.case(action.type): {
      return removeSourceEntityTypeFromAssociationType.reducer(state, action, {
        SUCCESS: () => {

          const seqAction = ((action :any) :SequenceAction);
          const targetId :string = seqAction.data.associationTypeId;
          const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);

          // don't do anything if the AssociationType being modified isn't available
          if (targetIndex === -1) {
            return state;
          }

          const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Immutable.Map());
          const currentSourceEntityTypeIds :List<string> = currentAssociationType.get('src', Immutable.List());
          const removalIndex :number = currentSourceEntityTypeIds.findIndex((entityTypeId :string) => {
            return entityTypeId === seqAction.data.entityTypeId;
          });

          // don't do anything if the EntityType being removed is not actually in the list
          if (removalIndex === -1) {
            return state;
          }

          const updatedSourceEntityTypeIds :List<string> = currentSourceEntityTypeIds.delete(removalIndex);
          const updatedAssociationType :Map<*, *> = currentAssociationType.set('src', updatedSourceEntityTypeIds);
          return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
        }
      });
    }

    default:
      return state;
  }
}
