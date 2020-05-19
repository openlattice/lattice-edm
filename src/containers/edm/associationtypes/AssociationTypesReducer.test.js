import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';
import { v4 as uuid } from 'uuid';

import reducer from './AssociationTypesReducer';
import {
  LOCAL_ADD_DST_ET_TO_AT,
  LOCAL_ADD_PT_TO_AT,
  LOCAL_ADD_SRC_ET_TO_AT,
  LOCAL_CREATE_ASSOCIATION_TYPE,
  LOCAL_DELETE_ASSOCIATION_TYPE,
  LOCAL_REMOVE_DST_ET_FROM_AT,
  LOCAL_REMOVE_PT_FROM_AT,
  LOCAL_REMOVE_SRC_ET_FROM_AT,
  LOCAL_UPDATE_ASSOCIATION_TYPE_META,
  localAddDstEntityTypeToAssociationType,
  localAddPropertyTypeToAssociationType,
  localAddSrcEntityTypeToAssociationType,
  localCreateAssociationType,
  localDeleteAssociationType,
  localRemoveDstEntityTypeFromAssociationType,
  localRemovePropertyTypeFromAssociationType,
  localRemoveSrcEntityTypeFromAssociationType,
  localUpdateAssociationTypeMeta,
} from './AssociationTypesActions';

import {
  MOCK_ASSOCIATION_TYPE,
  genRandomAssociationType,
  genRandomFQN,
} from '../../../utils/testing/MockDataModels';
import { genRandomString } from '../../../utils/testing/MockUtils';
import {
  LOCAL_UPDATE_SCHEMA,
  localUpdateSchema,
} from '../schemas/SchemasActions';

const {
  FQN,
} = Models;

const {
  ActionTypes,
} = Types;

const {
  GET_ENTITY_DATA_MODEL,
  getEntityDataModel,
} = EntityDataModelApiActions;

