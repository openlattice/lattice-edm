/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';
import type { FQN, AssociationTypeObject } from 'lattice';

import Logger from '../../../utils/Logger';
import { isValidUUID } from '../../../utils/ValidationUtils';
import {
  LOCAL_ADD_PT_TO_AT,
  LOCAL_CREATE_ASSOCIATION_TYPE,
  LOCAL_DELETE_ASSOCIATION_TYPE,
  LOCAL_REMOVE_PT_FROM_AT,
  LOCAL_UPDATE_ASSOCIATION_TYPE_META,
  localAddPropertyTypeToAssociationType,
  localCreateAssociationType,
  localDeleteAssociationType,
  localRemovePropertyTypeFromAssociationType,
  localUpdateAssociationTypeMeta,
} from './AssociationTypesActions';
import type { IndexMap } from '../Types';

const LOG :Logger = new Logger('AssociationTypesReducer');

const {
  getEntityDataModel,
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
  [LOCAL_ADD_PT_TO_AT]: { error: false },
  [LOCAL_CREATE_ASSOCIATION_TYPE]: { error: false },
  [LOCAL_DELETE_ASSOCIATION_TYPE]: { error: false },
  [LOCAL_REMOVE_PT_FROM_AT]: { error: false },
  [LOCAL_UPDATE_ASSOCIATION_TYPE_META]: { error: false },
  associationTypes: List(),
  associationTypesIndexMap: Map(),
  newlyCreatedAssociationTypeFQN: undefined,
});

