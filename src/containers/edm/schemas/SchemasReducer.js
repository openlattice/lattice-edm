/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';
import type { SchemaObject, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  LOCAL_CREATE_SCHEMA,
  LOCAL_UPDATE_SCHEMA,
  localCreateSchema,
  localUpdateSchema,
} from './SchemasActions';

import Logger from '../../../utils/Logger';
import type { IndexMap } from '../Types';

const LOG :Logger = new Logger('SchemasReducer');

const {
  getEntityDataModel,
} = EntityDataModelApiActions;

const {
  FQN,
  Schema,
  SchemaBuilder,
} = Models;

const { ActionTypes } = Types;

const INITIAL_STATE :Map<*, *> = fromJS({
  [LOCAL_CREATE_SCHEMA]: { error: false },
  [LOCAL_UPDATE_SCHEMA]: { error: false },
  newlyCreatedSchemaFQN: undefined,
  schemas: List(),
  schemasIndexMap: Map(),
});

export default function schemasReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getEntityDataModel.case(action.type): {
      return getEntityDataModel.reducer(state, action, {
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const responseSchemas :SchemaObject[] = seqAction.value.schemas;
          if (!responseSchemas || responseSchemas.length === 0) {
            LOG.error('getEntityDataModel() - Schemas missing', responseSchemas);
            return state;
          }

          const schemas :List<Map<*, *>> = List().asMutable();
          const schemasIndexMap :IndexMap = Map().asMutable();

          responseSchemas.forEach((s :SchemaObject, index :number) => {
            try {
              const schema = (new SchemaBuilder(s)).build();
              schemas.push(schema.toImmutable());
              schemasIndexMap.set(schema.fqn, index);
            }
            catch (e) {
              LOG.error('getEntityDataModel()', s);
              LOG.error('getEntityDataModel()', e);
            }
          });

          return state
            .set('schemas', schemas.asImmutable())
            .set('schemasIndexMap', schemasIndexMap.asImmutable());
        },
        FAILURE: () => {
          return state
            .set('schemas', List())
            .set('schemasIndexMap', Map());
        },
      });
    }

    case localCreateSchema.case(action.type): {
      return localCreateSchema.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('newlyCreatedSchemaFQN', undefined)
            .setIn([LOCAL_CREATE_SCHEMA, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_CREATE_SCHEMA, seqAction.id]);

          if (storedSeqAction) {

            const storedSchema :Schema = storedSeqAction.value;
            const schemaFQN :FQN = FQN.of(storedSchema.fqn);
            const newSchema :Schema = (new SchemaBuilder(storedSchema))
              .setFQN(schemaFQN)
              .build();

            const updatedSchemas :List<Map<*, *>> = state
              .get('schemas')
              .push(newSchema.toImmutable());

            const newSchemaIndex :number = updatedSchemas.count() - 1;
            const updatedSchemasIndexMap :IndexMap = state
              .get('schemasIndexMap')
              .set(schemaFQN, newSchemaIndex);

            return state
              .set('newlyCreatedSchemaFQN', schemaFQN)
              .set('schemas', updatedSchemas)
              .set('schemasIndexMap', updatedSchemasIndexMap);
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_CREATE_SCHEMA, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state
              .set('newlyCreatedSchemaFQN', undefined)
              .setIn([LOCAL_CREATE_SCHEMA, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_CREATE_SCHEMA, seqAction.id]);
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
              propertyTypeIds,
              propertyTypes,
              schemaFQN,
            } = storedSeqAction.value;

            const targetIndex :number = state.getIn(['schemasIndexMap', schemaFQN], -1);
            if (targetIndex === -1) {
              LOG.error('Schema does not exist in store', schemaFQN);
              return state;
            }
            const target :Map<*, *> = state.getIn(['schemas', targetIndex], Map());
            const targetFQN :FQN = FQN.of(target.get('fqn', Map()));
            if (targetFQN.toString() !== schemaFQN.toString()) {
              LOG.error('EntityType does not match fqn', schemaFQN);
              return state;
            }

            let newState :Map<*, *> = state;
            if (actionType === ActionTypes.ADD) {

              // EntityTypes
              if (entityTypes && entityTypes.length > 0) {
                entityTypes.forEach((entityTypeToAdd :Map<*, *>) => {
                  const index :number = target.get('entityTypes').findIndex(
                    (entityType :Map<*, *>) => entityType.get('id') === entityTypeToAdd.get('id')
                  );
                  // only add if not in the list
                  if (index === -1) {
                    newState = newState.setIn(
                      ['schemas', targetIndex, 'entityTypes'],
                      newState.getIn(['schemas', targetIndex, 'entityTypes']).push(entityTypeToAdd)
                    );
                  }
                });
              }

              // PropertyTypes
              if (propertyTypes && propertyTypes.length > 0) {
                propertyTypes.forEach((propertyTypeToAdd :Map<*, *>) => {
                  const index :number = target.get('propertyTypes').findIndex(
                    (propertyType :Map<*, *>) => propertyType.get('id') === propertyTypeToAdd.get('id')
                  );
                  // only add if not in the list
                  if (index === -1) {
                    newState = newState.setIn(
                      ['schemas', targetIndex, 'propertyTypes'],
                      newState.getIn(['schemas', targetIndex, 'propertyTypes']).push(propertyTypeToAdd)
                    );
                  }
                });
              }
            }
            else if (actionType === ActionTypes.REMOVE) {

              // EntityTypes
              if (entityTypeIds && entityTypeIds.length > 0) {
                entityTypeIds.forEach((entityTypeId :UUID) => {
                  const targetEntityTypeIndex :number = target.get('entityTypes').findIndex(
                    (entityType :Map<*, *>) => entityType.get('id') === entityTypeId
                  );
                  if (targetEntityTypeIndex !== -1) {
                    newState = newState.deleteIn(['schemas', targetIndex, 'entityTypes', targetEntityTypeIndex]);
                  }
                  else {
                    LOG.error('EntityType not found in Schema', entityTypeId);
                  }
                });
              }

              // PropertyTypes
              if (propertyTypeIds && propertyTypeIds.length > 0) {
                propertyTypeIds.forEach((propertyTypeId :UUID) => {
                  const targetPropertyTypeIndex :number = target.get('propertyTypes').findIndex(
                    (propertyType :Map<*, *>) => propertyType.get('id') === propertyTypeId
                  );
                  if (targetPropertyTypeIndex !== -1) {
                    newState = newState.deleteIn(['schemas', targetIndex, 'propertyTypes', targetPropertyTypeIndex]);
                  }
                  else {
                    LOG.error('PropertyType not found in Schema', propertyTypeId);
                  }
                });
              }
            }
            else {
              LOG.error('invalid ActionType', actionType);
            }

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
