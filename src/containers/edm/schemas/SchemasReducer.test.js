import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

import reducer from './SchemasReducer';
import { MOCK_SCHEMA } from '../../../utils/testing/MockDataModels';
import {
  LOCAL_CREATE_SCHEMA,
  LOCAL_UPDATE_SCHEMA,
  localCreateSchema,
  localUpdateSchema,
} from './SchemasActions';

const {
  FullyQualifiedName,
} = Models;

const {
  GET_ENTITY_DATA_MODEL,
  getEntityDataModel,
} = EntityDataModelApiActions;

describe('SchemasReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.toJS()).toEqual({
      [LOCAL_CREATE_SCHEMA]: { error: false },
      [LOCAL_UPDATE_SCHEMA]: { error: false },
      newlyCreatedSchemaFQN: undefined,
      schemas: [],
      schemasIndexMap: {},
    });
  });

  describe(GET_ENTITY_DATA_MODEL, () => {

    test(getEntityDataModel.REQUEST, () => {

      const { id } = getEntityDataModel();
      const stateAfterRequest = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      expect(stateAfterRequest.hashCode()).toEqual(INITIAL_STATE.hashCode());
      expect(stateAfterRequest.equals(INITIAL_STATE)).toEqual(true);
    });

    // TODO: test SUCCESS with variable size result
    test(getEntityDataModel.SUCCESS, () => {

      const { id } = getEntityDataModel();
      const response = { schemas: [MOCK_SCHEMA.toObject()] };
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.success(id, response));

      const expectedSchemas = List().push(MOCK_SCHEMA.toImmutable());
      expect(state.get('schemas').hashCode()).toEqual(expectedSchemas.hashCode());
      expect(state.get('schemas').equals(expectedSchemas)).toEqual(true);

      const expectedSchemasIndexMap = Map().set(MOCK_SCHEMA.fqn, 0);
      expect(state.get('schemasIndexMap').hashCode()).toEqual(expectedSchemasIndexMap.hashCode());
      expect(state.get('schemasIndexMap').equals(expectedSchemasIndexMap)).toEqual(true);
      state.get('schemasIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(getEntityDataModel.FAILURE, () => {

      const { id } = getEntityDataModel();
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.failure(id));
      expect(state.get('schemas').toJS()).toEqual([]);
      expect(state.get('schemasIndexMap').toJS()).toEqual({});
    });

    test(getEntityDataModel.FINALLY, () => {

      const { id } = getEntityDataModel();
      const stateAfterRequest = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      const stateAfterFinally = reducer(stateAfterRequest, getEntityDataModel.finally(id));
      expect(stateAfterFinally.hashCode()).toEqual(stateAfterRequest.hashCode());
      expect(stateAfterFinally.equals(stateAfterRequest)).toEqual(true);
    });

  });

  describe(LOCAL_CREATE_SCHEMA, () => {

    test(localCreateSchema.REQUEST, () => {

      const { id } = localCreateSchema();
      const requestAction = localCreateSchema.request(id, MOCK_SCHEMA);
      const state = reducer(INITIAL_STATE, requestAction);

      expect(state.getIn([LOCAL_CREATE_SCHEMA, id])).toEqual(requestAction);
      expect(state.has('newlyCreatedSchemaFQN')).toEqual(true);
      expect(state.get('newlyCreatedSchemaFQN')).toEqual(undefined);
    });

    test(localCreateSchema.SUCCESS, () => {

      const { id } = localCreateSchema();
      const requestAction = localCreateSchema.request(id, MOCK_SCHEMA);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreateSchema.success(id));

      expect(state.getIn([LOCAL_CREATE_SCHEMA, id])).toEqual(requestAction);
      expect(state.get('newlyCreatedSchemaFQN')).toEqual(MOCK_SCHEMA.fqn);
      expect(state.get('newlyCreatedSchemaFQN')).toBeInstanceOf(FullyQualifiedName);

      const expectedSchemas = List().push(MOCK_SCHEMA.toImmutable());
      expect(state.get('schemas').hashCode()).toEqual(expectedSchemas.hashCode());
      expect(state.get('schemas').equals(expectedSchemas)).toEqual(true);

      const expectedSchemasIndexMap = Map().set(MOCK_SCHEMA.fqn, 0);
      expect(state.get('schemasIndexMap').hashCode()).toEqual(expectedSchemasIndexMap.hashCode());
      expect(state.get('schemasIndexMap').equals(expectedSchemasIndexMap)).toEqual(true);
      state.get('schemasIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(localCreateSchema.FAILURE, () => {

      const { id } = localCreateSchema();
      const requestAction = localCreateSchema.request(id, MOCK_SCHEMA);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreateSchema.failure(id));

      expect(state.getIn([LOCAL_CREATE_SCHEMA, id])).toEqual(requestAction);
      expect(state.getIn([LOCAL_CREATE_SCHEMA, 'error'])).toEqual(true);
      expect(state.has('newlyCreatedSchemaFQN')).toEqual(true);
      expect(state.get('newlyCreatedSchemaFQN')).toEqual(undefined);

      const expectedSchemas = List();
      expect(state.get('schemas').hashCode()).toEqual(expectedSchemas.hashCode());
      expect(state.get('schemas').equals(expectedSchemas)).toEqual(true);

      const expectedSchemasIndexMap = Map();
      expect(state.get('schemasIndexMap').hashCode()).toEqual(expectedSchemasIndexMap.hashCode());
      expect(state.get('schemasIndexMap').equals(expectedSchemasIndexMap)).toEqual(true);
    });

    test(localCreateSchema.FINALLY, () => {

      const { id } = localCreateSchema();
      let state = reducer(INITIAL_STATE, localCreateSchema.request(id, MOCK_SCHEMA));
      state = reducer(state, localCreateSchema.success(id));
      state = reducer(state, localCreateSchema.finally(id));

      expect(state.hasIn([LOCAL_CREATE_SCHEMA, id])).toEqual(false);
      expect(state.get('newlyCreatedSchemaFQN')).toEqual(MOCK_SCHEMA.fqn);
      expect(state.get('newlyCreatedSchemaFQN')).toBeInstanceOf(FullyQualifiedName);
    });

  });

});