export default function associationTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getEntityDataModel.case(action.type): {
      return getEntityDataModel.reducer(state, action, {
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const responseAssociationTypes :AssociationTypeObject[] = seqAction.value.associationTypes;
          if (!responseAssociationTypes || responseAssociationTypes.length === 0) {
            LOG.error('getEntityDataModel() - AssociationTypes missing', responseAssociationTypes);
            return state;
          }

          const associationTypes :List<Map<*, *>> = List().asMutable();
          const associationTypesIndexMap :IndexMap = Map().asMutable();

          responseAssociationTypes.forEach((at :AssociationTypeObject, index :number) => {
            try {
              const associationTypeId :?UUID = at.entityType.id;
              const associationTypeFQN :FQN = new FullyQualifiedName(at.entityType.type);

              const entityType :EntityType = new EntityTypeBuilder()
                .setBaseType(at.entityType.baseType)
                .setCategory(at.entityType.category)
                .setDescription(at.entityType.description)
                .setId(associationTypeId)
                .setKey(at.entityType.key)
                .setPropertyTypes(at.entityType.properties)
                .setSchemas(at.entityType.schemas)
                .setTitle(at.entityType.title)
                .setType(associationTypeFQN)
                .build();

              const associationType = new AssociationTypeBuilder()
                .setBidirectional(at.bidirectional)
                .setDestinationEntityTypeIds(at.dst)
                .setEntityType(entityType)
                .setSourceEntityTypeIds(at.src)
                .build();
              associationTypes.push(associationType.toImmutable());
              /*
               * IMPORTANT! we must keep the fqn and id index mapping in sync!
               */
              associationTypesIndexMap.set(associationTypeId, index);
              associationTypesIndexMap.set(associationTypeFQN, index);
            }
            catch (e) {
              LOG.error('getEntityDataModel()', e);
            }
          });

          return state
            .set('associationTypes', associationTypes.asImmutable())
            .set('associationTypesIndexMap', associationTypesIndexMap.asImmutable());
        },
        FAILURE: () => {
          return state
            .set('associationTypes', List())
            .set('associationTypesIndexMap', Map());
        },
      });
    }

    case localCreateAssociationType.case(action.type): {
      return localCreateAssociationType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state
            .setIn([LOCAL_CREATE_ASSOCIATION_TYPE, seqAction.id], seqAction)
            .set('newlyCreatedAssociationTypeFQN', undefined);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_CREATE_ASSOCIATION_TYPE, seqAction.id]);

          if (storedSeqAction) {

            const storedAssociationType :AssociationType = storedSeqAction.value;
            const associationTypeFQN :FQN = new FullyQualifiedName(storedAssociationType.entityType.type);
            const associationTypeId :?UUID = seqAction.value; // id won't be available in "offline" mode

            const newAssociationTypeEntityType :EntityType = new EntityTypeBuilder()
              .setBaseType(storedAssociationType.entityType.baseType)
              .setCategory(storedAssociationType.entityType.category)
              .setDescription(storedAssociationType.entityType.description)
              .setId(associationTypeId)
              .setKey(storedAssociationType.entityType.key)
              .setPropertyTypes(storedAssociationType.entityType.properties)
              .setSchemas(storedAssociationType.entityType.schemas)
              .setTitle(storedAssociationType.entityType.title)
              .setType(associationTypeFQN)
              .build();

            const newAssociationType :AssociationType = new AssociationTypeBuilder()
              .setBidirectional(storedAssociationType.bidirectional)
              .setDestinationEntityTypeIds(storedAssociationType.dst)
              .setEntityType(newAssociationTypeEntityType)
              .setSourceEntityTypeIds(storedAssociationType.src)
              .build();

            const updatedAssociationTypes :List<Map<*, *>> = state
              .get('associationTypes')
              .push(newAssociationType.toImmutable());

            const newAssociationTypeIndex :number = updatedAssociationTypes.count() - 1;

            /*
             * IMPORTANT! we must keep the fqn and the id index mapping in sync!
             */
            let updatedAssociationTypesIndexMap :IndexMap = state
              .get('associationTypesIndexMap')
              .set(associationTypeFQN, newAssociationTypeIndex);
            if (isValidUUID(associationTypeId)) {
              updatedAssociationTypesIndexMap = updatedAssociationTypesIndexMap
                .set(associationTypeId, newAssociationTypeIndex);
            }

            return state
              .set('associationTypes', updatedAssociationTypes)
              .set('associationTypesIndexMap', updatedAssociationTypesIndexMap)
              .set('newlyCreatedAssociationTypeFQN', associationTypeFQN);
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_CREATE_ASSOCIATION_TYPE, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state
              .setIn([LOCAL_CREATE_ASSOCIATION_TYPE, 'error'], true)
              .set('newlyCreatedAssociationTypeFQN', undefined);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_CREATE_ASSOCIATION_TYPE, seqAction.id]);
        },
      });
    }

    // case deleteAssociationType.case(action.type): {
    //   return deleteAssociationType.reducer(state, action, {
    //     REQUEST: () => {
    //       // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(['actions', 'deleteAssociationType', seqAction.id], fromJS(seqAction));
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(['actions', 'deleteAssociationType', seqAction.id], Map());
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const targetId :string = storedSeqAction.get('value');
    //       const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const currentAssociationTypes :List<Map<*, *>> = state.get('associationTypes', List());
    //       const updatedAssociationTypes :List<Map<*, *>> = currentAssociationTypes.delete(targetIndex);
    //       const updatedAssociationTypesById :Map<string, number> = Map()
    //         .withMutations((byIdMap :Map<string, number>) => {
    //           updatedAssociationTypes.forEach((associationType :Map<*, *>, associationTypeIndex :number) => {
    //             const entityType :Map<*, *> = associationType.get('entityType', Map());
    //             byIdMap.set(entityType.get('id'), associationTypeIndex);
    //           });
    //         });
    //
    //       return state
    //         .set('associationTypes', updatedAssociationTypes)
    //         .set('associationTypesById', updatedAssociationTypesById);
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'deleteAssociationType', seqAction.id]);
    //     }
    //   });
    // }

    // case addDstEntityTypeToAssociationType.case(action.type): {
    //   return addDstEntityTypeToAssociationType.reducer(state, action, {
    //     REQUEST: () => {
    //       // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(
    //         ['actions', 'addDstEntityTypeToAssociationType', seqAction.id],
    //         fromJS(seqAction)
    //       );
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(
    //         ['actions', 'addDstEntityTypeToAssociationType', seqAction.id],
    //         Map()
    //       );
    //
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const targetId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
    //       const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);
    //
    //       // don't do anything if the AssociationType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const entityTypeIdToAdd :string = storedSeqAction.getIn(['value', 'entityTypeId']);
    //       const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
    //       const currentDestinationEntityTypeIds :List<string> = currentAssociationType.get('dst', List());
    //       const entityTypeIndex :number = currentDestinationEntityTypeIds.findIndex((entityTypeId :string) => {
    //         return entityTypeId === entityTypeIdToAdd;
    //       });
    //
    //       // don't do anything if the EntityType being added is already in the list
    //       if (entityTypeIndex !== -1) {
    //         return state;
    //       }
    //
    //       const updatedDestinationEntityTypeIds :List<string> = currentDestinationEntityTypeIds.push(entityTypeIdToAdd);
    //       const updatedAssociationType :Map<*, *> = currentAssociationType.set('dst', updatedDestinationEntityTypeIds);
    //       return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'addDstEntityTypeToAssociationType', seqAction.id]);
    //     }
    //   });
    // }

    // case addPropertyTypeToEntityType.case(action.type): {
    //   return addPropertyTypeToEntityType.reducer(state, action, {
    //     REQUEST: () => {
    //       // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(['actions', 'addPropertyTypeToEntityType', seqAction.id], fromJS(seqAction));
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(
    //         ['actions', 'addPropertyTypeToEntityType', seqAction.id],
    //         Map()
    //       );
    //
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const targetId :string = storedSeqAction.getIn(['value', 'entityTypeId']);
    //       const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);
    //
    //       // don't do anything if the AssociationType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const propertyTypeIdToAdd :string = storedSeqAction.getIn(['value', 'propertyTypeId']);
    //       const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
    //       const currentPropertyTypeIds :List<string> = currentAssociationType.getIn(
    //         ['entityType', 'properties'],
    //         List()
    //       );
    //       const propertyTypeIndex :number = currentPropertyTypeIds.findIndex((propertyTypeId :string) => {
    //         return propertyTypeId === propertyTypeIdToAdd;
    //       });
    //
    //       // don't do anything if the PropertyType being added is already in the list
    //       if (propertyTypeIndex !== -1) {
    //         return state;
    //       }
    //
    //       const updatedPropertyTypeIds :List<string> = currentPropertyTypeIds.push(propertyTypeIdToAdd);
    //       const updatedAssociationType :Map<*, *> = currentAssociationType.setIn(
    //         ['entityType', 'properties'],
    //         updatedPropertyTypeIds
    //       );
    //       return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'addPropertyTypeToEntityType', seqAction.id]);
    //     }
    //   });
    // }

    // case addSrcEntityTypeToAssociationType.case(action.type): {
    //   return addSrcEntityTypeToAssociationType.reducer(state, action, {
    //     REQUEST: () => {
    //       // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(
    //         ['actions', 'addSrcEntityTypeToAssociationType', seqAction.id],
    //         fromJS(seqAction)
    //       );
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(
    //         ['actions', 'addSrcEntityTypeToAssociationType', seqAction.id],
    //         Map()
    //       );
    //
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const targetId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
    //       const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);
    //
    //       // don't do anything if the AssociationType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const entityTypeIdToAdd :string = storedSeqAction.getIn(['value', 'entityTypeId']);
    //       const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
    //       const currentSourceEntityTypeIds :List<string> = currentAssociationType.get('src', List());
    //       const entityTypeIndex :number = currentSourceEntityTypeIds.findIndex((entityTypeId :string) => {
    //         return entityTypeId === entityTypeIdToAdd;
    //       });
    //
    //       // don't do anything if the EntityType being added is already in the list
    //       if (entityTypeIndex !== -1) {
    //         return state;
    //       }
    //
    //       const updatedSourceEntityTypeIds :List<string> = currentSourceEntityTypeIds.push(entityTypeIdToAdd);
    //       const updatedAssociationType :Map<*, *> = currentAssociationType.set('src', updatedSourceEntityTypeIds);
    //       return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'addSrcEntityTypeToAssociationType', seqAction.id]);
    //     }
    //   });
    // }

    // case removeDstEntityTypeFromAssociationType.case(action.type): {
    //   return removeDstEntityTypeFromAssociationType.reducer(state, action, {
    //     REQUEST: () => {
    //       // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(
    //         ['actions', 'removeDstEntityTypeFromAssociationType', seqAction.id],
    //         fromJS(seqAction)
    //       );
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(
    //         ['actions', 'removeDstEntityTypeFromAssociationType', seqAction.id],
    //         Map()
    //       );
    //
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const targetId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
    //       const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);
    //
    //       // don't do anything if the AssociationType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
    //       const currentDestinationEntityTypeIds :List<string> = currentAssociationType.get('dst', List());
    //       const removalIndex :number = currentDestinationEntityTypeIds.findIndex((entityTypeId :string) => {
    //         return entityTypeId === storedSeqAction.getIn(['value', 'entityTypeId']);
    //       });
    //
    //       // don't do anything if the EntityType being removed is not actually in the list
    //       if (removalIndex === -1) {
    //         return state;
    //       }
    //
    //       const updatedDestinationEntityTypeIds :List<string> = currentDestinationEntityTypeIds.delete(removalIndex);
    //       const updatedAssociationType :Map<*, *> = currentAssociationType.set('dst', updatedDestinationEntityTypeIds);
    //       return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'removeDstEntityTypeFromAssociationType', seqAction.id]);
    //     }
    //   });
    // }

    // case removePropertyTypeFromEntityType.case(action.type): {
    //   return removePropertyTypeFromEntityType.reducer(state, action, {
    //     REQUEST: () => {
    //       // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(['actions', 'removePropertyTypeFromEntityType', seqAction.id], fromJS(seqAction));
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(
    //         ['actions', 'removePropertyTypeFromEntityType', seqAction.id],
    //         Map()
    //       );
    //
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const targetId :string = storedSeqAction.getIn(['value', 'entityTypeId']);
    //       const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);
    //
    //       // don't do anything if the AssociationType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
    //       const currentPropertyTypeIds :List<string> = currentAssociationType.getIn(
    //         ['entityType', 'properties'],
    //         List()
    //       );
    //       const removalIndex :number = currentPropertyTypeIds.findIndex((propertyTypeId :string) => {
    //         return propertyTypeId === storedSeqAction.getIn(['value', 'propertyTypeId']);
    //       });
    //
    //       // don't do anything if the PropertyType being removed is not actually in the list
    //       if (removalIndex === -1) {
    //         return state;
    //       }
    //
    //       const updatedPropertyTypeIds :List<string> = currentPropertyTypeIds.delete(removalIndex);
    //       const updatedAssociationType :Map<*, *> = currentAssociationType.setIn(
    //         ['entityType', 'properties'],
    //         updatedPropertyTypeIds
    //       );
    //       return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'removePropertyTypeFromEntityType', seqAction.id]);
    //     }
    //   });
    // }

    // case removeSrcEntityTypeFromAssociationType.case(action.type): {
    //   return removeSrcEntityTypeFromAssociationType.reducer(state, action, {
    //     REQUEST: () => {
    //       // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(
    //         ['actions', 'removeSrcEntityTypeFromAssociationType', seqAction.id],
    //         fromJS(seqAction)
    //       );
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(
    //         ['actions', 'removeSrcEntityTypeFromAssociationType', seqAction.id],
    //         Map()
    //       );
    //
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const targetId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
    //       const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);
    //
    //       // don't do anything if the AssociationType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
    //       const currentSourceEntityTypeIds :List<string> = currentAssociationType.get('src', List());
    //       const removalIndex :number = currentSourceEntityTypeIds.findIndex((entityTypeId :string) => {
    //         return entityTypeId === storedSeqAction.getIn(['value', 'entityTypeId']);
    //       });
    //
    //       // don't do anything if the EntityType being removed is not actually in the list
    //       if (removalIndex === -1) {
    //         return state;
    //       }
    //
    //       const updatedSourceEntityTypeIds :List<string> = currentSourceEntityTypeIds.delete(removalIndex);
    //       const updatedAssociationType :Map<*, *> = currentAssociationType.set('src', updatedSourceEntityTypeIds);
    //       return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'removeSrcEntityTypeFromAssociationType', seqAction.id]);
    //     }
    //   });
    // }

    // case reorderEntityTypePropertyTypes.case(action.type): {
    //   return reorderEntityTypePropertyTypes.reducer(state, action, {
    //     REQUEST: () => {
    //       // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(['actions', 'reorderEntityTypePropertyTypes', seqAction.id], fromJS(seqAction));
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(
    //         ['actions', 'reorderEntityTypePropertyTypes', seqAction.id],
    //         Map()
    //       );
    //
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const targetId :string = storedSeqAction.getIn(['value', 'entityTypeId']);
    //       const targetIndex :number = state.getIn(['associationTypesById', targetId], -1);
    //
    //       // don't do anything if the AssociationType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const reorderedPropertyTypeIds :List<string> = storedSeqAction.getIn(['value', 'propertyTypeIds'], List());
    //       const currentAssociationType :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
    //       const updatedAssociationType :Map<*, *> = currentAssociationType.setIn(
    //         ['entityType', 'properties'],
    //         reorderedPropertyTypeIds
    //       );
    //
    //       return state.setIn(['associationTypes', targetIndex], updatedAssociationType);
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'reorderEntityTypePropertyTypes', seqAction.id]);
    //     }
    //   });
    // }

    // case updateAssociationTypeMetaData.case(action.type): {
    //   return updateAssociationTypeMetaData.reducer(state, action, {
    //     REQUEST: () => {
    //       // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(['actions', 'updateAssociationTypeMetaData', seqAction.id], fromJS(seqAction));
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(
    //         ['actions', 'updateAssociationTypeMetaData', seqAction.id],
    //         Map()
    //       );
    //
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const associationTypeId :string = storedSeqAction.getIn(['value', 'associationTypeId']);
    //       const associationTypeIndex :number = state.getIn(['associationTypesById', associationTypeId], -1);
    //       if (associationTypeIndex < 0) {
    //         return state;
    //       }
    //
    //       const metadata :Map<*, *> = storedSeqAction.getIn(['value', 'metadata']);
    //       if (metadata.has('description')) {
    //         return state.setIn(
    //           ['associationTypes', associationTypeIndex, 'entityType', 'description'],
    //           metadata.get('description')
    //         );
    //       }
    //       if (metadata.has('title')) {
    //         return state.setIn(
    //           ['associationTypes', associationTypeIndex, 'entityType', 'title'],
    //           metadata.get('title')
    //         );
    //       }
    //       if (metadata.has('type')) {
    //         // TODO: potential bug with how immutable.js deals with custom objects
    //         // TODO: consider storing plain object instead of FullyQualifiedName object
    //         return state.setIn(
    //           ['associationTypes', associationTypeIndex, 'entityType', 'type'],
    //           metadata.get('type')
    //         );
    //       }
    //
    //       return state;
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'updateAssociationTypeMetaData', seqAction.id]);
    //     }
    //   });
    // }

    // case updateSchema.case(action.type): {
    //   return updateSchema.reducer(state, action, {
    //     REQUEST: () => {
    //       const seqAction :SequenceAction = action;
    //       return state.setIn(['actions', 'updateSchema', seqAction.id], fromJS(seqAction));
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = action;
    //       const storedSeqAction :Map<*, *> = state.getIn(['actions', 'updateSchema', seqAction.id], Map());
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const schemaFqn :FullyQualifiedName = new FullyQualifiedName(storedSeqAction.getIn(['value', 'schemaFqn']));
    //       const actionAssociationTypeIds :List<string> = storedSeqAction.getIn(['value', 'entityTypeIds'], List());
    //       // TODO: ":string" should be ":ActionType"
    //       const actionType :string = storedSeqAction.getIn(['value', 'action']);
    //
    //       let updatedState :Map<*, *> = state;
    //       actionAssociationTypeIds.forEach((associationTypeId :string) => {
    //         const associationTypeIndex :number = state.getIn(['associationTypesById', associationTypeId], -1);
    //         if (associationTypeIndex >= 0) {
    //           const existingSchemas :List<FullyQualifiedName> = updatedState.getIn(
    //             ['associationTypes', associationTypeIndex, 'entityType', 'schemas'],
    //             List(),
    //           );
    //           if (actionType === ActionTypes.ADD) {
    //             const updatedSchemas :List<FullyQualifiedName> = existingSchemas.push(schemaFqn);
    //             updatedState = updatedState.setIn(
    //               ['associationTypes', associationTypeIndex, 'entityType', 'schemas'],
    //               updatedSchemas,
    //             );
    //           }
    //           else if (actionType === ActionTypes.REMOVE) {
    //             const targetIndex :number = existingSchemas.findIndex((fqn :FullyQualifiedName) => (
    //               FullyQualifiedName.toString(fqn) === schemaFqn.toString()
    //             ));
    //             if (targetIndex >= 0) {
    //               const updatedSchemas :List<FullyQualifiedName> = existingSchemas.delete(targetIndex);
    //               updatedState = updatedState.setIn(
    //                 ['associationTypes', associationTypeIndex, 'entityType', 'schemas'],
    //                 updatedSchemas,
    //               );
    //             }
    //           }
    //         }
    //       });
    //
    //       return updatedState;
    //     },
    //     FAILURE: () => {
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = action;
    //       return state.deleteIn(['actions', 'updateSchema', seqAction.id]);
    //     },
    //   });
    // }

    default:
      return state;
  }
}
