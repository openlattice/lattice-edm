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
import type { EntityTypeObject, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  LOCAL_ADD_PT_TO_ET,
  LOCAL_CREATE_ENTITY_TYPE,
  LOCAL_DELETE_ENTITY_TYPE,
  LOCAL_REMOVE_PT_FROM_ET,
  LOCAL_UPDATE_ENTITY_TYPE_META,
  localAddPropertyTypeToEntityType,
  localCreateEntityType,
  localDeleteEntityType,
  localRemovePropertyTypeFromEntityType,
  localUpdateEntityTypeMeta,
} from './EntityTypesActions';

import Logger from '../../../utils/Logger';
import { isValidUUID } from '../../../utils/ValidationUtils';
import {
  LOCAL_UPDATE_SCHEMA,
  localUpdateSchema,
} from '../schemas/SchemasActions';
import type { IndexMap, UpdateEntityTypeMeta } from '../Types';

const LOG :Logger = new Logger('EntityTypesReducer');

const {
  getEntityDataModel,
} = EntityDataModelApiActions;

const {
  EntityType,
  EntityTypeBuilder,
  FQN,
} = Models;

const {
  ActionTypes,
} = Types;

const INITIAL_STATE :Map<*, *> = fromJS({
  [LOCAL_ADD_PT_TO_ET]: { error: false },
  [LOCAL_CREATE_ENTITY_TYPE]: { error: false },
  [LOCAL_DELETE_ENTITY_TYPE]: { error: false },
  [LOCAL_REMOVE_PT_FROM_ET]: { error: false },
  [LOCAL_UPDATE_ENTITY_TYPE_META]: { error: false },
  [LOCAL_UPDATE_SCHEMA]: { error: false },
  entityTypes: List(),
  entityTypesIndexMap: Map(),
  newlyCreatedEntityTypeFQN: undefined,
});

