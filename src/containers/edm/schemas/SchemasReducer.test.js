import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

import reducer from './SchemasReducer';
import { INVALID_PARAMS_SS } from '../../../utils/testing/Invalid';
import {
  MOCK_SCHEMA,
  genRandomEntityType,
  genRandomFQN,
  genRandomPropertyType
} from '../../../utils/testing/MockDataModels';
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
  ActionTypes,
} = Types;

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

  describe(LOCAL_UPDATE_SCHEMA, () => {

    const initialState = INITIAL_STATE
      .setIn(['schemas', 0], MOCK_SCHEMA.toImmutable())
      .setIn(['schemasIndexMap', MOCK_SCHEMA.fqn], 0);

    describe(`${ActionTypes.ADD} - EntityType`, () => {

      const mockActionValue = {
        actionType: ActionTypes.ADD,
        entityTypes: [genRandomEntityType().toImmutable()],
        schemaFQN: MOCK_SCHEMA.fqn,
      };

      test('should not mutate state', () => {

        List(INVALID_PARAMS_SS).push(genRandomFQN()).forEach((invalidParam) => {
          const { id } = localUpdateSchema();
          const requestAction = localUpdateSchema.request(id, {
            actionType: ActionTypes.ADD,
            entityTypes: [genRandomEntityType().toImmutable()],
            schemaFQN: invalidParam,
          });
          const stateAfterRequest = reducer(initialState, requestAction);
          const stateAfterSuccess = reducer(stateAfterRequest, localUpdateSchema.success(id));
          expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
          expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
        });
      });

      test(localUpdateSchema.REQUEST, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);
      });

      test(localUpdateSchema.SUCCESS, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.success(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

        const schema = MOCK_SCHEMA.toImmutable();
        const expectedSchemas = List().push(
          schema.set('entityTypes', schema.get('entityTypes').push(mockActionValue.entityTypes[0]))
        );
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

      test(localUpdateSchema.FAILURE, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.failure(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

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

      test(localUpdateSchema.FINALLY, () => {

        const { id } = localUpdateSchema();
        let state = reducer(initialState, localUpdateSchema.request(id, mockActionValue));
        state = reducer(state, localUpdateSchema.success(id));
        state = reducer(state, localUpdateSchema.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(false);
      });

    });

    describe(`${ActionTypes.ADD} - PropertyType`, () => {

      const mockActionValue = {
        actionType: ActionTypes.ADD,
        propertyTypes: [genRandomPropertyType().toImmutable()],
        schemaFQN: MOCK_SCHEMA.fqn,
      };

      test('should not mutate state', () => {

        List(INVALID_PARAMS_SS).push(genRandomFQN()).forEach((invalidParam) => {
          const { id } = localUpdateSchema();
          const requestAction = localUpdateSchema.request(id, {
            actionType: ActionTypes.ADD,
            propertyTypes: [genRandomPropertyType().toImmutable()],
            schemaFQN: invalidParam,
          });
          const stateAfterRequest = reducer(initialState, requestAction);
          const stateAfterSuccess = reducer(stateAfterRequest, localUpdateSchema.success(id));
          expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
          expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
        });
      });

      test(localUpdateSchema.REQUEST, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);
      });

      test(localUpdateSchema.SUCCESS, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.success(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

        const schema = MOCK_SCHEMA.toImmutable();
        const expectedSchemas = List().push(
          schema.set('propertyTypes', schema.get('propertyTypes').push(mockActionValue.propertyTypes[0]))
        );
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

      test(localUpdateSchema.FAILURE, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.failure(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

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

      test(localUpdateSchema.FINALLY, () => {

        const { id } = localUpdateSchema();
        let state = reducer(initialState, localUpdateSchema.request(id, mockActionValue));
        state = reducer(state, localUpdateSchema.success(id));
        state = reducer(state, localUpdateSchema.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(false);
      });

    });

    describe(`${ActionTypes.REMOVE} - EntityType`, () => {

      const mockActionValue = {
        actionType: ActionTypes.REMOVE,
        entityTypeIds: [MOCK_SCHEMA.entityTypes[0].id],
        schemaFQN: MOCK_SCHEMA.fqn,
      };

      test('should not mutate state', () => {

        List(INVALID_PARAMS_SS).push(genRandomFQN()).forEach((invalidParam) => {
          const { id } = localUpdateSchema();
          const requestAction = localUpdateSchema.request(id, {
            actionType: ActionTypes.ADD,
            entityTypeIds: [MOCK_SCHEMA.entityTypes[0].id],
            schemaFQN: invalidParam,
          });
          const stateAfterRequest = reducer(initialState, requestAction);
          const stateAfterSuccess = reducer(stateAfterRequest, localUpdateSchema.success(id));
          expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
          expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
        });
      });

      test(localUpdateSchema.REQUEST, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);
      });

      test(localUpdateSchema.SUCCESS, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.success(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

        const schema = MOCK_SCHEMA.toImmutable();
        const expectedSchemas = List().push(
          schema.set('entityTypes', schema.get('entityTypes').delete(0))
        );
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

      test(localUpdateSchema.FAILURE, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.failure(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

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

      test(localUpdateSchema.FINALLY, () => {

        const { id } = localUpdateSchema();
        let state = reducer(initialState, localUpdateSchema.request(id, mockActionValue));
        state = reducer(state, localUpdateSchema.success(id));
        state = reducer(state, localUpdateSchema.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(false);
      });

    });

    describe(`${ActionTypes.REMOVE} - PropertyType`, () => {

      const mockActionValue = {
        actionType: ActionTypes.REMOVE,
        propertyTypeIds: [MOCK_SCHEMA.propertyTypes[0].id],
        schemaFQN: MOCK_SCHEMA.fqn,
      };

      test('should not mutate state', () => {

        List(INVALID_PARAMS_SS).push(genRandomFQN()).forEach((invalidParam) => {
          const { id } = localUpdateSchema();
          const requestAction = localUpdateSchema.request(id, {
            actionType: ActionTypes.ADD,
            propertyTypeIds: [MOCK_SCHEMA.propertyTypes[0].id],
            schemaFQN: invalidParam,
          });
          const stateAfterRequest = reducer(initialState, requestAction);
          const stateAfterSuccess = reducer(stateAfterRequest, localUpdateSchema.success(id));
          expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
          expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
        });
      });

      test(localUpdateSchema.REQUEST, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);
      });

      test(localUpdateSchema.SUCCESS, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.success(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

        const schema = MOCK_SCHEMA.toImmutable();
        const expectedSchemas = List().push(
          schema.set('propertyTypes', schema.get('propertyTypes').delete(0))
        );
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

      test(localUpdateSchema.FAILURE, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.failure(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

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

      test(localUpdateSchema.FINALLY, () => {

        const { id } = localUpdateSchema();
        let state = reducer(initialState, localUpdateSchema.request(id, mockActionValue));
        state = reducer(state, localUpdateSchema.success(id));
        state = reducer(state, localUpdateSchema.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(false);
      });

    });

  });

});
