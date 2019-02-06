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
import type { FQN, EntityTypeObject } from 'lattice';

import Logger from '../../../utils/Logger';
import { isValidUUID } from '../../../utils/ValidationUtils';
import {
  LOCAL_ADD_PT_TO_ET,
  LOCAL_CREATE_ENTITY_TYPE,
  LOCAL_DELETE_ENTITY_TYPE,
  LOCAL_UPDATE_ENTITY_TYPE_META,
  localAddPropertyTypeToEntityType,
  localCreateEntityType,
  localDeleteEntityType,
  localUpdateEntityTypeMeta,
} from './EntityTypesActions';
import type { IndexMap, UpdateEntityTypeMeta } from '../Types';

const LOG :Logger = new Logger('EntityTypesReducer');

const {
  addPropertyTypeToEntityType,
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
  [LOCAL_ADD_PT_TO_ET]: { error: false },
  [LOCAL_CREATE_ENTITY_TYPE]: { error: false },
  [LOCAL_DELETE_ENTITY_TYPE]: { error: false },
  [LOCAL_UPDATE_ENTITY_TYPE_META]: { error: false },
  entityTypes: List(),
  entityTypesIndexMap: Map(),
  newlyCreatedEntityTypeFQN: undefined,
});

export default function entityTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case localAddPropertyTypeToEntityType.case(action.type): {
      return localAddPropertyTypeToEntityType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_ADD_PT_TO_ET, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_ADD_PT_TO_ET, seqAction.id]);
          if (storedSeqAction) {

            const {
              entityTypeFQN,
              entityTypeId,
              propertyTypeId,
            } = storedSeqAction.value;

            if (!isValidUUID(propertyTypeId)) {
              LOG.error('PropertyType id must be a valid UUID', propertyTypeId);
              return state;
            }

            const targetIndex :number = state.getIn(['entityTypesIndexMap', entityTypeFQN], -1);
            if (targetIndex === -1) {
              LOG.error('EntityType does not exist in store', entityTypeFQN);
              return state;
            }

            const targetEntityType :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
            if (
              targetEntityType.get('id') !== entityTypeId
              || FullyQualifiedName.toString(targetEntityType.get('type', Map())) !== entityTypeFQN.toString()
            ) {
              LOG.error('EntityType does not match id or fqn', entityTypeId, entityTypeFQN);
              return state;
            }

            const currentPropertyTypeIds :List<UUID> = targetEntityType.get('properties', List());

            // don't do anything if the PropertyType id being added is already a part of the EntityType
            if (currentPropertyTypeIds.includes(propertyTypeId)) {
              return state;
            }

            const updatedPropertyTypeIds :List<UUID> = currentPropertyTypeIds.push(propertyTypeId);
            return state.setIn(['entityTypes', targetIndex, 'properties'], updatedPropertyTypeIds);
          }
          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_ADD_PT_TO_ET, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_ADD_PT_TO_ET, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_ADD_PT_TO_ET, seqAction.id]);
        },
      });
    }

    case localCreateEntityType.case(action.type): {
      return localCreateEntityType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('newlyCreatedEntityTypeFQN', undefined)
            .setIn([LOCAL_CREATE_ENTITY_TYPE, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_CREATE_ENTITY_TYPE, seqAction.id]);
          if (storedSeqAction) {

            const storedEntityType :EntityType = storedSeqAction.value;
            const entityTypeFQN :FQN = new FullyQualifiedName(storedEntityType.type);
            const entityTypeId :?UUID = seqAction.value; // id won't be available in "offline" mode
            const newEntityType :EntityType = new EntityTypeBuilder()
              .setBaseType(storedEntityType.baseType)
              .setCategory(storedEntityType.category)
              .setDescription(storedEntityType.description)
              .setId(entityTypeId)
              .setKey(storedEntityType.key)
              .setPropertyTypes(storedEntityType.properties)
              .setSchemas(storedEntityType.schemas)
              .setTitle(storedEntityType.title)
              .setType(entityTypeFQN)
              .build();

            const updatedEntityTypes :List<Map<*, *>> = state
              .get('entityTypes')
              .push(newEntityType.toImmutable());

            const newEntityTypeIndex :number = updatedEntityTypes.count() - 1;

            /*
             * IMPORTANT! we must keep the fqn and the id index mapping in sync!
             */
            let updatedEntityTypesIndexMap :IndexMap = state
              .get('entityTypesIndexMap')
              .set(entityTypeFQN, newEntityTypeIndex);
            if (isValidUUID(entityTypeId)) {
              updatedEntityTypesIndexMap = updatedEntityTypesIndexMap
                .set(entityTypeId, newEntityTypeIndex);
            }

            return state
              .set('newlyCreatedEntityTypeFQN', entityTypeFQN)
              .set('entityTypes', updatedEntityTypes)
              .set('entityTypesIndexMap', updatedEntityTypesIndexMap);
          }
          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_CREATE_ENTITY_TYPE, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state
              .set('newlyCreatedEntityTypeFQN', undefined)
              .setIn([LOCAL_CREATE_ENTITY_TYPE, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_CREATE_ENTITY_TYPE, seqAction.id]);
        },
      });
    }

    case localDeleteEntityType.case(action.type): {
      return localDeleteEntityType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_DELETE_ENTITY_TYPE, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_DELETE_ENTITY_TYPE, seqAction.id]);
          if (storedSeqAction) {

            const targetFQN :FQN = storedSeqAction.value.entityTypeFQN;
            const targetIndex :number = state.getIn(['entityTypesIndexMap', targetFQN], -1);
            if (targetIndex === -1) {
              return state;
            }

            const currentEntityTypes :List<Map<*, *>> = state.get('entityTypes', List());
            const updatedEntityTypes :List<Map<*, *>> = currentEntityTypes.delete(targetIndex);
            const updatedEntityTypesIndexMap :IndexMap = Map().asMutable();

            updatedEntityTypes.forEach((entityType :Map<*, *>, index :number) => {
              /*
               * IMPORTANT! we must keep the fqn and id index mapping in sync!
               */
              const entityTypeFQN :FQN = new FullyQualifiedName(entityType.get('type'));
              updatedEntityTypesIndexMap.set(entityTypeFQN, index);
              const entityTypeId :?UUID = entityType.get('id');
              if (isValidUUID(entityTypeId)) {
                updatedEntityTypesIndexMap.set(entityTypeId, index);
              }
            });

            return state
              .set('entityTypes', updatedEntityTypes)
              .set('entityTypesIndexMap', updatedEntityTypesIndexMap);
          }
          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_DELETE_ENTITY_TYPE, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_DELETE_ENTITY_TYPE, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_DELETE_ENTITY_TYPE, seqAction.id]);
        },
      });
    }

    case localUpdateEntityTypeMeta.case(action.type): {
      return localUpdateEntityTypeMeta.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_UPDATE_ENTITY_TYPE_META, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, seqAction.id]);
          if (storedSeqAction) {

            const {
              entityTypeFQN,
              metadata,
            } :UpdateEntityTypeMeta = storedSeqAction.value;

            const entityTypeIndex :number = state.getIn(['entityTypesIndexMap', entityTypeFQN], -1);
            if (entityTypeIndex === -1) {
              return state;
            }

            let newState :Map<*, *> = state;
            const currentEntityType :EntityTypeObject = state.getIn(['entityTypes', entityTypeIndex]).toJS();
            const entityTypeBuilder :EntityTypeBuilder = new EntityTypeBuilder()
              .setBaseType(currentEntityType.baseType)
              .setCategory(currentEntityType.category)
              .setDescription(currentEntityType.description)
              .setId(currentEntityType.id)
              .setKey(currentEntityType.key)
              .setPropertyTypes(currentEntityType.properties)
              .setSchemas(currentEntityType.schemas)
              .setTitle(currentEntityType.title)
              .setType(currentEntityType.type)

            if (has(metadata, 'description')) {
              entityTypeBuilder.setDescription(metadata.description);
            }

            if (has(metadata, 'title')) {
              entityTypeBuilder.setTitle(metadata.title);
            }

            if (has(metadata, 'type')) {
              const newEntityTypeFQN = new FullyQualifiedName(metadata.type);
              entityTypeBuilder.setType(metadata.type);
              newState = newState
                .deleteIn(['entityTypesIndexMap', entityTypeFQN])
                .setIn(['entityTypesIndexMap', newEntityTypeFQN], entityTypeIndex);
            }

            const updatedEntityType :EntityType = entityTypeBuilder.build();
            return newState
              .setIn(['entityTypes', entityTypeIndex], updatedEntityType.toImmutable());
          }
          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_UPDATE_ENTITY_TYPE_META, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_UPDATE_ENTITY_TYPE_META, seqAction.id]);
        },
      });
    }

    case getEntityDataModel.case(action.type): {
      return getEntityDataModel.reducer(state, action, {
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const responseEntityTypes :EntityTypeObject[] = seqAction.value.entityTypes;
          if (!responseEntityTypes || responseEntityTypes.length === 0) {
            LOG.error('getEntityDataModel() - no EntityTypes available', responseEntityTypes);
            return state;
          }

          const entityTypes :List<Map<*, *>> = List().asMutable();
          const entityTypesIndexMap :IndexMap = Map().asMutable();

          responseEntityTypes.forEach((et :EntityTypeObject, index :number) => {
            try {
              const entityTypeId :?UUID = et.id;
              const entityTypeFQN :FQN = new FullyQualifiedName(et.type);
              const entityType = new EntityTypeBuilder()
                .setBaseType(et.baseType)
                .setCategory(et.category)
                .setDescription(et.description)
                .setId(entityTypeId)
                .setKey(et.key)
                .setPropertyTypes(et.properties)
                .setSchemas(et.schemas)
                .setTitle(et.title)
                .setType(entityTypeFQN)
                .build();
              entityTypes.push(entityType.toImmutable());
              /*
               * IMPORTANT! we must keep the fqn and id index mapping in sync!
               */
              entityTypesIndexMap.set(entityTypeId, index);
              entityTypesIndexMap.set(entityTypeFQN, index);
            }
            catch (e) {
              LOG.error('getEntityDataModel()', e);
            }
          });

          return state
            .set('entityTypes', entityTypes.asImmutable())
            .set('entityTypesIndexMap', entityTypesIndexMap.asImmutable());
        },
        FAILURE: () => {
          return state
            .set('entityTypes', List())
            .set('entityTypesIndexMap', Map());
        },
      });
    }

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
    //       const targetIndex :number = state.getIn(['entityTypesById', targetId], -1);
    //
    //       // don't do anything if the EntityType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const propertyTypeIdToAdd :string = storedSeqAction.getIn(['value', 'propertyTypeId']);
    //       const currentEntityType :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
    //       const currentPropertyTypeIds :List<string> = currentEntityType.get('properties', List());
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
    //       const updatedEntityType :Map<*, *> = currentEntityType.set('properties', updatedPropertyTypeIds);
    //       return state.setIn(['entityTypes', targetIndex], updatedEntityType);
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
    //       const targetIndex :number = state.getIn(['entityTypesById', targetId], -1);
    //
    //       // don't do anything if the EntityType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const currentEntityType :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
    //       const currentPropertyTypeIds :List<string> = currentEntityType.get('properties', List());
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
    //       const updatedEntityType :Map<*, *> = currentEntityType.set('properties', updatedPropertyTypeIds);
    //       return state.setIn(['entityTypes', targetIndex], updatedEntityType);
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
    //       const targetIndex :number = state.getIn(['entityTypesById', targetId], -1);
    //
    //       // don't do anything if the EntityType being modified isn't available
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const reorderedPropertyTypeIds :List<string> = storedSeqAction.getIn(['value', 'propertyTypeIds'], List());
    //       const currentEntityType :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
    //       const updatedEntityType :Map<*, *> = currentEntityType.set('properties', reorderedPropertyTypeIds);
    //       return state.setIn(['entityTypes', targetIndex], updatedEntityType);
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
    //       const schemaFqn :FQN = new FullyQualifiedName(storedSeqAction.getIn(['value', 'schemaFqn']));
    //       const actionEntityTypeIds :List<string> = storedSeqAction.getIn(['value', 'entityTypeIds'], List());
    //       // TODO: ":string" should be ":ActionType"
    //       const actionType :string = storedSeqAction.getIn(['value', 'action']);
    //
    //       let updatedState :Map<*, *> = state;
    //       actionEntityTypeIds.forEach((entityTypeId :string) => {
    //         const entityTypeIndex :number = state.getIn(['entityTypesById', entityTypeId], -1);
    //         if (entityTypeIndex >= 0) {
    //           const existingSchemas :List<FullyQualifiedName> = updatedState.getIn(
    //             ['entityTypes', entityTypeIndex, 'schemas'],
    //             List(),
    //           );
    //           if (actionType === ActionTypes.ADD) {
    //             const updatedSchemas :List<FullyQualifiedName> = existingSchemas.push(schemaFqn);
    //             updatedState = updatedState.setIn(['entityTypes', entityTypeIndex, 'schemas'], updatedSchemas);
    //           }
    //           else if (actionType === ActionTypes.REMOVE) {
    //             const targetIndex :number = existingSchemas.findIndex((fqn :FullyQualifiedName) => (
    //               FullyQualifiedName.toString(fqn) === schemaFqn.toString()
    //             ));
    //             if (targetIndex >= 0) {
    //               const updatedSchemas :List<FullyQualifiedName> = existingSchemas.delete(targetIndex);
    //               updatedState = updatedState.setIn(['entityTypes', entityTypeIndex, 'schemas'], updatedSchemas);
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