export default function entityTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getEntityDataModel.case(action.type): {
      return getEntityDataModel.reducer(state, action, {
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const responseEntityTypes :EntityTypeObject[] = seqAction.value.entityTypes;
          if (!responseEntityTypes || responseEntityTypes.length === 0) {
            LOG.error('getEntityDataModel() - EntityTypes missing', responseEntityTypes);
            return state;
          }

          const entityTypes :List<Map<*, *>> = List().asMutable();
          const entityTypesIndexMap :IndexMap = Map().asMutable();

          responseEntityTypes.forEach((et :EntityTypeObject, index :number) => {
            try {
              const entityType = (new EntityTypeBuilder(et)).build();
              entityTypes.push(entityType.toImmutable());
              /*
               * IMPORTANT! we must keep the fqn and id index mapping in sync!
               */
              entityTypesIndexMap.set(entityType.id, index);
              entityTypesIndexMap.set(entityType.type, index);
            }
            catch (e) {
              LOG.error('getEntityDataModel()', et);
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

            const target :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
            const targetFQN :FQN = FQN.of(target.get('type', Map()));
            if (target.get('id') !== entityTypeId || targetFQN.toString() !== entityTypeFQN.toString()) {
              LOG.error('EntityType does not match id or fqn', entityTypeId, entityTypeFQN);
              return state;
            }

            const currentPropertyTypeIds :List<UUID> = target.get('properties', List());

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
            const entityTypeFQN :FQN = FQN.of(storedEntityType.type);
            const entityTypeId :?UUID = seqAction.value; // id won't be available in "offline" mode

            const newEntityType :EntityType = (new EntityTypeBuilder(storedEntityType))
              .setId(entityTypeId)
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
              updatedEntityTypesIndexMap = updatedEntityTypesIndexMap.set(entityTypeId, newEntityTypeIndex);
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
              LOG.error('EntityType does not exist in store', targetFQN);
              return state;
            }

            const target :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
            if (FQN.toString(target.get('type', Map())) !== targetFQN.toString()) {
              LOG.error('EntityType does not match fqn', targetFQN);
              return state;
            }

            const currentEntityTypes :List<Map<*, *>> = state.get('entityTypes', List());
            const updatedEntityTypes :List<Map<*, *>> = currentEntityTypes.delete(targetIndex);
            const updatedEntityTypesIndexMap :IndexMap = Map().asMutable();

            updatedEntityTypes.forEach((entityType :Map<*, *>, index :number) => {
              /*
               * IMPORTANT! we must keep the fqn and id index mapping in sync!
               */
              const entityTypeFQN :FQN = FQN.of(entityType.get('type'));
              updatedEntityTypesIndexMap.set(entityTypeFQN, index);
              const entityTypeId :?UUID = entityType.get('id');
              if (isValidUUID(entityTypeId)) {
                updatedEntityTypesIndexMap.set(entityTypeId, index);
              }
            });

            return state
              .set('entityTypes', updatedEntityTypes)
              .set('entityTypesIndexMap', updatedEntityTypesIndexMap.asImmutable());
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

    case localRemovePropertyTypeFromEntityType.case(action.type): {
      return localRemovePropertyTypeFromEntityType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_REMOVE_PT_FROM_ET, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_REMOVE_PT_FROM_ET, seqAction.id]);

          if (storedSeqAction) {

            const {
              entityTypeFQN,
              entityTypeId,
              propertyTypeId,
            } = storedSeqAction.value;

            const targetIndex :number = state.getIn(['entityTypesIndexMap', entityTypeFQN], -1);
            if (targetIndex === -1) {
              LOG.error('EntityType does not exist in store', entityTypeFQN);
              return state;
            }

            const target :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
            const targetFQN :FQN = FQN.of(target.get('type', Map()));
            if (target.get('id') !== entityTypeId || targetFQN.toString() !== entityTypeFQN.toString()) {
              LOG.error('EntityType does not match id or fqn', entityTypeId, entityTypeFQN);
              return state;
            }

            const currentPropertyTypeIds :List<UUID> = target.get('properties', List());
            const updatedPropertyTypeIds :List<UUID> = currentPropertyTypeIds.filter((id) => id !== propertyTypeId);
            return state.setIn(['entityTypes', targetIndex, 'properties'], updatedPropertyTypeIds);
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_REMOVE_PT_FROM_ET, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_REMOVE_PT_FROM_ET, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_REMOVE_PT_FROM_ET, seqAction.id]);
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
              entityTypeId,
              metadata,
            } :UpdateEntityTypeMeta = storedSeqAction.value;

            const targetIndex :number = state.getIn(['entityTypesIndexMap', entityTypeFQN], -1);
            if (targetIndex === -1) {
              LOG.error('EntityType does not exist in store', entityTypeFQN);
              return state;
            }

            const target :Map<*, *> = state.getIn(['entityTypes', targetIndex], Map());
            const targetFQN :FQN = FQN.of(target.get('type', Map()));
            if (target.get('id') !== entityTypeId || targetFQN.toString() !== entityTypeFQN.toString()) {
              LOG.error('EntityType does not match id or fqn', entityTypeId, entityTypeFQN);
              return state;
            }

            let newState :Map<*, *> = state;
            const currentEntityType :EntityTypeObject = target.toJS();
            const entityTypeBuilder :EntityTypeBuilder = (new EntityTypeBuilder(currentEntityType));

            if (has(metadata, 'description')) {
              entityTypeBuilder.setDescription(metadata.description);
            }

            if (has(metadata, 'title')) {
              entityTypeBuilder.setTitle(metadata.title);
            }

            if (has(metadata, 'type')) {
              const newEntityTypeFQN = FQN.of(metadata.type);
              entityTypeBuilder.setType(metadata.type);
              newState = newState
                .deleteIn(['entityTypesIndexMap', entityTypeFQN])
                .setIn(['entityTypesIndexMap', newEntityTypeFQN], targetIndex);
            }

            const updatedEntityType :EntityType = entityTypeBuilder.build();
            return newState
              .setIn(['entityTypes', targetIndex], updatedEntityType.toImmutable());
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

    case localUpdateSchema.case(action.type): {
      return localUpdateSchema.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_UPDATE_SCHEMA, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_SCHEMA, seqAction.id]);

          if (storedSeqAction) {

            const {
              actionType,
              entityTypeIds,
              entityTypes,
              schemaFQN,
            } = storedSeqAction.value;

            let newState :Map<*, *> = state;
            let ids :UUID[] = entityTypeIds;
            if (entityTypes && entityTypes.length > 0) {
              ids = entityTypes.map((entityType :Map<*, *>) => entityType.get('id'));
            }

            if (!ids || ids.length <= 0) {
              return state;
            }

            ids.forEach((entityTypeId :UUID) => {
              const entityTypeIndex :number = state.get('entityTypes').findIndex(
                (entityType :Map<*, *>) => entityType.get('id') === entityTypeId
              );
              if (entityTypeIndex !== -1) {
                const path = ['entityTypes', entityTypeIndex, 'schemas'];
                if (actionType === ActionTypes.ADD) {
                  const currentSchemas = newState.getIn(path);
                  const updatedSchemas = currentSchemas.push(fromJS(schemaFQN.toObject()));
                  newState = newState.setIn(path, updatedSchemas);
                }
                else if (actionType === ActionTypes.REMOVE) {
                  const schemaIndex :number = newState.getIn(path).findIndex(
                    (fqn :Map<*, *>) => FQN.toString(fqn) === schemaFQN.toString()
                  );
                  if (schemaIndex !== -1) {
                    path.push(schemaIndex);
                    newState = newState.deleteIn(path);
                  }
                }
              }
            });

            return newState;
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_SCHEMA, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_UPDATE_SCHEMA, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_UPDATE_SCHEMA, seqAction.id]);
        },
      });
    }

    default:
      return state;
  }
}
