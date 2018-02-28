/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

const { FullyQualifiedName } = Models;
const { ActionTypes } = Types;
const { getAllSchemas, updateSchema } = EntityDataModelApiActionFactory;

const INITIAL_STATE :Map<*, *> = fromJS({
  actions: {
    updateSchema: Map()
  },
  isFetchingAllSchemas: false,
  schemas: List(),
  schemasByFqn: Map()
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getAllSchemas.case(action.type): {
      return getAllSchemas.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingAllSchemas', true);
        },
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const schemas :List<Map<*, *>> = fromJS(seqAction.value);
          const schemasByFqn :Map<string, number> = Map()
            .withMutations((byIdMap :Map<string, number>) => {
              schemas.forEach((schema :Map<*, *>, schemaIndex :number) => {
                const fqn :FullyQualifiedName = new FullyQualifiedName(schema.get('fqn', Map()));
                byIdMap.set(fqn.getFullyQualifiedName(), schemaIndex);
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

          const actionEntityTypeIds :List<string> = storedSeqAction.getIn(['value', 'entityTypeIds'], List());
          const actionPropertyTypeIds :List<string> = storedSeqAction.getIn(['value', 'propertyTypeIds'], List());

          if (storedSeqAction.getIn(['value', 'action']) === ActionTypes.REMOVE) {

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