describe('AssociationTypesReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.toJS()).toEqual({
      [LOCAL_ADD_DST_ET_TO_AT]: { error: false },
      [LOCAL_ADD_PT_TO_AT]: { error: false },
      [LOCAL_ADD_SRC_ET_TO_AT]: { error: false },
      [LOCAL_CREATE_ASSOCIATION_TYPE]: { error: false },
      [LOCAL_DELETE_ASSOCIATION_TYPE]: { error: false },
      [LOCAL_REMOVE_DST_ET_FROM_AT]: { error: false },
      [LOCAL_REMOVE_PT_FROM_AT]: { error: false },
      [LOCAL_REMOVE_SRC_ET_FROM_AT]: { error: false },
      [LOCAL_UPDATE_ASSOCIATION_TYPE_META]: { error: false },
      associationTypes: [],
      associationTypesIndexMap: {},
      newlyCreatedAssociationTypeFQN: undefined,
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
      const response = { associationTypes: [MOCK_ASSOCIATION_TYPE.toObject()] };
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.success(id, response));

      const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = Map()
        .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
        .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
      state.get('associationTypesIndexMap')
        .filter((v, k) => FQN.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FQN));
    });

    test(getEntityDataModel.FAILURE, () => {

      const { id } = getEntityDataModel();
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.failure(id));
      expect(state.get('associationTypes').toJS()).toEqual([]);
      expect(state.get('associationTypesIndexMap').toJS()).toEqual({});
    });

    test(getEntityDataModel.FINALLY, () => {

      const { id } = getEntityDataModel();
      const stateAfterRequest = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      const stateAfterFinally = reducer(stateAfterRequest, getEntityDataModel.finally(id));
      expect(stateAfterFinally.hashCode()).toEqual(stateAfterRequest.hashCode());
      expect(stateAfterFinally.equals(stateAfterRequest)).toEqual(true);
    });

  });

  describe(LOCAL_ADD_DST_ET_TO_AT, () => {

    const initialState = INITIAL_STATE
      .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

    const mockActionValue = {
      associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
      associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
      entityTypeId: uuid(),
    };

    test(localAddDstEntityTypeToAssociationType.REQUEST, () => {

      const { id } = localAddDstEntityTypeToAssociationType();
      const requestAction = localAddDstEntityTypeToAssociationType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_ADD_DST_ET_TO_AT, id])).toEqual(requestAction);
    });

    describe(localAddDstEntityTypeToAssociationType.SUCCESS, () => {

      test('should add id', () => {

        const { id } = localAddDstEntityTypeToAssociationType();
        const requestAction = localAddDstEntityTypeToAssociationType.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localAddDstEntityTypeToAssociationType.success(id));
        expect(state.getIn([LOCAL_ADD_DST_ET_TO_AT, id])).toEqual(requestAction);

        const associationType = MOCK_ASSOCIATION_TYPE.toImmutable();
        const expectedAssociationTypes = List().push(
          associationType.set('dst', associationType.get('dst').push(mockActionValue.entityTypeId))
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test('should not mutate state if the id is already in the list', () => {

        const { id } = localAddDstEntityTypeToAssociationType();
        const requestAction = localAddDstEntityTypeToAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          entityTypeId: MOCK_ASSOCIATION_TYPE.dst[0],
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localAddDstEntityTypeToAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

      test('should not mutate state if the id is invalid', () => {

        const { id } = localAddDstEntityTypeToAssociationType();
        const requestAction = localAddDstEntityTypeToAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          entityTypeId: '',
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localAddDstEntityTypeToAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localAddDstEntityTypeToAssociationType.FAILURE, () => {

      const { id } = localAddDstEntityTypeToAssociationType();
      const requestAction = localAddDstEntityTypeToAssociationType.request(id, mockActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, localAddDstEntityTypeToAssociationType.failure(id));
      expect(state.getIn([LOCAL_ADD_DST_ET_TO_AT, id])).toEqual(requestAction);

      const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = Map()
        .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
        .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
      state.get('associationTypesIndexMap')
        .filter((v, k) => FQN.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FQN));
    });

    test(localAddDstEntityTypeToAssociationType.FINALLY, () => {

      const { id } = localAddDstEntityTypeToAssociationType();
      let state = reducer(initialState, localAddDstEntityTypeToAssociationType.request(id, mockActionValue));
      state = reducer(state, localAddDstEntityTypeToAssociationType.success(id));
      state = reducer(state, localAddDstEntityTypeToAssociationType.finally(id));
      expect(state.hasIn([LOCAL_ADD_DST_ET_TO_AT, id])).toEqual(false);
    });

  });

  describe(LOCAL_ADD_PT_TO_AT, () => {

    const initialState = INITIAL_STATE
      .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

    const mockActionValue = {
      associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
      associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
      propertyTypeId: uuid(),
    };

    test(localAddPropertyTypeToAssociationType.REQUEST, () => {

      const { id } = localAddPropertyTypeToAssociationType();
      const requestAction = localAddPropertyTypeToAssociationType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_ADD_PT_TO_AT, id])).toEqual(requestAction);
    });

    describe(localAddPropertyTypeToAssociationType.SUCCESS, () => {

      test('should add id', () => {

        const { id } = localAddPropertyTypeToAssociationType();
        const requestAction = localAddPropertyTypeToAssociationType.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localAddPropertyTypeToAssociationType.success(id));
        expect(state.getIn([LOCAL_ADD_PT_TO_AT, id])).toEqual(requestAction);

        const associationType = MOCK_ASSOCIATION_TYPE.toImmutable();
        const expectedAssociationTypes = List().push(
          associationType.setIn(
            ['entityType', 'properties'],
            associationType.getIn(['entityType', 'properties']).push(mockActionValue.propertyTypeId)
          )
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test('should not mutate state if the id is already in the list', () => {

        const { id } = localAddPropertyTypeToAssociationType();
        const requestAction = localAddPropertyTypeToAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          propertyTypeId: MOCK_ASSOCIATION_TYPE.entityType.properties[0],
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localAddPropertyTypeToAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

      test('should not mutate state if the id is invalid', () => {

        const { id } = localAddPropertyTypeToAssociationType();
        const requestAction = localAddPropertyTypeToAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          propertyTypeId: '',
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localAddPropertyTypeToAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localAddPropertyTypeToAssociationType.FAILURE, () => {

      const { id } = localAddPropertyTypeToAssociationType();
      const requestAction = localAddPropertyTypeToAssociationType.request(id, mockActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, localAddPropertyTypeToAssociationType.failure(id));
      expect(state.getIn([LOCAL_ADD_PT_TO_AT, id])).toEqual(requestAction);

      const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = Map()
        .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
        .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
      state.get('associationTypesIndexMap')
        .filter((v, k) => FQN.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FQN));
    });

    test(localAddPropertyTypeToAssociationType.FINALLY, () => {

      const { id } = localAddPropertyTypeToAssociationType();
      let state = reducer(initialState, localAddPropertyTypeToAssociationType.request(id, mockActionValue));
      state = reducer(state, localAddPropertyTypeToAssociationType.success(id));
      state = reducer(state, localAddPropertyTypeToAssociationType.finally(id));
      expect(state.hasIn([LOCAL_ADD_PT_TO_AT, id])).toEqual(false);
    });

  });

  describe(LOCAL_ADD_SRC_ET_TO_AT, () => {

    const initialState = INITIAL_STATE
      .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

    const mockActionValue = {
      associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
      associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
      entityTypeId: uuid(),
    };

    test(localAddSrcEntityTypeToAssociationType.REQUEST, () => {

      const { id } = localAddSrcEntityTypeToAssociationType();
      const requestAction = localAddSrcEntityTypeToAssociationType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_ADD_SRC_ET_TO_AT, id])).toEqual(requestAction);
    });

    describe(localAddSrcEntityTypeToAssociationType.SUCCESS, () => {

      test('should add id', () => {

        const { id } = localAddSrcEntityTypeToAssociationType();
        const requestAction = localAddSrcEntityTypeToAssociationType.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localAddSrcEntityTypeToAssociationType.success(id));
        expect(state.getIn([LOCAL_ADD_SRC_ET_TO_AT, id])).toEqual(requestAction);

        const associationType = MOCK_ASSOCIATION_TYPE.toImmutable();
        const expectedAssociationTypes = List().push(
          associationType.set('src', associationType.get('src').push(mockActionValue.entityTypeId))
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test('should not mutate state if the id is already in the list', () => {

        const { id } = localAddSrcEntityTypeToAssociationType();
        const requestAction = localAddSrcEntityTypeToAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          entityTypeId: MOCK_ASSOCIATION_TYPE.src[0],
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localAddSrcEntityTypeToAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

      test('should not mutate state if the id is invalid', () => {

        const { id } = localAddSrcEntityTypeToAssociationType();
        const requestAction = localAddSrcEntityTypeToAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          entityTypeId: '',
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localAddSrcEntityTypeToAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localAddSrcEntityTypeToAssociationType.FAILURE, () => {

      const { id } = localAddSrcEntityTypeToAssociationType();
      const requestAction = localAddSrcEntityTypeToAssociationType.request(id, mockActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, localAddSrcEntityTypeToAssociationType.failure(id));
      expect(state.getIn([LOCAL_ADD_SRC_ET_TO_AT, id])).toEqual(requestAction);

      const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = Map()
        .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
        .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
      state.get('associationTypesIndexMap')
        .filter((v, k) => FQN.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FQN));
    });

    test(localAddSrcEntityTypeToAssociationType.FINALLY, () => {

      const { id } = localAddSrcEntityTypeToAssociationType();
      let state = reducer(initialState, localAddSrcEntityTypeToAssociationType.request(id, mockActionValue));
      state = reducer(state, localAddSrcEntityTypeToAssociationType.success(id));
      state = reducer(state, localAddSrcEntityTypeToAssociationType.finally(id));
      expect(state.hasIn([LOCAL_ADD_SRC_ET_TO_AT, id])).toEqual(false);
    });

  });

  describe(LOCAL_CREATE_ASSOCIATION_TYPE, () => {

    test(localCreateAssociationType.REQUEST, () => {

      const { id } = localCreateAssociationType();
      const requestAction = localCreateAssociationType.request(id, MOCK_ASSOCIATION_TYPE);
      const state = reducer(INITIAL_STATE, requestAction);

      expect(state.getIn([LOCAL_CREATE_ASSOCIATION_TYPE, id])).toEqual(requestAction);
      expect(state.get('newlyCreatedAssociationTypeFQN')).toEqual(undefined);
    });

    test(localCreateAssociationType.SUCCESS, () => {

      const { id } = localCreateAssociationType();
      const requestAction = localCreateAssociationType.request(id, MOCK_ASSOCIATION_TYPE);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreateAssociationType.success(id, MOCK_ASSOCIATION_TYPE.entityType.id));

      expect(state.getIn([LOCAL_CREATE_ASSOCIATION_TYPE, id])).toEqual(requestAction);
      expect(state.get('newlyCreatedAssociationTypeFQN')).toEqual(MOCK_ASSOCIATION_TYPE.entityType.type);
      expect(state.get('newlyCreatedAssociationTypeFQN')).toBeInstanceOf(FQN);

      const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = Map()
        .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
        .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
      state.get('associationTypesIndexMap')
        .filter((v, k) => FQN.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FQN));
    });

    test(localCreateAssociationType.FAILURE, () => {

      const { id } = localCreateAssociationType();
      const requestAction = localCreateAssociationType.request(id, MOCK_ASSOCIATION_TYPE);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreateAssociationType.failure(id));

      expect(state.getIn([LOCAL_CREATE_ASSOCIATION_TYPE, id])).toEqual(requestAction);
      expect(state.getIn([LOCAL_CREATE_ASSOCIATION_TYPE, 'error'])).toEqual(true);
      expect(state.get('newlyCreatedAssociationTypeFQN')).toEqual(undefined);

      const expectedAssociationTypes = List();
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = Map();
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
    });

    test(localCreateAssociationType.FINALLY, () => {

      const { id } = localCreateAssociationType();
      let state = reducer(INITIAL_STATE, localCreateAssociationType.request(id, MOCK_ASSOCIATION_TYPE));
      state = reducer(state, localCreateAssociationType.success(id, MOCK_ASSOCIATION_TYPE.entityType.id));
      state = reducer(state, localCreateAssociationType.finally(id));

      expect(state.hasIn([LOCAL_CREATE_ASSOCIATION_TYPE, id])).toEqual(false);
      expect(state.get('newlyCreatedAssociationTypeFQN')).toEqual(MOCK_ASSOCIATION_TYPE.entityType.type);
      expect(state.get('newlyCreatedAssociationTypeFQN')).toBeInstanceOf(FQN);
    });

  });

  describe(LOCAL_DELETE_ASSOCIATION_TYPE, () => {

    test(localDeleteAssociationType.REQUEST, () => {

      const { id } = localDeleteAssociationType();
      const requestAction = localDeleteAssociationType.request(
        id,
        {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
        },
      );
      const state = reducer(INITIAL_STATE, requestAction);
      expect(state.getIn([LOCAL_DELETE_ASSOCIATION_TYPE, id])).toEqual(requestAction);
    });

    describe(localDeleteAssociationType.SUCCESS, () => {

      test('should delete AssociationType', () => {

        const initialState = INITIAL_STATE
          .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
          .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
          .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

        const { id } = localDeleteAssociationType();
        const requestAction = localDeleteAssociationType.request(
          id,
          {
            associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
            associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          },
        );
        let state = reducer(initialState, requestAction);
        state = reducer(state, localDeleteAssociationType.success(id));

        expect(state.getIn([LOCAL_DELETE_ASSOCIATION_TYPE, id])).toEqual(requestAction);
        expect(state.get('associationTypes').toJS()).toEqual([]);
        expect(state.get('associationTypesIndexMap').toJS()).toEqual({});
      });

      test('should correctly update "associationTypes" and "associationTypesIndexMap"', () => {

        const mockAssociationType0 = genRandomAssociationType();
        const mockAssociationType1 = genRandomAssociationType();
        const mockAssociationType2 = genRandomAssociationType();

        const initialState = INITIAL_STATE
          .setIn(['associationTypes', 0], mockAssociationType0.toImmutable())
          .setIn(['associationTypes', 1], mockAssociationType1.toImmutable())
          .setIn(['associationTypes', 2], mockAssociationType2.toImmutable())
          .setIn(['associationTypesIndexMap', mockAssociationType0.entityType.id], 0)
          .setIn(['associationTypesIndexMap', mockAssociationType0.entityType.type], 0)
          .setIn(['associationTypesIndexMap', mockAssociationType1.entityType.id], 1)
          .setIn(['associationTypesIndexMap', mockAssociationType1.entityType.type], 1)
          .setIn(['associationTypesIndexMap', mockAssociationType2.entityType.id], 2)
          .setIn(['associationTypesIndexMap', mockAssociationType2.entityType.type], 2);

        const { id } = localDeleteAssociationType();
        const requestAction = localDeleteAssociationType.request(
          id,
          {
            associationTypeFQN: mockAssociationType1.entityType.type,
            associationTypeId: mockAssociationType1.entityType.id,
          },
        );
        let state = reducer(initialState, requestAction);
        state = reducer(state, localDeleteAssociationType.success(id));
        expect(state.getIn([LOCAL_DELETE_ASSOCIATION_TYPE, id])).toEqual(requestAction);

        const expectedAssociationTypes = List()
          .push(mockAssociationType0.toImmutable())
          .push(mockAssociationType2.toImmutable());
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(mockAssociationType0.entityType.id, 0)
          .set(mockAssociationType0.entityType.type, 0)
          .set(mockAssociationType2.entityType.id, 1)
          .set(mockAssociationType2.entityType.type, 1);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test('should not mutate state if attempting to delete a non-existent EntityType', () => {

        const initialState = INITIAL_STATE
          .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
          .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
          .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

        const { id } = localDeleteAssociationType();
        const stateAfterRequest = reducer(initialState, localDeleteAssociationType.request(
          id,
          {
            associationTypeFQN: new FQN(genRandomString(), genRandomString()),
            associationTypeId: uuid(),
          },
        ));
        const stateAfterSuccess = reducer(stateAfterRequest, localDeleteAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localDeleteAssociationType.FAILURE, () => {

      const initialState = INITIAL_STATE
        .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
        .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.id], 0)
        .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.type], 0);

      const { id } = localDeleteAssociationType();
      const requestAction = localDeleteAssociationType.request(
        id,
        {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
        },
      );
      let state = reducer(initialState, requestAction);
      state = reducer(state, localDeleteAssociationType.failure(id));

      expect(state.getIn([LOCAL_DELETE_ASSOCIATION_TYPE, id])).toEqual(requestAction);
      expect(state.getIn([LOCAL_DELETE_ASSOCIATION_TYPE, 'error'])).toEqual(true);
      expect(state.get('newlyCreatedEntityTypeFQN')).toEqual(undefined);

      const expectedAssociationTypes = initialState.get('associationTypes');
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = initialState.get('associationTypesIndexMap');
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
    });

    test(localDeleteAssociationType.FINALLY, () => {

      const { id } = localDeleteAssociationType();
      const requestAction = localDeleteAssociationType.request(
        id,
        {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
        },
      );
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localDeleteAssociationType.success(id));
      state = reducer(state, localDeleteAssociationType.finally(id));
      expect(state.hasIn([LOCAL_DELETE_ASSOCIATION_TYPE, id])).toEqual(false);
    });

  });

  describe(LOCAL_REMOVE_DST_ET_FROM_AT, () => {

    const initialState = INITIAL_STATE
      .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

    const mockActionValue = {
      associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
      associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
      entityTypeId: MOCK_ASSOCIATION_TYPE.dst[0],
    };

    test(localRemoveDstEntityTypeFromAssociationType.REQUEST, () => {

      const { id } = localRemoveDstEntityTypeFromAssociationType();
      const requestAction = localRemoveDstEntityTypeFromAssociationType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_REMOVE_DST_ET_FROM_AT, id])).toEqual(requestAction);
    });

    describe(localRemoveDstEntityTypeFromAssociationType.SUCCESS, () => {

      test('should remove id', () => {

        const { id } = localRemoveDstEntityTypeFromAssociationType();
        const requestAction = localRemoveDstEntityTypeFromAssociationType.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localRemoveDstEntityTypeFromAssociationType.success(id));
        expect(state.getIn([LOCAL_REMOVE_DST_ET_FROM_AT, id])).toEqual(requestAction);

        const associationType = MOCK_ASSOCIATION_TYPE.toImmutable();
        const expectedAssociationTypes = List().push(
          associationType.set('dst', associationType.get('dst').delete(0))
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test('should not mutate state if the id is not in the list', () => {

        const { id } = localRemoveDstEntityTypeFromAssociationType();
        const requestAction = localRemoveDstEntityTypeFromAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          entityTypeId: uuid(),
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localRemoveDstEntityTypeFromAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

      test('should not mutate state if the id is invalid', () => {

        const { id } = localRemoveDstEntityTypeFromAssociationType();
        const requestAction = localRemoveDstEntityTypeFromAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          entityTypeId: '',
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localRemoveDstEntityTypeFromAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localRemoveDstEntityTypeFromAssociationType.FAILURE, () => {

      const { id } = localRemoveDstEntityTypeFromAssociationType();
      const requestAction = localRemoveDstEntityTypeFromAssociationType.request(id, mockActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, localRemoveDstEntityTypeFromAssociationType.failure(id));
      expect(state.getIn([LOCAL_REMOVE_DST_ET_FROM_AT, id])).toEqual(requestAction);

      const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = Map()
        .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
        .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
      state.get('associationTypesIndexMap')
        .filter((v, k) => FQN.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FQN));
    });

    test(localRemoveDstEntityTypeFromAssociationType.FINALLY, () => {

      const { id } = localRemoveDstEntityTypeFromAssociationType();
      let state = reducer(initialState, localRemoveDstEntityTypeFromAssociationType.request(id, mockActionValue));
      state = reducer(state, localRemoveDstEntityTypeFromAssociationType.success(id));
      state = reducer(state, localRemoveDstEntityTypeFromAssociationType.finally(id));
      expect(state.hasIn([LOCAL_REMOVE_DST_ET_FROM_AT, id])).toEqual(false);
    });

  });

  describe(LOCAL_REMOVE_PT_FROM_AT, () => {

    const initialState = INITIAL_STATE
      .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

    const mockActionValue = {
      associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
      associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
      propertyTypeId: MOCK_ASSOCIATION_TYPE.entityType.properties[0],
    };

    test(localRemovePropertyTypeFromAssociationType.REQUEST, () => {

      const { id } = localRemovePropertyTypeFromAssociationType();
      const requestAction = localRemovePropertyTypeFromAssociationType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_REMOVE_PT_FROM_AT, id])).toEqual(requestAction);
    });

    describe(localRemovePropertyTypeFromAssociationType.SUCCESS, () => {

      test('should remove id', () => {

        const { id } = localRemovePropertyTypeFromAssociationType();
        const requestAction = localRemovePropertyTypeFromAssociationType.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localRemovePropertyTypeFromAssociationType.success(id));
        expect(state.getIn([LOCAL_REMOVE_PT_FROM_AT, id])).toEqual(requestAction);

        const associationType = MOCK_ASSOCIATION_TYPE.toImmutable();
        const expectedAssociationTypes = List().push(
          associationType.setIn(
            ['entityType', 'properties'],
            associationType.getIn(['entityType', 'properties']).delete(0)
          )
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test('should not mutate state if the id is not in the list', () => {

        const { id } = localRemovePropertyTypeFromAssociationType();
        const requestAction = localRemovePropertyTypeFromAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          propertyTypeId: uuid(),
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localRemovePropertyTypeFromAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

      test('should not mutate state if the id is invalid', () => {

        const { id } = localRemovePropertyTypeFromAssociationType();
        const requestAction = localRemovePropertyTypeFromAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          propertyTypeId: '',
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localRemovePropertyTypeFromAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localRemovePropertyTypeFromAssociationType.FAILURE, () => {

      const { id } = localRemovePropertyTypeFromAssociationType();
      const requestAction = localRemovePropertyTypeFromAssociationType.request(id, mockActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, localRemovePropertyTypeFromAssociationType.failure(id));
      expect(state.getIn([LOCAL_REMOVE_PT_FROM_AT, id])).toEqual(requestAction);

      const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = Map()
        .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
        .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
      state.get('associationTypesIndexMap')
        .filter((v, k) => FQN.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FQN));
    });

    test(localRemovePropertyTypeFromAssociationType.FINALLY, () => {

      const { id } = localRemovePropertyTypeFromAssociationType();
      let state = reducer(initialState, localRemovePropertyTypeFromAssociationType.request(id, mockActionValue));
      state = reducer(state, localRemovePropertyTypeFromAssociationType.success(id));
      state = reducer(state, localRemovePropertyTypeFromAssociationType.finally(id));
      expect(state.hasIn([LOCAL_REMOVE_PT_FROM_AT, id])).toEqual(false);
    });

  });

  describe(LOCAL_REMOVE_SRC_ET_FROM_AT, () => {

    const initialState = INITIAL_STATE
      .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

    const mockActionValue = {
      associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
      associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
      entityTypeId: MOCK_ASSOCIATION_TYPE.src[0],
    };

    test(localRemoveSrcEntityTypeFromAssociationType.REQUEST, () => {

      const { id } = localRemoveSrcEntityTypeFromAssociationType();
      const requestAction = localRemoveSrcEntityTypeFromAssociationType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_REMOVE_SRC_ET_FROM_AT, id])).toEqual(requestAction);
    });

    describe(localRemoveSrcEntityTypeFromAssociationType.SUCCESS, () => {

      test('should remove id', () => {

        const { id } = localRemoveSrcEntityTypeFromAssociationType();
        const requestAction = localRemoveSrcEntityTypeFromAssociationType.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localRemoveSrcEntityTypeFromAssociationType.success(id));
        expect(state.getIn([LOCAL_REMOVE_SRC_ET_FROM_AT, id])).toEqual(requestAction);

        const associationType = MOCK_ASSOCIATION_TYPE.toImmutable();
        const expectedAssociationTypes = List().push(
          associationType.set('src', associationType.get('src').delete(0))
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test('should not mutate state if the id is not in the list', () => {

        const { id } = localRemoveSrcEntityTypeFromAssociationType();
        const requestAction = localRemoveSrcEntityTypeFromAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          entityTypeId: uuid(),
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localRemoveSrcEntityTypeFromAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

      test('should not mutate state if the id is invalid', () => {

        const { id } = localRemoveSrcEntityTypeFromAssociationType();
        const requestAction = localRemoveSrcEntityTypeFromAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          entityTypeId: '',
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localRemoveSrcEntityTypeFromAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localRemoveSrcEntityTypeFromAssociationType.FAILURE, () => {

      const { id } = localRemoveSrcEntityTypeFromAssociationType();
      const requestAction = localRemoveSrcEntityTypeFromAssociationType.request(id, mockActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, localRemoveSrcEntityTypeFromAssociationType.failure(id));
      expect(state.getIn([LOCAL_REMOVE_SRC_ET_FROM_AT, id])).toEqual(requestAction);

      const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
      expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
      expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

      const expectedAssociationTypesIndexMap = Map()
        .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
        .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
      expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
      expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
      state.get('associationTypesIndexMap')
        .filter((v, k) => FQN.isValid(k))
        .keySeq()
        .forEach((k) => expect(k).toBeInstanceOf(FQN));
    });

    test(localRemoveSrcEntityTypeFromAssociationType.FINALLY, () => {

      const { id } = localRemoveSrcEntityTypeFromAssociationType();
      let state = reducer(initialState, localRemoveSrcEntityTypeFromAssociationType.request(id, mockActionValue));
      state = reducer(state, localRemoveSrcEntityTypeFromAssociationType.success(id));
      state = reducer(state, localRemoveSrcEntityTypeFromAssociationType.finally(id));
      expect(state.hasIn([LOCAL_REMOVE_SRC_ET_FROM_AT, id])).toEqual(false);
    });

  });

  describe(LOCAL_UPDATE_ASSOCIATION_TYPE_META, () => {

    const initialState = INITIAL_STATE
      .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

    describe('description', () => {

      const mockActionValue = {
        associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
        associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
        metadata: { description: genRandomString() },
      };

      test(localUpdateAssociationTypeMeta.REQUEST, () => {

        const { id } = localUpdateAssociationTypeMeta();
        const requestAction = localUpdateAssociationTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(requestAction);
      });

      test(localUpdateAssociationTypeMeta.SUCCESS, () => {

        const { id } = localUpdateAssociationTypeMeta();
        const requestAction = localUpdateAssociationTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateAssociationTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(requestAction);

        const expectedAssociationTypes = List().push(
          MOCK_ASSOCIATION_TYPE.toImmutable().setIn(
            ['entityType', 'description'],
            mockActionValue.metadata.description,
          )
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test(localUpdateAssociationTypeMeta.FAILURE, () => {

        const { id } = localUpdateAssociationTypeMeta();
        const requestAction = localUpdateAssociationTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateAssociationTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(requestAction);

        const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test(localUpdateAssociationTypeMeta.FINALLY, () => {

        const { id } = localUpdateAssociationTypeMeta();
        let state = reducer(initialState, localUpdateAssociationTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdateAssociationTypeMeta.success(id));
        state = reducer(state, localUpdateAssociationTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(false);
      });

    });

    describe('title', () => {

      const mockActionValue = {
        associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
        associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
        metadata: { title: genRandomString() },
      };

      test(localUpdateAssociationTypeMeta.REQUEST, () => {

        const { id } = localUpdateAssociationTypeMeta();
        const requestAction = localUpdateAssociationTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(requestAction);
      });

      test(localUpdateAssociationTypeMeta.SUCCESS, () => {

        const { id } = localUpdateAssociationTypeMeta();
        const requestAction = localUpdateAssociationTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateAssociationTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(requestAction);

        const expectedAssociationTypes = List().push(
          MOCK_ASSOCIATION_TYPE.toImmutable().setIn(
            ['entityType', 'title'],
            mockActionValue.metadata.title,
          )
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test(localUpdateAssociationTypeMeta.FAILURE, () => {

        const { id } = localUpdateAssociationTypeMeta();
        const requestAction = localUpdateAssociationTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateAssociationTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(requestAction);

        const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test(localUpdateAssociationTypeMeta.FINALLY, () => {

        const { id } = localUpdateAssociationTypeMeta();
        let state = reducer(initialState, localUpdateAssociationTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdateAssociationTypeMeta.success(id));
        state = reducer(state, localUpdateAssociationTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(false);
      });

    });

    describe('type', () => {

      const mockActionValue = {
        associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
        associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
        metadata: { type: new FQN(genRandomString(), genRandomString()) },
      };

      test(localUpdateAssociationTypeMeta.REQUEST, () => {

        const { id } = localUpdateAssociationTypeMeta();
        const requestAction = localUpdateAssociationTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(requestAction);
      });

      test(localUpdateAssociationTypeMeta.SUCCESS, () => {

        const { id } = localUpdateAssociationTypeMeta();
        const requestAction = localUpdateAssociationTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateAssociationTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(requestAction);

        const expectedAssociationTypes = List().push(
          MOCK_ASSOCIATION_TYPE.toImmutable().setIn(
            ['entityType', 'type'],
            fromJS(mockActionValue.metadata.type.toObject())
          )
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(mockActionValue.metadata.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test(localUpdateAssociationTypeMeta.FAILURE, () => {

        const { id } = localUpdateAssociationTypeMeta();
        const requestAction = localUpdateAssociationTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateAssociationTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(requestAction);

        const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test(localUpdateAssociationTypeMeta.FINALLY, () => {

        const { id } = localUpdateAssociationTypeMeta();
        let state = reducer(initialState, localUpdateAssociationTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdateAssociationTypeMeta.success(id));
        state = reducer(state, localUpdateAssociationTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_ASSOCIATION_TYPE_META, id])).toEqual(false);
      });

    });

  });

  describe(LOCAL_UPDATE_SCHEMA, () => {

    const initialState = INITIAL_STATE
      .setIn(['associationTypes', 0], MOCK_ASSOCIATION_TYPE.toImmutable())
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.id], 0)
      .setIn(['associationTypesIndexMap', MOCK_ASSOCIATION_TYPE.entityType.type], 0);

    describe(ActionTypes.ADD, () => {

      const mockActionValue = {
        actionType: ActionTypes.ADD,
        entityTypeIds: [MOCK_ASSOCIATION_TYPE.entityType.id],
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

        const associationType = MOCK_ASSOCIATION_TYPE.toImmutable();
        const expectedAssociationTypes = List().push(
          associationType.setIn(
            ['entityType', 'schemas'],
            associationType.getIn(['entityType', 'schemas']).push(fromJS(mockActionValue.schemaFQN.toObject()))
          )
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test(localUpdateSchema.FAILURE, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.failure(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

        const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
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
        entityTypeIds: [MOCK_ASSOCIATION_TYPE.entityType.id],
        schemaFQN: MOCK_ASSOCIATION_TYPE.entityType.schemas[0],
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

        const associationType = MOCK_ASSOCIATION_TYPE.toImmutable();
        const expectedAssociationTypes = List().push(
          associationType.setIn(
            ['entityType', 'schemas'],
            associationType.getIn(['entityType', 'schemas']).delete(0)
          )
        );
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
      });

      test(localUpdateSchema.FAILURE, () => {

        const { id } = localUpdateSchema();
        const requestAction = localUpdateSchema.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateSchema.failure(id));
        expect(state.getIn([LOCAL_UPDATE_SCHEMA, id])).toEqual(requestAction);

        const expectedAssociationTypes = List().push(MOCK_ASSOCIATION_TYPE.toImmutable());
        expect(state.get('associationTypes').hashCode()).toEqual(expectedAssociationTypes.hashCode());
        expect(state.get('associationTypes').equals(expectedAssociationTypes)).toEqual(true);

        const expectedAssociationTypesIndexMap = Map()
          .set(MOCK_ASSOCIATION_TYPE.entityType.id, 0)
          .set(MOCK_ASSOCIATION_TYPE.entityType.type, 0);
        expect(state.get('associationTypesIndexMap').hashCode()).toEqual(expectedAssociationTypesIndexMap.hashCode());
        expect(state.get('associationTypesIndexMap').equals(expectedAssociationTypesIndexMap)).toEqual(true);
        state.get('associationTypesIndexMap')
          .filter((v, k) => FQN.isValid(k))
          .keySeq()
          .forEach((k) => expect(k).toBeInstanceOf(FQN));
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
