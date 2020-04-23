import { v4 as uuid } from 'uuid';
import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';

import reducer from './PropertyTypesReducer';
import { MOCK_PROPERTY_TYPE, genRandomFQN } from '../../../utils/testing/MockDataModels';
import { INVALID_PARAMS_SS } from '../../../utils/testing/Invalid';
import { genRandomString } from '../../../utils/testing/MockUtils';
import {
  LOCAL_CREATE_PROPERTY_TYPE,
  LOCAL_DELETE_PROPERTY_TYPE,
  LOCAL_UPDATE_PROPERTY_TYPE_META,
  RESET_REQUEST_STATE,
  localCreatePropertyType,
  localDeletePropertyType,
  localUpdatePropertyTypeMeta,
  resetRequestState,
} from './PropertyTypesActions';
import {
  LOCAL_UPDATE_SCHEMA,
  localUpdateSchema,
} from '../schemas/SchemasActions';

const {
  FullyQualifiedName,
  PropertyTypeBuilder,
} = Models;

const {
  ActionTypes,
} = Types;

const {
  GET_ENTITY_DATA_MODEL,
  getEntityDataModel,
} = EntityDataModelApiActions;

describe('PropertyTypesReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.toJS()).toEqual({
      [LOCAL_CREATE_PROPERTY_TYPE]: { requestState: RequestStates.STANDBY },
      [LOCAL_DELETE_PROPERTY_TYPE]: { requestState: RequestStates.STANDBY },
      [LOCAL_UPDATE_PROPERTY_TYPE_META]: { requestState: RequestStates.STANDBY },
      [LOCAL_UPDATE_SCHEMA]: { requestState: RequestStates.STANDBY },
      newlyCreatedPropertyTypeFQN: undefined,
      propertyTypes: [],
      propertyTypesIndexMap: {},
    });
  });

  describe(RESET_REQUEST_STATE, () => {

    const initialState = INITIAL_STATE
      .setIn([LOCAL_CREATE_PROPERTY_TYPE, 'requestState'], RequestStates.PENDING)
      .setIn([LOCAL_DELETE_PROPERTY_TYPE, 'requestState'], RequestStates.PENDING)
      .setIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'], RequestStates.PENDING)
      .setIn([LOCAL_UPDATE_SCHEMA, 'requestState'], RequestStates.PENDING);

    test(LOCAL_CREATE_PROPERTY_TYPE, () => {

      const newState = reducer(initialState, resetRequestState(LOCAL_CREATE_PROPERTY_TYPE));
      expect(newState.getIn([LOCAL_CREATE_PROPERTY_TYPE, 'requestState'])).toEqual(RequestStates.STANDBY);
      expect(newState.getIn([LOCAL_DELETE_PROPERTY_TYPE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(newState.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(newState.getIn([LOCAL_UPDATE_SCHEMA, 'requestState'])).toEqual(RequestStates.PENDING);
    });

    test(LOCAL_DELETE_PROPERTY_TYPE, () => {

      const newState = reducer(initialState, resetRequestState(LOCAL_DELETE_PROPERTY_TYPE));
      expect(newState.getIn([LOCAL_CREATE_PROPERTY_TYPE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(newState.getIn([LOCAL_DELETE_PROPERTY_TYPE, 'requestState'])).toEqual(RequestStates.STANDBY);
      expect(newState.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(newState.getIn([LOCAL_UPDATE_SCHEMA, 'requestState'])).toEqual(RequestStates.PENDING);
    });

    test(LOCAL_UPDATE_PROPERTY_TYPE_META, () => {

      const newState = reducer(initialState, resetRequestState(LOCAL_UPDATE_PROPERTY_TYPE_META));
      expect(newState.getIn([LOCAL_CREATE_PROPERTY_TYPE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(newState.getIn([LOCAL_DELETE_PROPERTY_TYPE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(newState.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.STANDBY);
      expect(newState.getIn([LOCAL_UPDATE_SCHEMA, 'requestState'])).toEqual(RequestStates.PENDING);
    });

    test(LOCAL_UPDATE_SCHEMA, () => {

      const newState = reducer(initialState, resetRequestState(LOCAL_UPDATE_SCHEMA));
      expect(newState.getIn([LOCAL_CREATE_PROPERTY_TYPE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(newState.getIn([LOCAL_DELETE_PROPERTY_TYPE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(newState.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(newState.getIn([LOCAL_UPDATE_SCHEMA, 'requestState'])).toEqual(RequestStates.STANDBY);
    });

    test('should not change state given an invalid action type', () => {

      INVALID_PARAMS_SS.forEach((invalid) => {
        const stateAfterRequest = reducer(INITIAL_STATE, resetRequestState(invalid));
        expect(stateAfterRequest.hashCode()).toEqual(INITIAL_STATE.hashCode());
        expect(stateAfterRequest.equals(INITIAL_STATE)).toEqual(true);
      });
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
      const response = { propertyTypes: [MOCK_PROPERTY_TYPE.toObject()] };
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.success(id, response));

      const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
      expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
      expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

      const expectedPropertyTypesIndexMap = Map()
        .set(MOCK_PROPERTY_TYPE.id, 0)
        .set(MOCK_PROPERTY_TYPE.type, 0);
      expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
      expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
      state.get('propertyTypesIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(getEntityDataModel.FAILURE, () => {

      const { id } = getEntityDataModel();
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.failure(id));

      expect(state.get('propertyTypes').toJS()).toEqual([]);
      expect(state.get('propertyTypesIndexMap').toJS()).toEqual({});
    });

    test(getEntityDataModel.FINALLY, () => {

      const { id } = getEntityDataModel();
      const stateAfterRequest = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      const stateAfterFinally = reducer(stateAfterRequest, getEntityDataModel.finally(id));
      expect(stateAfterFinally.hashCode()).toEqual(stateAfterRequest.hashCode());
      expect(stateAfterFinally.equals(stateAfterRequest)).toEqual(true);
    });

  });

  describe(LOCAL_CREATE_PROPERTY_TYPE, () => {

    test(localCreatePropertyType.REQUEST, () => {

      const { id } = localCreatePropertyType();
      const requestAction = localCreatePropertyType.request(id, MOCK_PROPERTY_TYPE);
      const state = reducer(INITIAL_STATE, requestAction);

      expect(state.getIn([LOCAL_CREATE_PROPERTY_TYPE, id])).toEqual(requestAction);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toEqual(undefined);
    });

    test(localCreatePropertyType.SUCCESS, () => {

      const { id } = localCreatePropertyType();
      const requestAction = localCreatePropertyType.request(id, MOCK_PROPERTY_TYPE);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreatePropertyType.success(id, MOCK_PROPERTY_TYPE.id));

      expect(state.getIn([LOCAL_CREATE_PROPERTY_TYPE, id])).toEqual(requestAction);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toEqual(MOCK_PROPERTY_TYPE.type);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toBeInstanceOf(FullyQualifiedName);

      const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
      expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
      expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

      const expectedPropertyTypesIndexMap = Map()
        .set(MOCK_PROPERTY_TYPE.id, 0)
        .set(MOCK_PROPERTY_TYPE.type, 0);
      expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
      expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
      state.get('propertyTypesIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(localCreatePropertyType.FAILURE, () => {

      const { id } = localCreatePropertyType();
      const requestAction = localCreatePropertyType.request(id, MOCK_PROPERTY_TYPE);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreatePropertyType.failure(id));

      expect(state.getIn([LOCAL_CREATE_PROPERTY_TYPE, id])).toEqual(requestAction);
      expect(state.getIn([LOCAL_CREATE_PROPERTY_TYPE, 'error'])).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toEqual(undefined);

      const expectedPropertyTypes = List();
      expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
      expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

      const expectedPropertyTypesIndexMap = Map();
      expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
      expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
    });

    test(localCreatePropertyType.FINALLY, () => {

      const { id } = localCreatePropertyType();
      let state = reducer(INITIAL_STATE, localCreatePropertyType.request(id, MOCK_PROPERTY_TYPE));
      state = reducer(state, localCreatePropertyType.success(id, MOCK_PROPERTY_TYPE.id));
      state = reducer(state, localCreatePropertyType.finally(id));

      expect(state.hasIn([LOCAL_CREATE_PROPERTY_TYPE, id])).toEqual(false);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toEqual(MOCK_PROPERTY_TYPE.type);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toBeInstanceOf(FullyQualifiedName);
    });

  });

  describe(LOCAL_DELETE_PROPERTY_TYPE, () => {

    test(localDeletePropertyType.REQUEST, () => {

      const { id } = localDeletePropertyType();
      const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: MOCK_PROPERTY_TYPE.type });
      const state = reducer(INITIAL_STATE, requestAction);
      expect(state.getIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(requestAction);
    });

    describe(localDeletePropertyType.SUCCESS, () => {

      test('should delete PropertyType', () => {

        const initialState = INITIAL_STATE
          .setIn(['propertyTypes', 0], MOCK_PROPERTY_TYPE.toImmutable())
          .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.id], 0)
          .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.type], 0);

        const { id } = localDeletePropertyType();
        const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: MOCK_PROPERTY_TYPE.type });
        let state = reducer(initialState, requestAction);
        state = reducer(state, localDeletePropertyType.success(id));

        expect(state.getIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(requestAction);
        expect(state.get('propertyTypes').toJS()).toEqual([]);
        expect(state.get('propertyTypesIndexMap').toJS()).toEqual({});
      });

      test('should correctly update "propertyTypes" and "propertyTypesIndexMap"', () => {

        const mockPropertyType0 = new PropertyTypeBuilder()
          .setDataType('String')
          .setId(uuid())
          .setTitle('title')
          .setType(new FullyQualifiedName(genRandomString(), genRandomString()))
          .build();

        const mockPropertyType1 = new PropertyTypeBuilder()
          .setDataType('String')
          .setId(uuid())
          .setTitle('title')
          .setType(new FullyQualifiedName(genRandomString(), genRandomString()))
          .build();

        const mockPropertyType2 = new PropertyTypeBuilder()
          .setDataType('String')
          .setId(uuid())
          .setTitle('title')
          .setType(new FullyQualifiedName(genRandomString(), genRandomString()))
          .build();

        const initialState = INITIAL_STATE
          .setIn(['propertyTypes', 0], mockPropertyType0.toImmutable())
          .setIn(['propertyTypes', 1], mockPropertyType1.toImmutable())
          .setIn(['propertyTypes', 2], mockPropertyType2.toImmutable())
          .setIn(['propertyTypesIndexMap', mockPropertyType0.id], 0)
          .setIn(['propertyTypesIndexMap', mockPropertyType0.type], 0)
          .setIn(['propertyTypesIndexMap', mockPropertyType1.id], 1)
          .setIn(['propertyTypesIndexMap', mockPropertyType1.type], 1)
          .setIn(['propertyTypesIndexMap', mockPropertyType2.id], 2)
          .setIn(['propertyTypesIndexMap', mockPropertyType2.type], 2);

        const { id } = localDeletePropertyType();
        const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: mockPropertyType1.type });
        let state = reducer(initialState, requestAction);
        state = reducer(state, localDeletePropertyType.success(id));
        expect(state.getIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(requestAction);

        const expectedPropertyTypes = List()
          .push(mockPropertyType0.toImmutable())
          .push(mockPropertyType2.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(mockPropertyType0.id, 0)
          .set(mockPropertyType0.type, 0)
          .set(mockPropertyType2.id, 1)
          .set(mockPropertyType2.type, 1);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test('should not mutate state if attempting to delete a non-existent PropertyType', () => {

        const initialState = INITIAL_STATE
          .setIn(['propertyTypes', 0], MOCK_PROPERTY_TYPE.toImmutable())
          .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.id], 0)
          .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.type], 0);

        const { id } = localDeletePropertyType();
        const propertyTypeFQN = new FullyQualifiedName(genRandomString(), genRandomString());
        const stateAfterRequest = reducer(initialState, localDeletePropertyType.request(id, { propertyTypeFQN }));
        const stateAfterSuccess = reducer(stateAfterRequest, localDeletePropertyType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localDeletePropertyType.FAILURE, () => {

      const initialState = INITIAL_STATE
        .setIn(['propertyTypes', 0], MOCK_PROPERTY_TYPE.toImmutable())
        .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.id], 0)
        .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.type], 0);

      const { id } = localDeletePropertyType();
      const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: MOCK_PROPERTY_TYPE.type });
      let state = reducer(initialState, requestAction);
      state = reducer(state, localDeletePropertyType.failure(id));

      expect(state.getIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(requestAction);
      expect(state.getIn([LOCAL_DELETE_PROPERTY_TYPE, 'error'])).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toEqual(undefined);

      const expectedPropertyTypes = initialState.get('propertyTypes');
      expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
      expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

      const expectedPropertyTypesIndexMap = initialState.get('propertyTypesIndexMap');
      expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
      expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
    });

    test(localDeletePropertyType.FINALLY, () => {

      const { id } = localDeletePropertyType();
      const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: MOCK_PROPERTY_TYPE.type });
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localDeletePropertyType.success(id));
      state = reducer(state, localDeletePropertyType.finally(id));
      expect(state.hasIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(false);
    });

  });

  describe(LOCAL_UPDATE_PROPERTY_TYPE_META, () => {

    const initialState = INITIAL_STATE
      .setIn(['propertyTypes', 0], MOCK_PROPERTY_TYPE.toImmutable())
      .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.id], 0)
      .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.type], 0);

    describe('description', () => {

      const mockActionValue = {
        metadata: { description: genRandomString() },
        propertyTypeId: MOCK_PROPERTY_TYPE.id,
        propertyTypeFQN: MOCK_PROPERTY_TYPE.type,
      };

      test(localUpdatePropertyTypeMeta.REQUEST, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.PENDING);
      });

      test(localUpdatePropertyTypeMeta.SUCCESS, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.SUCCESS);

        const expectedPropertyTypes = List().push(
          MOCK_PROPERTY_TYPE.toImmutable().set('description', mockActionValue.metadata.description)
        );
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FAILURE, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.FAILURE);

        const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map().set(MOCK_PROPERTY_TYPE.id, 0).set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FINALLY, () => {

        const { id } = localUpdatePropertyTypeMeta();
        let state = reducer(initialState, localUpdatePropertyTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        state = reducer(state, localUpdatePropertyTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(false);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.SUCCESS);
      });

    });

    describe('pii', () => {

      const mockActionValue = {
        metadata: { pii: true },
        propertyTypeId: MOCK_PROPERTY_TYPE.id,
        propertyTypeFQN: MOCK_PROPERTY_TYPE.type,
      };

      test(localUpdatePropertyTypeMeta.REQUEST, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.PENDING);
      });

      test(localUpdatePropertyTypeMeta.SUCCESS, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.SUCCESS);

        const expectedPropertyTypes = List().push(
          MOCK_PROPERTY_TYPE.toImmutable().set('pii', mockActionValue.metadata.pii)
        );
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FAILURE, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.FAILURE);

        const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FINALLY, () => {

        const { id } = localUpdatePropertyTypeMeta();
        let state = reducer(initialState, localUpdatePropertyTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        state = reducer(state, localUpdatePropertyTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(false);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.SUCCESS);
      });

    });

    describe('title', () => {

      const mockActionValue = {
        metadata: { title: genRandomString() },
        propertyTypeId: MOCK_PROPERTY_TYPE.id,
        propertyTypeFQN: MOCK_PROPERTY_TYPE.type,
      };

      test(localUpdatePropertyTypeMeta.REQUEST, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.PENDING);
      });

      test(localUpdatePropertyTypeMeta.SUCCESS, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.SUCCESS);

        const expectedPropertyTypes = List().push(
          MOCK_PROPERTY_TYPE.toImmutable().set('title', mockActionValue.metadata.title)
        );
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FAILURE, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.FAILURE);

        const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FINALLY, () => {

        const { id } = localUpdatePropertyTypeMeta();
        let state = reducer(initialState, localUpdatePropertyTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        state = reducer(state, localUpdatePropertyTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(false);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.SUCCESS);
      });

    });

    describe('type', () => {

      const mockActionValue = {
        metadata: { type: new FullyQualifiedName(genRandomString(), genRandomString()) },
        propertyTypeId: MOCK_PROPERTY_TYPE.id,
        propertyTypeFQN: MOCK_PROPERTY_TYPE.type,
      };

      test(localUpdatePropertyTypeMeta.REQUEST, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.PENDING);
      });

      test(localUpdatePropertyTypeMeta.SUCCESS, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.SUCCESS);

        const expectedPropertyTypes = List().push(
          MOCK_PROPERTY_TYPE.toImmutable().set('type', fromJS(mockActionValue.metadata.type.toObject()))
        );
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(mockActionValue.metadata.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FAILURE, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.FAILURE);

        const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FINALLY, () => {

        const { id } = localUpdatePropertyTypeMeta();
        let state = reducer(initialState, localUpdatePropertyTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        state = reducer(state, localUpdatePropertyTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(false);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'])).toEqual(RequestStates.SUCCESS);
      });

    });

  });

  describe(LOCAL_UPDATE_SCHEMA, () => {

    const initialState = INITIAL_STATE
      .setIn(['propertyTypes', 0], MOCK_PROPERTY_TYPE.toImmutable())
      .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.id], 0)
      .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.type], 0);

    describe(ActionTypes.ADD, () => {

      const mockActionValue = {
        actionType: ActionTypes.ADD,
        propertyTypeIds: [MOCK_PROPERTY_TYPE.id],
        schemaFQN: genRandomFQN(),
      };

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

        const propertyType = MOCK_PROPERTY_TYPE.toImmutable();
        const expectedPropertyTypes = List().push(
          propertyType.set(
            'schemas',
            propertyType.get('schemas').push(fromJS(mockActionValue.schemaFQN.toObject()))
          )
        );
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdateSchema.FAILURE, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.failure(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

        const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdateSchema.FINALLY, () => {

        const { id } = localUpdateSchema();
        let state = reducer(initialState, localUpdateSchema.request(id, mockActionValue));
        state = reducer(state, localUpdateSchema.success(id));
        state = reducer(state, localUpdateSchema.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(false);
      });

    });

    describe(ActionTypes.REMOVE, () => {

      const mockActionValue = {
        actionType: ActionTypes.REMOVE,
        propertyTypeIds: [MOCK_PROPERTY_TYPE.id],
        schemaFQN: MOCK_PROPERTY_TYPE.schemas[0],
      };

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

        const propertyType = MOCK_PROPERTY_TYPE.toImmutable();
        const expectedPropertyTypes = List().push(
          propertyType.set('schemas', propertyType.get('schemas').delete(0))
        );
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdateSchema.FAILURE, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.failure(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

        const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FullyQualifiedName));
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
