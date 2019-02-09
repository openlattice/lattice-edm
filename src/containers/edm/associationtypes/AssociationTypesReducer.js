/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import {
  List,
  Map,
  fromJS,
  has,
} from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';
import type { FQN, AssociationTypeObject } from 'lattice';

import Logger from '../../../utils/Logger';
import { isValidUUID } from '../../../utils/ValidationUtils';
import {
  LOCAL_ADD_PT_TO_AT,
  LOCAL_ADD_SOURCE_ET_TO_AT,
  LOCAL_CREATE_ASSOCIATION_TYPE,
  LOCAL_DELETE_ASSOCIATION_TYPE,
  LOCAL_REMOVE_PT_FROM_AT,
  LOCAL_REMOVE_SRC_ET_FROM_AT,
  LOCAL_UPDATE_ASSOCIATION_TYPE_META,
  localAddPropertyTypeToAssociationType,
  localAddSourceEntityTypeToAssociationType,
  localCreateAssociationType,
  localDeleteAssociationType,
  localRemovePropertyTypeFromAssociationType,
  localRemoveSrcEntityTypeFromAssociationType,
  localUpdateAssociationTypeMeta,
} from './AssociationTypesActions';
import type { IndexMap, UpdateAssociationTypeMeta } from '../Types';

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

    case localAddPropertyTypeToAssociationType.case(action.type): {
      return localAddPropertyTypeToAssociationType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_ADD_PT_TO_AT, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_ADD_PT_TO_AT, seqAction.id]);

          if (storedSeqAction) {

            const associationTypeFQN :FQN = storedSeqAction.value.associationTypeFQN;
            const associationTypeId :?UUID = storedSeqAction.value.associationTypeId;
            const propertyTypeId :?UUID = storedSeqAction.value.propertyTypeId;

            if (!isValidUUID(propertyTypeId)) {
              LOG.error('PropertyType id must be a valid UUID', propertyTypeId);
              return state;
            }

            const targetIndex :number = state.getIn(['associationTypesIndexMap', associationTypeFQN], -1);
            if (targetIndex === -1) {
              LOG.error('AssociationType does not exist in store', associationTypeFQN);
              return state;
            }

            const target :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
            const targetFQN :FQN = new FullyQualifiedName(target.getIn(['entityType', 'type'], Map()));
            const targetId :?UUID = target.getIn(['entityType', 'id']);
            if (targetId !== associationTypeId || targetFQN.toString() !== associationTypeFQN.toString()) {
              LOG.error('AssociationType does not match id or fqn', associationTypeId, associationTypeFQN);
              return state;
            }

            const currentPropertyTypeIds :List<UUID> = target.getIn(['entityType', 'properties'], List());

            // don't do anything if the PropertyType id being added is already a part of the AssociationType
            if (currentPropertyTypeIds.includes(propertyTypeId)) {
              return state;
            }

            const updatedPropertyTypeIds :List<UUID> = currentPropertyTypeIds.push(propertyTypeId);
            return state.setIn(['associationTypes', targetIndex, 'entityType', 'properties'], updatedPropertyTypeIds);
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_ADD_PT_TO_AT, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_ADD_PT_TO_AT, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_ADD_PT_TO_AT, seqAction.id]);
        },
      });
    }

    case localAddSourceEntityTypeToAssociationType.case(action.type): {
      return localAddSourceEntityTypeToAssociationType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_ADD_SOURCE_ET_TO_AT, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_ADD_SOURCE_ET_TO_AT, seqAction.id]);

          if (storedSeqAction) {

            const associationTypeFQN :FQN = storedSeqAction.value.associationTypeFQN;
            const associationTypeId :?UUID = storedSeqAction.value.associationTypeId;
            const entityTypeId :?UUID = storedSeqAction.value.entityTypeId;

            if (!isValidUUID(entityTypeId)) {
              LOG.error('EntityType id must be a valid UUID', entityTypeId);
              return state;
            }

            const targetIndex :number = state.getIn(['associationTypesIndexMap', associationTypeFQN], -1);
            if (targetIndex === -1) {
              LOG.error('AssociationType does not exist in store', associationTypeFQN);
              return state;
            }

            const target :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
            const targetFQN :FQN = new FullyQualifiedName(target.getIn(['entityType', 'type'], Map()));
            const targetId :?UUID = target.getIn(['entityType', 'id']);
            if (targetId !== associationTypeId || targetFQN.toString() !== associationTypeFQN.toString()) {
              LOG.error('AssociationType does not match id or fqn', associationTypeId, associationTypeFQN);
              return state;
            }

            const currentEntityTypeIds :List<UUID> = target.get('src', List());

            // don't do anything if the EntityType id being added is already a part of the AssociationType
            if (currentEntityTypeIds.includes(entityTypeId)) {
              return state;
            }

            const updatedEntityTypeIds :List<UUID> = currentEntityTypeIds.push(entityTypeId);
            return state.setIn(['associationTypes', targetIndex, 'src'], updatedEntityTypeIds);
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_ADD_SOURCE_ET_TO_AT, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_ADD_SOURCE_ET_TO_AT, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_ADD_SOURCE_ET_TO_AT, seqAction.id]);
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

    case localDeleteAssociationType.case(action.type): {
      return localDeleteAssociationType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_DELETE_ASSOCIATION_TYPE, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_DELETE_ASSOCIATION_TYPE, seqAction.id]);

          if (storedSeqAction) {

            const associationTypeFQN :FQN = storedSeqAction.value.associationTypeFQN;
            const associationTypeId :FQN = storedSeqAction.value.associationTypeId;

            const targetIndex :number = state.getIn(['associationTypesIndexMap', associationTypeFQN], -1);
            if (targetIndex === -1) {
              LOG.error('AssociationType does not exist in store', associationTypeFQN);
              return state;
            }

            const target :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
            const targetFQN :FQN = new FullyQualifiedName(target.get('type', Map()));
            if (target.get('id') !== associationTypeId || targetFQN.toString() !== associationTypeFQN.toString()) {
              LOG.error('AssociationType does not match id or fqn', associationTypeId, associationTypeFQN);
              return state;
            }

            const currentAssociationTypes :List<Map<*, *>> = state.get('associationTypes', List());
            const updatedAssociationTypes :List<Map<*, *>> = currentAssociationTypes.delete(targetIndex);
            const updatedAssociationTypesIndexMap :IndexMap = Map().asMutable();

            updatedAssociationTypes.forEach((associationType :Map<*, *>, index :number) => {
              /*
               * IMPORTANT! we must keep the fqn and id index mapping in sync!
               */
              const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
              const fqn :FQN = new FullyQualifiedName(associationEntityType.get('type'));
              updatedAssociationTypesIndexMap.set(fqn, index);
              const id :?UUID = associationType.get('id');
              if (isValidUUID(id)) {
                updatedAssociationTypesIndexMap.set(id, index);
              }
            });

            return state
              .set('associationTypes', updatedAssociationTypes)
              .set('associationTypesIndexMap', updatedAssociationTypesIndexMap.asImmutable());
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_DELETE_ASSOCIATION_TYPE, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_DELETE_ASSOCIATION_TYPE, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_DELETE_ASSOCIATION_TYPE, seqAction.id]);
        },
      });
    }

    case localRemovePropertyTypeFromAssociationType.case(action.type): {
      return localRemovePropertyTypeFromAssociationType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_REMOVE_PT_FROM_AT, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_REMOVE_PT_FROM_AT, seqAction.id]);

          if (storedSeqAction) {

            const associationTypeFQN :FQN = storedSeqAction.value.associationTypeFQN;
            const associationTypeId :?UUID = storedSeqAction.value.associationTypeId;
            const propertyTypeId :?UUID = storedSeqAction.value.propertyTypeId;

            const targetIndex :number = state.getIn(['associationTypesIndexMap', associationTypeFQN], -1);
            if (targetIndex === -1) {
              LOG.error('AssociationType does not exist in store', associationTypeFQN);
              return state;
            }

            const target :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
            const targetFQN :FQN = new FullyQualifiedName(target.getIn(['entityType', 'type'], Map()));
            const targetId :?UUID = target.getIn(['entityType', 'id']);
            if (targetId !== associationTypeId || targetFQN.toString() !== associationTypeFQN.toString()) {
              LOG.error('AssociationType does not match id or fqn', associationTypeId, associationTypeFQN);
              return state;
            }

            const currentPropertyTypeIds :List<UUID> = target.getIn(['entityType', 'properties'], List());
            const updatedPropertyTypeIds :List<UUID> = currentPropertyTypeIds.filter(id => id !== propertyTypeId);
            return state.setIn(['associationTypes', targetIndex, 'entityType', 'properties'], updatedPropertyTypeIds);
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_REMOVE_PT_FROM_AT, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_REMOVE_PT_FROM_AT, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_REMOVE_PT_FROM_AT, seqAction.id]);
        },
      });
    }

    case localRemoveSrcEntityTypeFromAssociationType.case(action.type): {
      return localRemoveSrcEntityTypeFromAssociationType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_REMOVE_SRC_ET_FROM_AT, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_REMOVE_SRC_ET_FROM_AT, seqAction.id]);

          if (storedSeqAction) {

            const associationTypeFQN :FQN = storedSeqAction.value.associationTypeFQN;
            const associationTypeId :?UUID = storedSeqAction.value.associationTypeId;
            const entityTypeId :?UUID = storedSeqAction.value.entityTypeId;

            const targetIndex :number = state.getIn(['associationTypesIndexMap', associationTypeFQN], -1);
            if (targetIndex === -1) {
              LOG.error('AssociationType does not exist in store', associationTypeFQN);
              return state;
            }

            const target :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
            const targetFQN :FQN = new FullyQualifiedName(target.getIn(['entityType', 'type'], Map()));
            const targetId :?UUID = target.getIn(['entityType', 'id']);
            if (targetId !== associationTypeId || targetFQN.toString() !== associationTypeFQN.toString()) {
              LOG.error('AssociationType does not match id or fqn', associationTypeId, associationTypeFQN);
              return state;
            }

            const currentEntityTypeIds :List<UUID> = target.get('src', List());
            const updatedEntityTypeIds :List<UUID> = currentEntityTypeIds.filter(id => id !== entityTypeId);
            return state.setIn(['associationTypes', targetIndex, 'src'], updatedEntityTypeIds);
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_REMOVE_SRC_ET_FROM_AT, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_REMOVE_SRC_ET_FROM_AT, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_REMOVE_SRC_ET_FROM_AT, seqAction.id]);
        },
      });
    }

    case localUpdateAssociationTypeMeta.case(action.type): {
      return localUpdateAssociationTypeMeta.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, seqAction.id]);

          if (storedSeqAction) {

            const {
              associationTypeFQN,
              associationTypeId,
              metadata,
            } :UpdateAssociationTypeMeta = storedSeqAction.value;

            const targetIndex :number = state.getIn(['associationTypesIndexMap', associationTypeFQN], -1);
            if (targetIndex === -1) {
              LOG.error('AssociationType does not exist in store', associationTypeFQN);
              return state;
            }

            const target :Map<*, *> = state.getIn(['associationTypes', targetIndex], Map());
            const targetFQN :FQN = new FullyQualifiedName(target.getIn(['entityType', 'type'], Map()));
            const targetId :?UUID = target.getIn(['entityType', 'id']);
            if (targetId !== associationTypeId || targetFQN.toString() !== associationTypeFQN.toString()) {
              LOG.error('AssociationType does not match id or fqn', associationTypeId, associationTypeFQN);
              return state;
            }

            let newState :Map<*, *> = state;
            const currentAssociationType :AssociationTypeObject = target.toJS();
            const entityTypeBuilder :EntityTypeBuilder = new EntityTypeBuilder()
              .setBaseType(currentAssociationType.entityType.baseType)
              .setCategory(currentAssociationType.entityType.category)
              .setDescription(currentAssociationType.entityType.description)
              .setId(currentAssociationType.entityType.id)
              .setKey(currentAssociationType.entityType.key)
              .setPropertyTypes(currentAssociationType.entityType.properties)
              .setSchemas(currentAssociationType.entityType.schemas)
              .setTitle(currentAssociationType.entityType.title)
              .setType(currentAssociationType.entityType.type);

            if (has(metadata, 'description')) {
              entityTypeBuilder.setDescription(metadata.description);
            }

            if (has(metadata, 'title')) {
              entityTypeBuilder.setTitle(metadata.title);
            }

            if (has(metadata, 'type')) {
              const newAssociationTypeFQN = new FullyQualifiedName(metadata.type);
              entityTypeBuilder.setType(metadata.type);
              newState = newState
                .deleteIn(['associationTypesIndexMap', associationTypeFQN])
                .setIn(['associationTypesIndexMap', newAssociationTypeFQN], targetIndex);
            }

            const updatedEntityType :EntityType = entityTypeBuilder.build();
            const updatedAssociationType :AssociationType = new AssociationTypeBuilder()
              .setBidirectional(currentAssociationType.bidirectional)
              .setDestinationEntityTypeIds(currentAssociationType.dst)
              .setEntityType(updatedEntityType)
              .setSourceEntityTypeIds(currentAssociationType.src)
              .build();

            return newState
              .setIn(['associationTypes', targetIndex], updatedAssociationType.toImmutable());
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, seqAction.id]);
        },
      });
    }

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
