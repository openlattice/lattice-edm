/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';
import type { FQN, SchemaObject } from 'lattice';

import Logger from '../../../utils/Logger';
import {
  LOCAL_CREATE_SCHEMA,
  LOCAL_UPDATE_SCHEMA,
  localCreateSchema,
  localUpdateSchema,
} from './SchemasActions';
import type { IndexMap } from '../Types';

const LOG :Logger = new Logger('SchemasReducer');

const {
  getEntityDataModel,
} = EntityDataModelApiActions;

const {
  FullyQualifiedName,
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
              const schemaFQN :FQN = new FullyQualifiedName(s.fqn);
              const schema = new SchemaBuilder()
                .setFullyQualifiedName(schemaFQN)
                .setEntityTypes(s.entityTypes)
                .setPropertyTypes(s.propertyTypes)
                .build();
              schemas.push(schema.toImmutable());
              schemasIndexMap.set(schemaFQN, index);
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
            const schemaFQN :FQN = new FullyQualifiedName(storedSchema.fqn);
            const newSchema :Schema = new SchemaBuilder()
              .setFullyQualifiedName(schemaFQN)
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

    // case updateSchema.case(action.type): {
    //   return updateSchema.reducer(state, action, {
    //     REQUEST: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.setIn(['actions', 'updateSchema', seqAction.id], fromJS(seqAction));
    //     },
    //     SUCCESS: () => {
    //
    //       const seqAction :SequenceAction = (action :any);
    //       const storedSeqAction :Map<*, *> = state.getIn(['actions', 'updateSchema', seqAction.id], Map());
    //       if (storedSeqAction.isEmpty()) {
    //         return state;
    //       }
    //
    //       const targetFqn :string = FullyQualifiedName.toString(storedSeqAction.getIn(['value', 'schemaFqn']));
    //       const targetIndex :number = state.getIn(['schemasByFqn', targetFqn], -1);
    //       if (targetIndex === -1) {
    //         return state;
    //       }
    //
    //       const currentSchema :Map<*, *> = state.getIn(['schemas', targetIndex], Map());
    //       const currentEntityTypes :List<Map<*, *>> = currentSchema.get('entityTypes', List());
    //       const currentPropertyTypes :List<Map<*, *>> = currentSchema.get('propertyTypes', List());
    //
    //       let workingEntityTypes :List<Map<*, *>> = currentEntityTypes;
    //       let workingPropertyTypes :List<Map<*, *>> = currentPropertyTypes;
    //
    //       const actionEntityTypes :Map<*, *> = storedSeqAction.getIn(['value', 'entityTypes'], Map());
    //       const actionEntityTypeIds :List<string> = storedSeqAction.getIn(['value', 'entityTypeIds'], List());
    //       const actionPropertyTypes :Map<*, *> = storedSeqAction.getIn(['value', 'propertyTypes'], Map());
    //       const actionPropertyTypeIds :List<string> = storedSeqAction.getIn(['value', 'propertyTypeIds'], List());
    //
    //       if (storedSeqAction.getIn(['value', 'action']) === ActionTypes.ADD) {
    //
    //         // EntityTypes
    //         if (!actionEntityTypeIds.isEmpty() && !actionEntityTypes.isEmpty()) {
    //           actionEntityTypes.forEach((actionEntityType :Map<*, *>) => {
    //             const matchingIndex :number = workingEntityTypes.findIndex(
    //               (workingEntityType :Map<*, *>) => workingEntityType.get('id') === actionEntityType.get('id')
    //             );
    //             if (matchingIndex === -1) {
    //               workingEntityTypes = workingEntityTypes.push(actionEntityType);
    //             }
    //           });
    //         }
    //
    //         // PropertyTypes
    //         if (!actionPropertyTypeIds.isEmpty() && !actionPropertyTypes.isEmpty()) {
    //           actionPropertyTypes.forEach((actionPropertyType :Map<*, *>) => {
    //             const matchingIndex :number = workingPropertyTypes.findIndex(
    //               (workingPropertyType :Map<*, *>) => workingPropertyType.get('id') === actionPropertyType.get('id')
    //             );
    //             if (matchingIndex === -1) {
    //               workingPropertyTypes = workingPropertyTypes.push(actionPropertyType);
    //             }
    //           });
    //         }
    //       }
    //       else if (storedSeqAction.getIn(['value', 'action']) === ActionTypes.REMOVE) {
    //
    //         // EntityTypes
    //         if (!actionEntityTypeIds.isEmpty() && !workingEntityTypes.isEmpty()) {
    //           actionEntityTypeIds.forEach((entityTypeId :string) => {
    //             const targetEntityTypeIndex :number = workingEntityTypes
    //               .findIndex((entityType :Map<*, *>) => entityType.get('id') === entityTypeId);
    //             if (targetEntityTypeIndex !== -1) {
    //               workingEntityTypes = workingEntityTypes.delete(targetEntityTypeIndex);
    //             }
    //           });
    //         }
    //
    //         // PropertyTypes
    //         if (!actionPropertyTypeIds.isEmpty() && !workingPropertyTypes.isEmpty()) {
    //           actionPropertyTypeIds.forEach((propertyTypeId :string) => {
    //             const targetPropertyTypeIndex :number = workingPropertyTypes
    //               .findIndex((propertyType :Map<*, *>) => propertyType.get('id') === propertyTypeId);
    //             if (targetPropertyTypeIndex !== -1) {
    //               workingPropertyTypes = workingPropertyTypes.delete(targetPropertyTypeIndex);
    //             }
    //           });
    //         }
    //       }
    //       else {
    //         return state;
    //       }
    //
    //       const updatedSchema :Map<*, *> = currentSchema
    //         .set('entityTypes', workingEntityTypes)
    //         .set('propertyTypes', workingPropertyTypes);
    //
    //       return state.setIn(['schemas', targetIndex], updatedSchema);
    //     },
    //     FAILURE: () => {
    //       // TODO: need to properly handle the failure case
    //       return state;
    //     },
    //     FINALLY: () => {
    //       const seqAction :SequenceAction = (action :any);
    //       return state.deleteIn(['actions', 'updateSchema', seqAction.id]);
    //     }
    //   });
    // }

    default:
      return state;
  }
}
