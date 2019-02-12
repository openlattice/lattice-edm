import randomUUID from 'uuid/v4';
import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

import reducer from './AssociationTypesReducer';
import { MOCK_ASSOCIATION_TYPE } from '../../../utils/MockDataModels';
import { randomStringId } from '../../../utils/Utils';
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
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
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
      entityTypeId: randomUUID(),
    };

    test(localAddDstEntityTypeToAssociationType.REQUEST, () => {

      const { id } = localAddDstEntityTypeToAssociationType();
      const requestAction = localAddDstEntityTypeToAssociationType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_ADD_DST_ET_TO_AT, id])).toEqual(requestAction);
    });

    describe(localAddDstEntityTypeToAssociationType.SUCCESS, () => {

      test('should add EntityType id', () => {

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
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test('should not change anything if the EntityType id is already in the list', () => {

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

      test('should not change anything if the EntityType id is invalid', () => {

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
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
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
      propertyTypeId: randomUUID(),
    };

    test(localAddPropertyTypeToAssociationType.REQUEST, () => {

      const { id } = localAddPropertyTypeToAssociationType();
      const requestAction = localAddPropertyTypeToAssociationType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_ADD_PT_TO_AT, id])).toEqual(requestAction);
    });

    describe(localAddPropertyTypeToAssociationType.SUCCESS, () => {

      test('should add PropertyType id', () => {

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
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test('should not change anything if the PropertyType id is already in the list', () => {

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

      test('should not change anything if the PropertyType id is invalid', () => {

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
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
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
      entityTypeId: randomUUID(),
    };

    test(localAddSrcEntityTypeToAssociationType.REQUEST, () => {

      const { id } = localAddSrcEntityTypeToAssociationType();
      const requestAction = localAddSrcEntityTypeToAssociationType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_ADD_SRC_ET_TO_AT, id])).toEqual(requestAction);
    });

    describe(localAddSrcEntityTypeToAssociationType.SUCCESS, () => {

      test('should add EntityType id', () => {

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
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test('should not change anything if the EntityType id is already in the list', () => {

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

      test('should not change anything if the EntityType id is invalid', () => {

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
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(localAddSrcEntityTypeToAssociationType.FINALLY, () => {

      const { id } = localAddSrcEntityTypeToAssociationType();
      let state = reducer(initialState, localAddSrcEntityTypeToAssociationType.request(id, mockActionValue));
      state = reducer(state, localAddSrcEntityTypeToAssociationType.success(id));
      state = reducer(state, localAddSrcEntityTypeToAssociationType.finally(id));
      expect(state.hasIn([LOCAL_ADD_SRC_ET_TO_AT, id])).toEqual(false);
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

      test('should remove PropertyType id', () => {

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
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test('should not change anything if the PropertyType id is not in the list', () => {

        const { id } = localRemovePropertyTypeFromAssociationType();
        const requestAction = localRemovePropertyTypeFromAssociationType.request(id, {
          associationTypeFQN: MOCK_ASSOCIATION_TYPE.entityType.type,
          associationTypeId: MOCK_ASSOCIATION_TYPE.entityType.id,
          propertyTypeId: randomUUID(),
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localRemovePropertyTypeFromAssociationType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

      test('should not change anything if the PropertyType id is invalid', () => {

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
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(localRemovePropertyTypeFromAssociationType.FINALLY, () => {

      const { id } = localRemovePropertyTypeFromAssociationType();
      let state = reducer(initialState, localRemovePropertyTypeFromAssociationType.request(id, mockActionValue));
      state = reducer(state, localRemovePropertyTypeFromAssociationType.success(id));
      state = reducer(state, localRemovePropertyTypeFromAssociationType.finally(id));
      expect(state.hasIn([LOCAL_REMOVE_PT_FROM_AT, id])).toEqual(false);
    });

  });

  // describe(CREATE_ASSOCIATION_TYPE, () => {
  //
  //   test(createAssociationType.REQUEST, () => {
  //
  //     const { id } = createAssociationType();
  //     const state = reducer(INITIAL_STATE, createAssociationType.request(id, MOCK_ASSOCIATION_TYPE));
  //
  //     expect(state.get('isCreatingNewAssociationType')).toEqual(true);
  //     expect(state.get('newlyCreatedAssociationTypeFQN')).toEqual('');
  //     expect(state.getIn(['actions', 'createAssociationType', id]).toJS())
  //       .toEqual({
  //         id,
  //         type: createAssociationType.REQUEST,
  //         value: MOCK_ASSOCIATION_TYPE
  //       });
  //   });
  //
  //   test(createAssociationType.SUCCESS, () => {
  //
  //     const { id } = createAssociationType();
  //     let state = reducer(INITIAL_STATE, createAssociationType.request(id, MOCK_ASSOCIATION_TYPE));
  //     state = reducer(state, createAssociationType.success(id, MOCK_ASSOCIATION_TYPE.entityType.id));
  //
  //     expect(state.get('isCreatingNewAssociationType')).toEqual(true);
  //     expect(state.get('newlyCreatedAssociationTypeFQN')).toEqual(MOCK_ASSOCIATION_TYPE.entityType.id);
  //     expect(state.getIn(['actions', 'createAssociationType', id]).toJS())
  //       .toEqual({
  //         id,
  //         type: createAssociationType.REQUEST,
  //         value: MOCK_ASSOCIATION_TYPE
  //       });
  //
  //     expect(state.get('associationTypes').toJS()).toEqual(
  //       [MOCK_ASSOCIATION_TYPE]
  //     );
  //
  //     expect(state.get('associationTypesById').toJS()).toEqual(
  //       { [MOCK_ASSOCIATION_TYPE.entityType.id]: 0 }
  //     );
  //   });
  //
  //   test(createAssociationType.FAILURE, () => {
  //
  //     const { id } = createAssociationType();
  //     let state = reducer(INITIAL_STATE, createAssociationType.request(id, MOCK_ASSOCIATION_TYPE));
  //     state = reducer(state, createAssociationType.failure(id));
  //
  //     expect(state.get('isCreatingNewAssociationType')).toEqual(true);
  //     expect(state.get('newlyCreatedAssociationTypeFQN')).toEqual('');
  //     expect(state.getIn(['actions', 'createAssociationType', id]).toJS())
  //       .toEqual({
  //         id,
  //         type: createAssociationType.REQUEST,
  //         value: MOCK_ASSOCIATION_TYPE
  //       });
  //   });
  //
  //   test(createAssociationType.FINALLY, () => {
  //
  //     const { id } = createAssociationType();
  //     let state = reducer(INITIAL_STATE, createAssociationType.request(id, MOCK_ASSOCIATION_TYPE));
  //     expect(state.getIn(['actions', 'createAssociationType', id]).toJS())
  //       .toEqual({
  //         id,
  //         type: createAssociationType.REQUEST,
  //         value: MOCK_ASSOCIATION_TYPE
  //       });
  //
  //     state = reducer(state, createAssociationType.finally(id));
  //     expect(state.get('isCreatingNewAssociationType')).toEqual(false);
  //     expect(state.get('newlyCreatedAssociationTypeFQN')).toEqual('');
  //     expect(state.hasIn(['actions', 'createAssociationType', id])).toEqual(false);
  //   });
  //
  // });

  // describe(DELETE_ASSOCIATION_TYPE, () => {
  //
  //   test(deleteAssociationType.REQUEST, () => {
  //
  //     const { id } = deleteAssociationType();
  //     const associationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;
  //     const state = reducer(INITIAL_STATE, deleteAssociationType.request(id, associationTypeId));
  //
  //     expect(state.getIn(['actions', 'deleteAssociationType', id]).toJS())
  //       .toEqual({
  //         id,
  //         type: deleteAssociationType.REQUEST,
  //         value: associationTypeId
  //       });
  //   });
  //
  //   describe(deleteAssociationType.SUCCESS, () => {
  //
  //     test('should delete AssociationType', () => {
  //
  //       // yes, this is not a valid AssociationType, but the reducer only cares about the id
  //       const mockAssociationType = { entityType: { id: randomUUID() } };
  //
  //       let state = INITIAL_STATE
  //         .set('associationTypes', fromJS([mockAssociationType]))
  //         .set('associationTypesById', fromJS({ [mockAssociationType.entityType.id]: 0 }));
  //
  //       const { id } = deleteAssociationType();
  //       state = reducer(state, deleteAssociationType.request(id, mockAssociationType.entityType.id));
  //       state = reducer(state, deleteAssociationType.success(id));
  //
  //       expect(state.get('associationTypes').toJS()).toEqual([]);
  //       expect(state.get('associationTypesById').toJS()).toEqual({});
  //       expect(state.getIn(['actions', 'deleteAssociationType', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: deleteAssociationType.REQUEST,
  //           value: mockAssociationType.entityType.id
  //         });
  //     });
  //
  //     test('should correctly update "associationTypes" and "associationTypesById"', () => {
  //
  //       // yes, this is not a valid AssociationType, but the reducer only cares about the id
  //       const mockAssociationType1 = { entityType: { id: randomUUID() } };
  //       const mockAssociationType2 = { entityType: { id: randomUUID() } };
  //       const mockAssociationType3 = { entityType: { id: randomUUID() } };
  //
  //       let state = INITIAL_STATE
  //         .set('associationTypes', fromJS([
  //           mockAssociationType1,
  //           mockAssociationType2,
  //           mockAssociationType3
  //         ]))
  //         .set('associationTypesById', fromJS({
  //           [mockAssociationType1.entityType.id]: 0,
  //           [mockAssociationType2.entityType.id]: 1,
  //           [mockAssociationType3.entityType.id]: 2
  //         }));
  //
  //       const { id } = deleteAssociationType();
  //       state = reducer(state, deleteAssociationType.request(id, mockAssociationType2.entityType.id));
  //       state = reducer(state, deleteAssociationType.success(id));
  //
  //       expect(state.get('associationTypes').toJS()).toEqual([
  //         mockAssociationType1,
  //         mockAssociationType3
  //       ]);
  //       expect(state.get('associationTypesById').toJS()).toEqual({
  //         [mockAssociationType1.entityType.id]: 0,
  //         [mockAssociationType3.entityType.id]: 1
  //       });
  //     });
  //
  //     test('should not mutate state if attempting to delete a non-existent AssociationType', () => {
  //
  //       // yes, this is not a valid AssociationType, but the reducer only cares about the id
  //       const mockAssociationType = { entityType: { id: randomUUID() } };
  //
  //       const initialState = INITIAL_STATE
  //         .set('associationTypes', fromJS([mockAssociationType]))
  //         .set('associationTypesById', fromJS({ [mockAssociationType.entityType.id]: 0 }));
  //
  //       const { id } = deleteAssociationType();
  //       const stateAfterRequest = reducer(initialState, deleteAssociationType.request(id, randomUUID()));
  //       const stateAfterSuccess = reducer(stateAfterRequest, deleteAssociationType.success(id));
  //       expect(stateAfterSuccess.toJS()).toEqual(stateAfterRequest.toJS());
  //     });
  //   });
  //
  //   test(deleteAssociationType.FAILURE, () => {
  //
  //     const { id } = deleteAssociationType();
  //     const associationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;
  //
  //     let state = reducer(INITIAL_STATE, deleteAssociationType.request(id, associationTypeId));
  //     state = reducer(state, deleteAssociationType.failure(id));
  //
  //     expect(state.getIn(['actions', 'deleteAssociationType', id]).toJS())
  //       .toEqual({
  //         id,
  //         type: deleteAssociationType.REQUEST,
  //         value: associationTypeId
  //       });
  //   });
  //
  //   test(deleteAssociationType.FINALLY, () => {
  //
  //     const { id } = deleteAssociationType();
  //     const associationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;
  //
  //     let state = reducer(INITIAL_STATE, deleteAssociationType.request(id, associationTypeId));
  //     expect(state.getIn(['actions', 'deleteAssociationType', id]).toJS())
  //       .toEqual({
  //         id,
  //         type: deleteAssociationType.REQUEST,
  //         value: associationTypeId
  //       });
  //
  //     state = reducer(state, deleteAssociationType.finally(id));
  //     expect(state.hasIn(['actions', 'createAssociationType', id])).toEqual(false);
  //   });
  //
  // });

  // describe(UPDATE_ASSOCIATION_TYPE_METADATA, () => {
  //
  //   // TODO: beforeEach()?
  //   // TODO: need tests for other metadata fields
  //
  //   describe('title', () => {
  //
  //     const associationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;
  //     const mockActionValue = {
  //       associationTypeId,
  //       metadata: {
  //         title: randomId()
  //       }
  //     };
  //
  //     test(updateAssociationTypeMetaData.REQUEST, () => {
  //
  //       const { id } = updateAssociationTypeMetaData();
  //       const seqAction = updateAssociationTypeMetaData.request(id, mockActionValue);
  //       const state = reducer(INITIAL_STATE, seqAction);
  //
  //       expect(state.getIn(['actions', 'updateAssociationTypeMetaData', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateAssociationTypeMetaData.REQUEST,
  //           value: mockActionValue
  //         });
  //     });
  //
  //     test(updateAssociationTypeMetaData.SUCCESS, () => {
  //
  //       let state = INITIAL_STATE
  //         .set('associationTypes', fromJS([MOCK_ASSOCIATION_TYPE.asImmutable()]))
  //         .set('associationTypesById', fromJS({ [associationTypeId]: 0 }));
  //
  //       const { id } = updateAssociationTypeMetaData();
  //       state = reducer(state, updateAssociationTypeMetaData.request(id, mockActionValue));
  //       state = reducer(state, updateAssociationTypeMetaData.success(id));
  //
  //       const expectedAssociationType = MOCK_ASSOCIATION_TYPE
  //         .asImmutable()
  //         .setIn(['entityType', 'title'], mockActionValue.metadata.title);
  //
  //       expect(state.get('associationTypes').toJS()).toEqual(
  //         [expectedAssociationType.toJS()]
  //       );
  //
  //       expect(state.get('associationTypesById').toJS()).toEqual(
  //         { [associationTypeId]: 0 }
  //       );
  //
  //       expect(state.getIn(['actions', 'updateAssociationTypeMetaData', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateAssociationTypeMetaData.REQUEST,
  //           value: mockActionValue
  //         });
  //     });
  //
  //     test(updateAssociationTypeMetaData.FAILURE, () => {
  //
  //       const { id } = updateAssociationTypeMetaData();
  //       let state = reducer(INITIAL_STATE, updateAssociationTypeMetaData.request(id, mockActionValue));
  //       state = reducer(state, updateAssociationTypeMetaData.failure(id));
  //
  //       expect(state.getIn(['actions', 'updateAssociationTypeMetaData', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateAssociationTypeMetaData.REQUEST,
  //           value: mockActionValue
  //         });
  //     });
  //
  //     test(updateAssociationTypeMetaData.FINALLY, () => {
  //
  //       const { id } = updateAssociationTypeMetaData();
  //       let state = reducer(INITIAL_STATE, updateAssociationTypeMetaData.request(id, mockActionValue));
  //       expect(state.getIn(['actions', 'updateAssociationTypeMetaData', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateAssociationTypeMetaData.REQUEST,
  //           value: mockActionValue
  //         });
  //
  //       state = reducer(state, updateAssociationTypeMetaData.finally(id));
  //       expect(state.hasIn(['actions', 'updateAssociationTypeMetaData', id])).toEqual(false);
  //     });
  //
  //   });
  //
  // });

  // describe(UPDATE_SCHEMA, () => {
  //
  //   describe(`${ActionTypes.ADD}`, () => {
  //
  //     const mockAssociationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;
  //     const mockActionValue = {
  //       action: ActionTypes.ADD,
  //       entityTypeIds: [mockAssociationTypeId],
  //       schemaFqn: MOCK_SCHEMA_FQN,
  //     };
  //
  //     test(updateSchema.REQUEST, () => {
  //
  //       const { id } = updateSchema();
  //       const seqAction = updateSchema.request(id, mockActionValue);
  //       const state = reducer(INITIAL_STATE, seqAction);
  //
  //       expect(state.getIn(['actions', 'updateSchema', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateSchema.REQUEST,
  //           value: mockActionValue,
  //         });
  //     });
  //
  //     test(updateSchema.SUCCESS, () => {
  //
  //       const mockAssociationType = MOCK_ASSOCIATION_TYPE
  //         .asImmutable()
  //         .setIn(['entityType', 'schemas'], List());
  //
  //       let state = INITIAL_STATE
  //         .set('associationTypes', fromJS([mockAssociationType]))
  //         .set('associationTypesById', fromJS({ [mockAssociationTypeId]: 0 }));
  //
  //       const { id } = updateSchema();
  //       state = reducer(state, updateSchema.request(id, mockActionValue));
  //       state = reducer(state, updateSchema.success(id));
  //
  //       const expectedAssociationType = MOCK_ASSOCIATION_TYPE
  //         .asImmutable()
  //         .setIn(['entityType', 'schemas'], List([MOCK_SCHEMA_FQN]));
  //
  //       expect(state.get('associationTypes').toJS()).toEqual(
  //         [expectedAssociationType.toJS()]
  //       );
  //
  //       expect(state.get('associationTypesById').toJS()).toEqual(
  //         { [mockAssociationTypeId]: 0 }
  //       );
  //
  //       expect(state.getIn(['actions', 'updateSchema', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateSchema.REQUEST,
  //           value: mockActionValue,
  //         });
  //     });
  //
  //     test(updateSchema.FAILURE, () => {
  //
  //       let state = INITIAL_STATE
  //         .set('associationTypes', fromJS([MOCK_ASSOCIATION_TYPE.asImmutable()]))
  //         .set('associationTypesById', fromJS({ [mockAssociationTypeId]: 0 }));
  //
  //       const { id } = updateSchema();
  //       state = reducer(state, updateSchema.request(id, mockActionValue));
  //       state = reducer(state, updateSchema.failure(id));
  //
  //       expect(state.get('associationTypes').toJS()).toEqual(
  //         [MOCK_ASSOCIATION_TYPE]
  //       );
  //
  //       expect(state.get('associationTypesById').toJS()).toEqual(
  //         { [mockAssociationTypeId]: 0 }
  //       );
  //
  //       expect(state.getIn(['actions', 'updateSchema', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateSchema.REQUEST,
  //           value: mockActionValue,
  //         });
  //     });
  //
  //     test(updateSchema.FINALLY, () => {
  //
  //       const { id } = updateSchema();
  //       let state = reducer(INITIAL_STATE, updateSchema.request(id, mockActionValue));
  //       expect(state.getIn(['actions', 'updateSchema', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateSchema.REQUEST,
  //           value: mockActionValue,
  //         });
  //
  //       state = reducer(state, updateSchema.finally(id));
  //       expect(state.hasIn(['actions', 'updateSchema', id])).toEqual(false);
  //     });
  //
  //   });
  //
  //   describe(`${ActionTypes.REMOVE}`, () => {
  //
  //     const mockAssociationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;
  //     const mockActionValue = {
  //       action: ActionTypes.REMOVE,
  //       entityTypeIds: [mockAssociationTypeId],
  //       schemaFqn: MOCK_SCHEMA_FQN,
  //     };
  //
  //     test(updateSchema.REQUEST, () => {
  //
  //       const { id } = updateSchema();
  //       const seqAction = updateSchema.request(id, mockActionValue);
  //       const state = reducer(INITIAL_STATE, seqAction);
  //
  //       expect(state.getIn(['actions', 'updateSchema', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateSchema.REQUEST,
  //           value: mockActionValue,
  //         });
  //     });
  //
  //     test(updateSchema.SUCCESS, () => {
  //
  //       let state = INITIAL_STATE
  //         .set('associationTypes', fromJS([MOCK_ASSOCIATION_TYPE.asImmutable()]))
  //         .set('associationTypesById', fromJS({ [mockAssociationTypeId]: 0 }));
  //
  //       const { id } = updateSchema();
  //       state = reducer(state, updateSchema.request(id, mockActionValue));
  //       state = reducer(state, updateSchema.success(id));
  //
  //       const expectedAssociationType = MOCK_ASSOCIATION_TYPE
  //         .asImmutable()
  //         .setIn(['entityType', 'schemas'], List());
  //
  //       expect(state.get('associationTypes').toJS()).toEqual(
  //         [expectedAssociationType.toJS()]
  //       );
  //
  //       expect(state.get('associationTypesById').toJS()).toEqual(
  //         { [mockAssociationTypeId]: 0 }
  //       );
  //
  //       expect(state.getIn(['actions', 'updateSchema', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateSchema.REQUEST,
  //           value: mockActionValue,
  //         });
  //     });
  //
  //     test(updateSchema.FAILURE, () => {
  //
  //       let state = INITIAL_STATE
  //         .set('associationTypes', fromJS([MOCK_ASSOCIATION_TYPE.asImmutable()]))
  //         .set('associationTypesById', fromJS({ [mockAssociationTypeId]: 0 }));
  //
  //       const { id } = updateSchema();
  //       state = reducer(state, updateSchema.request(id, mockActionValue));
  //       state = reducer(state, updateSchema.failure(id));
  //
  //       expect(state.get('associationTypes').toJS()).toEqual(
  //         [MOCK_ASSOCIATION_TYPE]
  //       );
  //
  //       expect(state.get('associationTypesById').toJS()).toEqual(
  //         { [mockAssociationTypeId]: 0 }
  //       );
  //
  //       expect(state.getIn(['actions', 'updateSchema', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateSchema.REQUEST,
  //           value: mockActionValue,
  //         });
  //     });
  //
  //     test(updateSchema.FINALLY, () => {
  //
  //       const { id } = updateSchema();
  //       let state = reducer(INITIAL_STATE, updateSchema.request(id, mockActionValue));
  //       expect(state.getIn(['actions', 'updateSchema', id]).toJS())
  //         .toEqual({
  //           id,
  //           type: updateSchema.REQUEST,
  //           value: mockActionValue,
  //         });
  //
  //       state = reducer(state, updateSchema.finally(id));
  //       expect(state.hasIn(['actions', 'updateSchema', id])).toEqual(false);
  //     });
  //
  //   });
  //
  // });

});
