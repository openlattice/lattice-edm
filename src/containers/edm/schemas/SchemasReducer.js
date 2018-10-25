/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

const { FullyQualifiedName, Schema, SchemaBuilder } = Models;
const { ActionTypes } = Types;
const { createSchema, getEntityDataModel, updateSchema } = EntityDataModelApiActions;

const INITIAL_STATE :Map<*, *> = fromJS({
  actions: {
    createSchema: Map(),
    updateSchema: Map()
  },
  isCreatingNewSchema: false,
  isFetchingAllSchemas: false,
  newlyCreatedSchemaFqn: '',
  schemas: List(),
  schemasByFqn: Map()
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case createSchema.case(action.type): {
      return createSchema.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewSchema', true)
            .set('newlyCreatedSchemaFqn', '')
            .setIn(['actions', 'createSchema', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'createSchema', seqAction.id], Map());

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const tempSchema :Schema = storedSeqAction.get('value');
          const newSchemaFqn :string = FullyQualifiedName.toString(tempSchema.fqn);
          const newSchema :Schema = (new SchemaBuilder())
            .setFullyQualifiedName(tempSchema.fqn)
            .setEntityTypes(tempSchema.entityTypes)
            .setPropertyTypes(tempSchema.propertyTypes)
            .build();

          const iSchema :Map<*, *> = newSchema.asImmutable();
          const current :List<Map<*, *>> = state.get('schemas', List());
          const updated :List<Map<*, *>> = current.push(iSchema);

          const currentByFqn :Map<string, number> = state.get('schemasByFqn', Map());
          const updatedByFqn :Map<string, number> = currentByFqn.set(newSchemaFqn, updated.size - 1);

          return state
            .set('newlyCreatedSchemaFqn', newSchemaFqn)
            .set('schemas', updated)
            .set('schemasByFqn', updatedByFqn);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewSchema', false)
            .set('newlyCreatedSchemaFqn', '')
            .deleteIn(['actions', 'createSchema', seqAction.id]);
        }
      });
    }

    case getEntityDataModel.case(action.type): {
      return getEntityDataModel.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingAllSchemas', true);
        },
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const schemas :List<Map<*, *>> = fromJS(seqAction.value.schemas);
          const schemasByFqn :Map<string, number> = Map()
            .withMutations((byIdMap :Map<string, number>) => {
              schemas.forEach((schema :Map<*, *>, schemaIndex :number) => {
                byIdMap.set(FullyQualifiedName.toString(schema.get('fqn', Map())), schemaIndex);
              });
            });
          return state
            .set('schemas', schemas)
            .set('schemasByFqn', schemasByFqn);
        },
        FAILURE: () => {
          return state
            .set('schemas', List())
            .set('schemasByFqn', Map());
        },
        FINALLY: () => {
          return state.set('isFetchingAllSchemas', false);
        }
      });
    }

    case updateSchema.case(action.type): {
      return updateSchema.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'updateSchema', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'updateSchema', seqAction.id], Map());
          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const targetFqn :string = FullyQualifiedName.toString(storedSeqAction.getIn(['value', 'schemaFqn']));
          const targetIndex :number = state.getIn(['schemasByFqn', targetFqn], -1);
          if (targetIndex === -1) {
            return state;
          }

          const currentSchema :Map<*, *> = state.getIn(['schemas', targetIndex], Map());
          const currentEntityTypes :List<Map<*, *>> = currentSchema.get('entityTypes', List());
          const currentPropertyTypes :List<Map<*, *>> = currentSchema.get('propertyTypes', List());

          let workingEntityTypes :List<Map<*, *>> = currentEntityTypes;
          let workingPropertyTypes :List<Map<*, *>> = currentPropertyTypes;

          const actionEntityTypes :Map<*, *> = storedSeqAction.getIn(['value', 'entityTypes'], Map());
          const actionEntityTypeIds :List<string> = storedSeqAction.getIn(['value', 'entityTypeIds'], List());
          const actionPropertyTypes :Map<*, *> = storedSeqAction.getIn(['value', 'propertyTypes'], Map());
          const actionPropertyTypeIds :List<string> = storedSeqAction.getIn(['value', 'propertyTypeIds'], List());

          if (storedSeqAction.getIn(['value', 'action']) === ActionTypes.ADD) {

            // EntityTypes
            if (!actionEntityTypeIds.isEmpty() && !actionEntityTypes.isEmpty()) {
              actionEntityTypes.forEach((actionEntityType :Map<*, *>) => {
                const matchingIndex :number = workingEntityTypes.findIndex(
                  (workingEntityType :Map<*, *>) => workingEntityType.get('id') === actionEntityType.get('id')
                );
                if (matchingIndex === -1) {
                  workingEntityTypes = workingEntityTypes.push(actionEntityType);
                }
              });
            }

            // PropertyTypes
            if (!actionPropertyTypeIds.isEmpty() && !actionPropertyTypes.isEmpty()) {
              actionPropertyTypes.forEach((actionPropertyType :Map<*, *>) => {
                const matchingIndex :number = workingPropertyTypes.findIndex(
                  (workingPropertyType :Map<*, *>) => workingPropertyType.get('id') === actionPropertyType.get('id')
                );
                if (matchingIndex === -1) {
                  workingPropertyTypes = workingPropertyTypes.push(actionPropertyType);
                }
              });
            }
          }
          else if (storedSeqAction.getIn(['value', 'action']) === ActionTypes.REMOVE) {

            // EntityTypes
            if (!actionEntityTypeIds.isEmpty() && !workingEntityTypes.isEmpty()) {
              actionEntityTypeIds.forEach((entityTypeId :string) => {
                const targetEntityTypeIndex :number = workingEntityTypes
                  .findIndex((entityType :Map<*, *>) => entityType.get('id') === entityTypeId);
                if (targetEntityTypeIndex !== -1) {
                  workingEntityTypes = workingEntityTypes.delete(targetEntityTypeIndex);
                }
              });
            }

            // PropertyTypes
            if (!actionPropertyTypeIds.isEmpty() && !workingPropertyTypes.isEmpty()) {
              actionPropertyTypeIds.forEach((propertyTypeId :string) => {
                const targetPropertyTypeIndex :number = workingPropertyTypes
                  .findIndex((propertyType :Map<*, *>) => propertyType.get('id') === propertyTypeId);
                if (targetPropertyTypeIndex !== -1) {
                  workingPropertyTypes = workingPropertyTypes.delete(targetPropertyTypeIndex);
                }
              });
            }
          }
          else {
            return state;
          }

          const updatedSchema :Map<*, *> = currentSchema
            .set('entityTypes', workingEntityTypes)
            .set('propertyTypes', workingPropertyTypes);

          return state.setIn(['schemas', targetIndex], updatedSchema);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'updateSchema', seqAction.id]);
        }
      });
    }

    default:
      return state;
  }
}
