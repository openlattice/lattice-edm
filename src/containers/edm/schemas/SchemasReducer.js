/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

const { getAllSchemas } = EntityDataModelApiActionFactory;
const { FullyQualifiedName } = Models;

const INITIAL_STATE :Map<*, *> = fromJS({
  actions: {},
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

    default:
      return state;
  }
}
