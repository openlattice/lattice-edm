import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './SchemasReducer';

const {
  GET_ALL_SCHEMAS,
  getAllSchemas
} = EntityDataModelApiActionFactory;

const MOCK_FQN = 'MOCK_NAMESPACE.MOCK_NAME';

// yes, this is not a valid Schema, but the reducer only cares about the fqn
const MOCK_SCHEMA = {
  fqn: {
    namespace: 'MOCK_NAMESPACE',
    name: 'MOCK_NAME'
  }
};

describe('SchemasReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  describe('INITIAL_STATE', () => {

    test('should correctly initialize reducer state', () => {
      expect(INITIAL_STATE).toBeInstanceOf(Immutable.Map);
      expect(INITIAL_STATE.get('isFetchingAllSchemas')).toEqual(false);
      expect(INITIAL_STATE.get('schemas').toJS()).toEqual([]);
      expect(INITIAL_STATE.get('schemasByFqn').toJS()).toEqual({});
      expect(INITIAL_STATE.get('actions').toJS()).toEqual({
        createSchema: {},
        updateSchema: {}
      });
    });
  });

  describe(GET_ALL_SCHEMAS, () => {

    describe(getAllSchemas.REQUEST, () => {

      test('should set "isFetchingAllSchemas" to true', () => {
        const { id } = getAllSchemas();
        const state = reducer(INITIAL_STATE, getAllSchemas.request(id));
        expect(state.get('isFetchingAllSchemas')).toEqual(true);
      });
    });

    describe(getAllSchemas.SUCCESS, () => {

      test('should keep "isFetchingAllSchemas" as true', () => {
        const { id } = getAllSchemas();
        let state = reducer(INITIAL_STATE, getAllSchemas.request(id));
        state = reducer(state, getAllSchemas.success(id, [MOCK_SCHEMA]));
        expect(state.get('isFetchingAllSchemas')).toEqual(true);
      });

      test('should correctly set "schemas" and "schemasByFqn"', () => {
        const { id } = getAllSchemas();
        let state = reducer(INITIAL_STATE, getAllSchemas.request(id));
        state = reducer(state, getAllSchemas.success(id, [MOCK_SCHEMA]));
        expect(state.get('schemas').toJS()).toEqual([MOCK_SCHEMA]);
        expect(state.get('schemasByFqn').toJS()).toEqual({ [MOCK_FQN]: 0 });
      });
    });

    describe(getAllSchemas.FAILURE, () => {

      test('should keep "isFetchingAllSchemas" as true', () => {
        const { id } = getAllSchemas();
        let state = reducer(INITIAL_STATE, getAllSchemas.request(id));
        state = reducer(state, getAllSchemas.failure(id));
        expect(state.get('isFetchingAllSchemas')).toEqual(true);
      });

      test('should clear "schemas" and "schemasByFqn"', () => {
        const { id } = getAllSchemas();
        let state = reducer(INITIAL_STATE, getAllSchemas.request(id));
        state = reducer(state, getAllSchemas.failure(id));
        expect(state.get('schemas').toJS()).toEqual([]);
        expect(state.get('schemasByFqn').toJS()).toEqual({});
      });
    });

    describe(getAllSchemas.FINALLY, () => {

      test('should set "isFetchingAllSchemas" to false', () => {
        const { id } = getAllSchemas();
        let state = reducer(INITIAL_STATE, getAllSchemas.request(id));
        expect(state.get('isFetchingAllSchemas')).toEqual(true);
        state = reducer(state, getAllSchemas.finally(id));
        expect(state.get('isFetchingAllSchemas')).toEqual(false);
      });
    });

  });

});
