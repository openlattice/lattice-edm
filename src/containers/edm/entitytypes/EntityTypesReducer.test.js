import randomUUID from 'uuid/v4';
import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

import reducer from './EntityTypesReducer';
import { MOCK_ENTITY_TYPE } from '../../../utils/MockDataModels';
import { randomStringId } from '../../../utils/Utils';
import {
  LOCAL_ADD_PT_TO_ET,
  LOCAL_CREATE_ENTITY_TYPE,
  LOCAL_DELETE_ENTITY_TYPE,
  LOCAL_REMOVE_PT_FROM_ET,
  LOCAL_UPDATE_ENTITY_TYPE_META,
  localAddPropertyTypeToEntityType,
  localCreateEntityType,
  localDeleteEntityType,
  localRemovePropertyTypeFromEntityType,
  localUpdateEntityTypeMeta,
} from './EntityTypesActions';

const {
  FullyQualifiedName,
  EntityTypeBuilder,
} = Models;

const {
  GET_ENTITY_DATA_MODEL,
  getEntityDataModel,
} = EntityDataModelApiActions;

describe('EntityTypesReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.toJS()).toEqual({
      [LOCAL_ADD_PT_TO_ET]: { error: false },
      [LOCAL_CREATE_ENTITY_TYPE]: { error: false },
      [LOCAL_DELETE_ENTITY_TYPE]: { error: false },
      [LOCAL_UPDATE_ENTITY_TYPE_META]: { error: false },
      entityTypes: [],
      entityTypesIndexMap: {},
      newlyCreatedEntityTypeFQN: undefined,
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
      const response = { entityTypes: [MOCK_ENTITY_TYPE.toObject()] };
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.success(id, response));

      const expectedPropertyTypes = List().push(MOCK_ENTITY_TYPE.toImmutable());
      expect(state.get('entityTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
      expect(state.get('entityTypes').equals(expectedPropertyTypes)).toEqual(true);

      const expectedPropertyTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
      expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
      expect(state.get('entityTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
      state.get('entityTypesIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(getEntityDataModel.FAILURE, () => {

      const { id } = getEntityDataModel();
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.failure(id));
      expect(state.get('entityTypes').toJS()).toEqual([]);
      expect(state.get('entityTypesIndexMap').toJS()).toEqual({});
    });

    test(getEntityDataModel.FINALLY, () => {

      const { id } = getEntityDataModel();
      const stateAfterRequest = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      const stateAfterFinally = reducer(stateAfterRequest, getEntityDataModel.finally(id));
      expect(stateAfterFinally.hashCode()).toEqual(stateAfterRequest.hashCode());
      expect(stateAfterFinally.equals(stateAfterRequest)).toEqual(true);
    });

  });

  describe(LOCAL_ADD_PT_TO_ET, () => {

    const initialState = INITIAL_STATE
      .setIn(['entityTypes', 0], MOCK_ENTITY_TYPE.toImmutable())
      .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.id], 0)
      .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.type], 0);

    const mockActionValue = {
      entityTypeFQN: MOCK_ENTITY_TYPE.type,
      entityTypeId: MOCK_ENTITY_TYPE.id,
      propertyTypeId: randomUUID(),
    };

    test(localAddPropertyTypeToEntityType.REQUEST, () => {

      const { id } = localAddPropertyTypeToEntityType();
      const requestAction = localAddPropertyTypeToEntityType.request(id, mockActionValue);
      const state = reducer(INITIAL_STATE, requestAction);
      expect(state.getIn([LOCAL_ADD_PT_TO_ET, id])).toEqual(requestAction);
    });

    describe(localAddPropertyTypeToEntityType.SUCCESS, () => {

      test('should add PropertyType id', () => {

        const { id } = localAddPropertyTypeToEntityType();
        const requestAction = localAddPropertyTypeToEntityType.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localAddPropertyTypeToEntityType.success(id));
        expect(state.getIn([LOCAL_ADD_PT_TO_ET, id])).toEqual(requestAction);

        const entityType = MOCK_ENTITY_TYPE.toImmutable();
        const expectedEntityTypes = List().push(
          entityType.set('properties', entityType.get('properties').push(mockActionValue.propertyTypeId))
        );
        expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
        expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

        const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
        expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
        expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
        state.get('entityTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test('should not mutate state if the id is already in the list', () => {

        const { id } = localAddPropertyTypeToEntityType();
        const requestAction = localAddPropertyTypeToEntityType.request(id, {
          entityTypeFQN: MOCK_ENTITY_TYPE.type,
          entityTypeId: MOCK_ENTITY_TYPE.id,
          propertyTypeId: MOCK_ENTITY_TYPE.properties[0],
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localAddPropertyTypeToEntityType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

      test('should not mutate state if the id is invalid', () => {

        const { id } = localAddPropertyTypeToEntityType();
        const requestAction = localAddPropertyTypeToEntityType.request(id, {
          entityTypeFQN: MOCK_ENTITY_TYPE.type,
          entityTypeId: MOCK_ENTITY_TYPE.id,
          propertyTypeId: '',
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localAddPropertyTypeToEntityType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localAddPropertyTypeToEntityType.FAILURE, () => {

      const { id } = localAddPropertyTypeToEntityType();
      const requestAction = localAddPropertyTypeToEntityType.request(id, mockActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, localAddPropertyTypeToEntityType.failure(id));
      expect(state.getIn([LOCAL_ADD_PT_TO_ET, id])).toEqual(requestAction);

      const expectedEntityTypes = List().push(MOCK_ENTITY_TYPE.toImmutable());
      expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
      expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

      const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
      expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
      expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
      state.get('entityTypesIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(localAddPropertyTypeToEntityType.FINALLY, () => {

      const { id } = localAddPropertyTypeToEntityType();
      let state = reducer(initialState, localAddPropertyTypeToEntityType.request(id, mockActionValue));
      state = reducer(state, localAddPropertyTypeToEntityType.success(id));
      state = reducer(state, localAddPropertyTypeToEntityType.finally(id));
      expect(state.hasIn([LOCAL_ADD_PT_TO_ET, id])).toEqual(false);
    });

  });

  describe(LOCAL_CREATE_ENTITY_TYPE, () => {

    test(localCreateEntityType.REQUEST, () => {

      const { id } = localCreateEntityType();
      const requestAction = localCreateEntityType.request(id, MOCK_ENTITY_TYPE);
      const state = reducer(INITIAL_STATE, requestAction);

      expect(state.getIn([LOCAL_CREATE_ENTITY_TYPE, id])).toEqual(requestAction);
      expect(state.get('newlyCreatedEntityTypeFQN')).toEqual(undefined);
    });

    test(localCreateEntityType.SUCCESS, () => {

      const { id } = localCreateEntityType();
      const requestAction = localCreateEntityType.request(id, MOCK_ENTITY_TYPE);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreateEntityType.success(id, MOCK_ENTITY_TYPE.id));

      expect(state.getIn([LOCAL_CREATE_ENTITY_TYPE, id])).toEqual(requestAction);
      expect(state.get('newlyCreatedEntityTypeFQN')).toEqual(MOCK_ENTITY_TYPE.type);
      expect(state.get('newlyCreatedEntityTypeFQN')).toBeInstanceOf(FullyQualifiedName);

      const expectedEntityTypes = List().push(MOCK_ENTITY_TYPE.toImmutable());
      expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
      expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

      const expectedEntityTypesIndexMap = Map()
        .set(MOCK_ENTITY_TYPE.id, 0)
        .set(MOCK_ENTITY_TYPE.type, 0);
      expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
      expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
      state.get('entityTypesIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(localCreateEntityType.FAILURE, () => {

      const { id } = localCreateEntityType();
      const requestAction = localCreateEntityType.request(id, MOCK_ENTITY_TYPE);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreateEntityType.failure(id));

      expect(state.getIn([LOCAL_CREATE_ENTITY_TYPE, id])).toEqual(requestAction);
      expect(state.getIn([LOCAL_CREATE_ENTITY_TYPE, 'error'])).toEqual(true);
      expect(state.get('newlyCreatedEntityTypeFQN')).toEqual(undefined);

      const expectedEntityTypes = List();
      expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
      expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

      const expectedEntityTypesIndexMap = Map();
      expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
      expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
    });

    test(localCreateEntityType.FINALLY, () => {

      const { id } = localCreateEntityType();
      let state = reducer(INITIAL_STATE, localCreateEntityType.request(id, MOCK_ENTITY_TYPE));
      state = reducer(state, localCreateEntityType.success(id, MOCK_ENTITY_TYPE.id));
      state = reducer(state, localCreateEntityType.finally(id));

      expect(state.hasIn([LOCAL_CREATE_ENTITY_TYPE, id])).toEqual(false);
      expect(state.get('newlyCreatedEntityTypeFQN')).toEqual(MOCK_ENTITY_TYPE.type);
      expect(state.get('newlyCreatedEntityTypeFQN')).toBeInstanceOf(FullyQualifiedName);
    });

  });

  describe(LOCAL_DELETE_ENTITY_TYPE, () => {

    test(localDeleteEntityType.REQUEST, () => {

      const { id } = localDeleteEntityType();
      const requestAction = localDeleteEntityType.request(id, { entityTypeFQN: MOCK_ENTITY_TYPE.type });
      const state = reducer(INITIAL_STATE, requestAction);
      expect(state.getIn([LOCAL_DELETE_ENTITY_TYPE, id])).toEqual(requestAction);
    });

    describe(localDeleteEntityType.SUCCESS, () => {

      test('should delete EntityType', () => {

        const initialState = INITIAL_STATE
          .setIn(['entityTypes', 0], MOCK_ENTITY_TYPE.toImmutable())
          .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.id], 0)
          .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.type], 0);

        const { id } = localDeleteEntityType();
        const requestAction = localDeleteEntityType.request(id, { entityTypeFQN: MOCK_ENTITY_TYPE.type });
        let state = reducer(initialState, requestAction);
        state = reducer(state, localDeleteEntityType.success(id));

        expect(state.getIn([LOCAL_DELETE_ENTITY_TYPE, id])).toEqual(requestAction);
        expect(state.get('entityTypes').toJS()).toEqual([]);
        expect(state.get('entityTypesIndexMap').toJS()).toEqual({});
      });

      test('should correctly update "entityTypes" and "entityTypesIndexMap"', () => {

        const mockEntityType0 = new EntityTypeBuilder()
          .setId(randomUUID())
          .setKey([randomUUID()])
          .setPropertyTypes([randomUUID(), randomUUID()])
          .setSchemas([new FullyQualifiedName(randomStringId(), randomStringId())])
          .setTitle(randomStringId())
          .setType(new FullyQualifiedName(randomStringId(), randomStringId()))
          .build();

        const mockEntityType1 = new EntityTypeBuilder()
          .setId(randomUUID())
          .setKey([randomUUID()])
          .setPropertyTypes([randomUUID(), randomUUID()])
          .setSchemas([new FullyQualifiedName(randomStringId(), randomStringId())])
          .setTitle(randomStringId())
          .setType(new FullyQualifiedName(randomStringId(), randomStringId()))
          .build();

        const mockEntityType2 = new EntityTypeBuilder()
          .setId(randomUUID())
          .setKey([randomUUID()])
          .setPropertyTypes([randomUUID(), randomUUID()])
          .setSchemas([new FullyQualifiedName(randomStringId(), randomStringId())])
          .setTitle(randomStringId())
          .setType(new FullyQualifiedName(randomStringId(), randomStringId()))
          .build();

        const initialState = INITIAL_STATE
          .setIn(['entityTypes', 0], mockEntityType0.toImmutable())
          .setIn(['entityTypes', 1], mockEntityType1.toImmutable())
          .setIn(['entityTypes', 2], mockEntityType2.toImmutable())
          .setIn(['entityTypesIndexMap', mockEntityType0.id], 0)
          .setIn(['entityTypesIndexMap', mockEntityType0.type], 0)
          .setIn(['entityTypesIndexMap', mockEntityType1.id], 1)
          .setIn(['entityTypesIndexMap', mockEntityType1.type], 1)
          .setIn(['entityTypesIndexMap', mockEntityType2.id], 2)
          .setIn(['entityTypesIndexMap', mockEntityType2.type], 2);

        const { id } = localDeleteEntityType();
        const requestAction = localDeleteEntityType.request(id, { entityTypeFQN: mockEntityType1.type });
        let state = reducer(initialState, requestAction);
        state = reducer(state, localDeleteEntityType.success(id));
        expect(state.getIn([LOCAL_DELETE_ENTITY_TYPE, id])).toEqual(requestAction);

        const expectedEntityTypes = List()
          .push(mockEntityType0.toImmutable())
          .push(mockEntityType2.toImmutable());
        expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
        expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

        const expectedEntityTypesIndexMap = Map()
          .set(mockEntityType0.id, 0)
          .set(mockEntityType0.type, 0)
          .set(mockEntityType2.id, 1)
          .set(mockEntityType2.type, 1);
        expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
        expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
        state.get('entityTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test('should not mutate state if attempting to delete a non-existent EntityType', () => {

        const initialState = INITIAL_STATE
          .setIn(['entityTypes', 0], MOCK_ENTITY_TYPE.toImmutable())
          .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.id], 0)
          .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.type], 0);

        const { id } = localDeleteEntityType();
        const entityTypeFQN = new FullyQualifiedName(randomStringId(), randomStringId());
        const stateAfterRequest = reducer(initialState, localDeleteEntityType.request(id, { entityTypeFQN }));
        const stateAfterSuccess = reducer(stateAfterRequest, localDeleteEntityType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localDeleteEntityType.FAILURE, () => {

      const initialState = INITIAL_STATE
        .setIn(['entityTypes', 0], MOCK_ENTITY_TYPE.toImmutable())
        .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.id], 0)
        .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.type], 0);

      const { id } = localDeleteEntityType();
      const requestAction = localDeleteEntityType.request(id, { entityTypeFQN: MOCK_ENTITY_TYPE.type });
      let state = reducer(initialState, requestAction);
      state = reducer(state, localDeleteEntityType.failure(id));

      expect(state.getIn([LOCAL_DELETE_ENTITY_TYPE, id])).toEqual(requestAction);
      expect(state.getIn([LOCAL_DELETE_ENTITY_TYPE, 'error'])).toEqual(true);
      expect(state.get('newlyCreatedEntityTypeFQN')).toEqual(undefined);

      const expectedEntityTypes = initialState.get('entityTypes');
      expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
      expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

      const expectedEntityTypesIndexMap = initialState.get('entityTypesIndexMap');
      expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
      expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
    });

    test(localDeleteEntityType.FINALLY, () => {

      const { id } = localDeleteEntityType();
      const requestAction = localDeleteEntityType.request(id, { entityTypeFQN: MOCK_ENTITY_TYPE.type });
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localDeleteEntityType.success(id));
      state = reducer(state, localDeleteEntityType.finally(id));
      expect(state.hasIn([LOCAL_DELETE_ENTITY_TYPE, id])).toEqual(false);
    });

  });

  describe(LOCAL_REMOVE_PT_FROM_ET, () => {

    const initialState = INITIAL_STATE
      .setIn(['entityTypes', 0], MOCK_ENTITY_TYPE.toImmutable())
      .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.id], 0)
      .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.type], 0);

    const mockActionValue = {
      entityTypeFQN: MOCK_ENTITY_TYPE.type,
      entityTypeId: MOCK_ENTITY_TYPE.id,
      propertyTypeId: MOCK_ENTITY_TYPE.properties[0],
    };

    test(localRemovePropertyTypeFromEntityType.REQUEST, () => {

      const { id } = localRemovePropertyTypeFromEntityType();
      const requestAction = localRemovePropertyTypeFromEntityType.request(id, mockActionValue);
      const state = reducer(initialState, requestAction);
      expect(state.getIn([LOCAL_REMOVE_PT_FROM_ET, id])).toEqual(requestAction);
    });

    describe(localRemovePropertyTypeFromEntityType.SUCCESS, () => {

      test('should remove PropertyType id', () => {

        const { id } = localRemovePropertyTypeFromEntityType();
        const requestAction = localRemovePropertyTypeFromEntityType.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localRemovePropertyTypeFromEntityType.success(id));
        expect(state.getIn([LOCAL_REMOVE_PT_FROM_ET, id])).toEqual(requestAction);

        const entityType = MOCK_ENTITY_TYPE.toImmutable();
        const expectedEntityTypes = List().push(
          entityType.set('properties', entityType.get('properties').delete(0))
        );
        expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
        expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

        const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
        expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
        expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
        state.get('entityTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test('should not mutate state if the id is not in the list', () => {

        const { id } = localRemovePropertyTypeFromEntityType();
        const requestAction = localRemovePropertyTypeFromEntityType.request(id, {
          entityTypeFQN: MOCK_ENTITY_TYPE.type,
          entityTypeId: MOCK_ENTITY_TYPE.id,
          propertyTypeId: randomUUID(),
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localRemovePropertyTypeFromEntityType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

      test('should not mutate state if the id is invalid', () => {

        const { id } = localRemovePropertyTypeFromEntityType();
        const requestAction = localRemovePropertyTypeFromEntityType.request(id, {
          entityTypeFQN: MOCK_ENTITY_TYPE.type,
          entityTypeId: MOCK_ENTITY_TYPE.id,
          propertyTypeId: '',
        });
        const stateAfterRequest = reducer(initialState, requestAction);
        const stateAfterSuccess = reducer(stateAfterRequest, localRemovePropertyTypeFromEntityType.success(id));
        expect(stateAfterSuccess.hashCode()).toEqual(stateAfterRequest.hashCode());
        expect(stateAfterSuccess.equals(stateAfterRequest)).toEqual(true);
      });

    });

    test(localRemovePropertyTypeFromEntityType.FAILURE, () => {

      const { id } = localRemovePropertyTypeFromEntityType();
      const requestAction = localRemovePropertyTypeFromEntityType.request(id, mockActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, localRemovePropertyTypeFromEntityType.failure(id));
      expect(state.getIn([LOCAL_REMOVE_PT_FROM_ET, id])).toEqual(requestAction);

      const expectedEntityTypes = List().push(MOCK_ENTITY_TYPE.toImmutable());
      expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
      expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

      const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
      expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
      expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
      state.get('entityTypesIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(localRemovePropertyTypeFromEntityType.FINALLY, () => {

      const { id } = localRemovePropertyTypeFromEntityType();
      let state = reducer(initialState, localRemovePropertyTypeFromEntityType.request(id, mockActionValue));
      state = reducer(state, localRemovePropertyTypeFromEntityType.success(id));
      state = reducer(state, localRemovePropertyTypeFromEntityType.finally(id));
      expect(state.hasIn([LOCAL_REMOVE_PT_FROM_ET, id])).toEqual(false);
    });

  });

  describe(LOCAL_UPDATE_ENTITY_TYPE_META, () => {

    const initialState = INITIAL_STATE
      .setIn(['entityTypes', 0], MOCK_ENTITY_TYPE.toImmutable())
      .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.id], 0)
      .setIn(['entityTypesIndexMap', MOCK_ENTITY_TYPE.type], 0);

    describe('description', () => {

      const mockActionValue = {
        entityTypeId: MOCK_ENTITY_TYPE.id,
        entityTypeFQN: MOCK_ENTITY_TYPE.type,
        metadata: { description: randomStringId() },
      };

      test(localUpdateEntityTypeMeta.REQUEST, () => {

        const { id } = localUpdateEntityTypeMeta();
        const requestAction = localUpdateEntityTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(requestAction);
      });

      test(localUpdateEntityTypeMeta.SUCCESS, () => {

        const { id } = localUpdateEntityTypeMeta();
        const requestAction = localUpdateEntityTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateEntityTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(requestAction);

        const expectedEntityTypes = List().push(
          MOCK_ENTITY_TYPE.toImmutable().set('description', mockActionValue.metadata.description)
        );
        expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
        expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

        const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
        expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
        expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
        state.get('entityTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdateEntityTypeMeta.FAILURE, () => {

        const { id } = localUpdateEntityTypeMeta();
        const requestAction = localUpdateEntityTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateEntityTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(requestAction);

        const expectedEntityTypes = List().push(MOCK_ENTITY_TYPE.toImmutable());
        expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
        expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

        const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
        expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
        expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
        state.get('entityTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdateEntityTypeMeta.FINALLY, () => {

        const { id } = localUpdateEntityTypeMeta();
        let state = reducer(initialState, localUpdateEntityTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdateEntityTypeMeta.success(id));
        state = reducer(state, localUpdateEntityTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(false);
      });

    });

    describe('title', () => {

      const mockActionValue = {
        entityTypeId: MOCK_ENTITY_TYPE.id,
        entityTypeFQN: MOCK_ENTITY_TYPE.type,
        metadata: { title: randomStringId() },
      };

      test(localUpdateEntityTypeMeta.REQUEST, () => {

        const { id } = localUpdateEntityTypeMeta();
        const requestAction = localUpdateEntityTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(requestAction);
      });

      test(localUpdateEntityTypeMeta.SUCCESS, () => {

        const { id } = localUpdateEntityTypeMeta();
        const requestAction = localUpdateEntityTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateEntityTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(requestAction);

        const expectedEntityTypes = List().push(
          MOCK_ENTITY_TYPE.toImmutable().set('title', mockActionValue.metadata.title)
        );
        expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
        expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

        const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
        expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
        expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
        state.get('entityTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdateEntityTypeMeta.FAILURE, () => {

        const { id } = localUpdateEntityTypeMeta();
        const requestAction = localUpdateEntityTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateEntityTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(requestAction);

        const expectedEntityTypes = List().push(MOCK_ENTITY_TYPE.toImmutable());
        expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
        expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

        const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
        expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
        expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
        state.get('entityTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdateEntityTypeMeta.FINALLY, () => {

        const { id } = localUpdateEntityTypeMeta();
        let state = reducer(initialState, localUpdateEntityTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdateEntityTypeMeta.success(id));
        state = reducer(state, localUpdateEntityTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(false);
      });

    });

    describe('type', () => {

      const mockActionValue = {
        entityTypeId: MOCK_ENTITY_TYPE.id,
        entityTypeFQN: MOCK_ENTITY_TYPE.type,
        metadata: { type: new FullyQualifiedName(randomStringId(), randomStringId()) },
      };

      test(localUpdateEntityTypeMeta.REQUEST, () => {

        const { id } = localUpdateEntityTypeMeta();
        const requestAction = localUpdateEntityTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(requestAction);
      });

      test(localUpdateEntityTypeMeta.SUCCESS, () => {

        const { id } = localUpdateEntityTypeMeta();
        const requestAction = localUpdateEntityTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateEntityTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(requestAction);

        const expectedEntityTypes = List().push(
          MOCK_ENTITY_TYPE.toImmutable().set('type', fromJS(mockActionValue.metadata.type.toObject()))
        );
        expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
        expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

        const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(mockActionValue.metadata.type, 0);
        expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
        expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
        state.get('entityTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdateEntityTypeMeta.FAILURE, () => {

        const { id } = localUpdateEntityTypeMeta();
        const requestAction = localUpdateEntityTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdateEntityTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(requestAction);

        const expectedEntityTypes = List().push(MOCK_ENTITY_TYPE.toImmutable());
        expect(state.get('entityTypes').hashCode()).toEqual(expectedEntityTypes.hashCode());
        expect(state.get('entityTypes').equals(expectedEntityTypes)).toEqual(true);

        const expectedEntityTypesIndexMap = Map().set(MOCK_ENTITY_TYPE.id, 0).set(MOCK_ENTITY_TYPE.type, 0);
        expect(state.get('entityTypesIndexMap').hashCode()).toEqual(expectedEntityTypesIndexMap.hashCode());
        expect(state.get('entityTypesIndexMap').equals(expectedEntityTypesIndexMap)).toEqual(true);
        state.get('entityTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdateEntityTypeMeta.FINALLY, () => {

        const { id } = localUpdateEntityTypeMeta();
        let state = reducer(initialState, localUpdateEntityTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdateEntityTypeMeta.success(id));
        state = reducer(state, localUpdateEntityTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_ENTITY_TYPE_META, id])).toEqual(false);
      });

    });

  });

});
