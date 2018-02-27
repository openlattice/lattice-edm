import Immutable from 'immutable';
import randomUUID from 'uuid/v4';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './EntityTypesReducer';
import { randomId } from '../../../utils/Utils';

import {
  MOCK_ENTITY_TYPE,
  MOCK_ENTITY_TYPE_JSON
} from '../../../utils/MockDataModels';

const {
  CREATE_ENTITY_TYPE,
  DELETE_ENTITY_TYPE,
  GET_ALL_ENTITY_TYPES,
  UPDATE_ENTITY_TYPE_METADATA,
  createEntityType,
  deleteEntityType,
  getAllEntityTypes,
  updateEntityTypeMetaData
} = EntityDataModelApiActionFactory;

describe('EntityTypesReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Immutable.Map);
    expect(INITIAL_STATE.get('entityTypes').toJS()).toEqual([]);
    expect(INITIAL_STATE.get('entityTypesById').toJS()).toEqual({});
    expect(INITIAL_STATE.get('isCreatingNewEntityType')).toEqual(false);
    expect(INITIAL_STATE.get('isFetchingAllEntityTypes')).toEqual(false);
    expect(INITIAL_STATE.get('newlyCreatedEntityTypeId')).toEqual('');
    expect(INITIAL_STATE.get('actions').toJS()).toEqual({
      addPropertyTypeToEntityType: {},
      createEntityType: {},
      deleteEntityType: {},
      removePropertyTypeFromEntityType: {},
      updateEntityTypeMetaData: {}
    });
  });

  describe(CREATE_ENTITY_TYPE, () => {

    test(createEntityType.REQUEST, () => {

      const { id } = createEntityType();
      const state = reducer(INITIAL_STATE, createEntityType.request(id, MOCK_ENTITY_TYPE));

      expect(state.get('isCreatingNewEntityType')).toEqual(true);
      expect(state.get('newlyCreatedEntityTypeId')).toEqual('');
      expect(state.getIn(['actions', 'createEntityType', id]).toJS())
        .toEqual({
          id,
          type: createEntityType.REQUEST,
          value: MOCK_ENTITY_TYPE
        });
    });

    test(createEntityType.SUCCESS, () => {

      const { id } = createEntityType();
      let state = reducer(INITIAL_STATE, createEntityType.request(id, MOCK_ENTITY_TYPE));
      state = reducer(state, createEntityType.success(id, MOCK_ENTITY_TYPE.id));

      expect(state.get('isCreatingNewEntityType')).toEqual(true);
      expect(state.get('newlyCreatedEntityTypeId')).toEqual(MOCK_ENTITY_TYPE.id);

      expect(state.get('entityTypes').toJS()).toEqual(
        [MOCK_ENTITY_TYPE]
      );

      expect(state.get('entityTypesById').toJS()).toEqual(
        { [MOCK_ENTITY_TYPE.id]: 0 }
      );

      expect(state.getIn(['actions', 'createEntityType', id]).toJS())
        .toEqual({
          id,
          type: createEntityType.REQUEST,
          value: MOCK_ENTITY_TYPE
        });
    });

    test(createEntityType.FAILURE, () => {

      const { id } = createEntityType();
      let state = reducer(INITIAL_STATE, createEntityType.request(id, MOCK_ENTITY_TYPE));
      state = reducer(state, createEntityType.failure(id));

      expect(state.get('isCreatingNewEntityType')).toEqual(true);
      expect(state.get('newlyCreatedEntityTypeId')).toEqual('');
      expect(state.getIn(['actions', 'createEntityType', id]).toJS())
        .toEqual({
          id,
          type: createEntityType.REQUEST,
          value: MOCK_ENTITY_TYPE
        });
    });

    test(createEntityType.FINALLY, () => {

      const { id } = createEntityType();
      let state = reducer(INITIAL_STATE, createEntityType.request(id, MOCK_ENTITY_TYPE));
      state = reducer(INITIAL_STATE, createEntityType.finally(id));

      expect(state.get('isCreatingNewEntityType')).toEqual(false);
      expect(state.get('newlyCreatedEntityTypeId')).toEqual('');
      expect(state.hasIn(['actions', 'createEntityType', id])).toEqual(false);
    });

  });

  describe(DELETE_ENTITY_TYPE, () => {

    test(deleteEntityType.REQUEST, () => {

      const { id } = deleteEntityType();
      const entityTypeId = MOCK_ENTITY_TYPE.id;
      const state = reducer(INITIAL_STATE, deleteEntityType.request(id, entityTypeId));

      expect(state.getIn(['actions', 'deleteEntityType', id]).toJS())
        .toEqual({
          id,
          type: deleteEntityType.REQUEST,
          value: entityTypeId
        });
    });

    describe(deleteEntityType.SUCCESS, () => {

      test('should delete EntityType', () => {

        // yes, this is not a valid EntityType, but the reducer only cares about the id
        const mockEntityType = { id: randomUUID() };

        let state = INITIAL_STATE
          .set('entityTypes', Immutable.fromJS([mockEntityType]))
          .set('entityTypesById', Immutable.fromJS({ [mockEntityType.id]: 0 }));

        const { id } = deleteEntityType();
        state = reducer(state, deleteEntityType.request(id, mockEntityType.id));
        state = reducer(state, deleteEntityType.success(id));

        expect(state.get('entityTypes').toJS()).toEqual([]);
        expect(state.get('entityTypesById').toJS()).toEqual({});
        expect(state.getIn(['actions', 'deleteEntityType', id]).toJS())
          .toEqual({
            id,
            type: deleteEntityType.REQUEST,
            value: mockEntityType.id
          });
      });

      test('should correctly update "entityTypes" and "entityTypesById"', () => {

        // yes, this is not a valid PropertyType, but the reducer only cares about the id
        const mockEntityType1 = { id: randomUUID() };
        const mockEntityType2 = { id: randomUUID() };
        const mockEntityType3 = { id: randomUUID() };

        let state = INITIAL_STATE
          .set('entityTypes', Immutable.fromJS([
            mockEntityType1,
            mockEntityType2,
            mockEntityType3
          ]))
          .set('entityTypesById', Immutable.fromJS({
            [mockEntityType1.id]: 0,
            [mockEntityType2.id]: 1,
            [mockEntityType3.id]: 2
          }));

        const { id } = deleteEntityType();
        state = reducer(state, deleteEntityType.request(id, mockEntityType2.id));
        state = reducer(state, deleteEntityType.success(id));

        expect(state.get('entityTypes').toJS()).toEqual([
          mockEntityType1,
          mockEntityType3
        ]);
        expect(state.get('entityTypesById').toJS()).toEqual({
          [mockEntityType1.id]: 0,
          [mockEntityType3.id]: 1
        });
      });

      test('should not mutate state if attempting to delete a non-existent EntityType', () => {

        // yes, this is not a valid PropertyType, but the reducer only cares about the id
        const mockEntityType = { id: randomUUID() };

        const initialState = INITIAL_STATE
          .set('entityTypes', Immutable.fromJS([mockEntityType]))
          .set('entityTypesById', Immutable.fromJS({ [mockEntityType.id]: 0 }));

        const { id } = deleteEntityType();
        const stateAfterRequest = reducer(initialState, deleteEntityType.request(id, randomUUID()));
        const stateAfterSuccess = reducer(stateAfterRequest, deleteEntityType.success(id));
        expect(stateAfterSuccess.toJS()).toEqual(stateAfterRequest.toJS());
      });
    });

    test(deleteEntityType.FAILURE, () => {

      const { id } = deleteEntityType();
      const entityTypeId = MOCK_ENTITY_TYPE.id;

      let state = reducer(INITIAL_STATE, deleteEntityType.request(id, entityTypeId));
      state = reducer(state, deleteEntityType.failure(id));

      expect(state.getIn(['actions', 'deleteEntityType', id]).toJS())
        .toEqual({
          id,
          type: deleteEntityType.REQUEST,
          value: entityTypeId
        });
    });

    test(deleteEntityType.FINALLY, () => {

      const { id } = deleteEntityType();
      const entityTypeId = MOCK_ENTITY_TYPE.id;

      let state = reducer(INITIAL_STATE, deleteEntityType.request(id, entityTypeId));
      expect(state.getIn(['actions', 'deleteEntityType', id]).toJS())
        .toEqual({
          id,
          type: deleteEntityType.REQUEST,
          value: entityTypeId
        });

      state = reducer(state, deleteEntityType.finally(id));
      expect(state.hasIn(['actions', 'deleteEntityType', id])).toEqual(false);
    });

  });

  describe(GET_ALL_ENTITY_TYPES, () => {

    test(getAllEntityTypes.REQUEST, () => {
      const { id } = getAllEntityTypes();
      const state = reducer(INITIAL_STATE, getAllEntityTypes.request(id));
      expect(state.get('isFetchingAllEntityTypes')).toEqual(true);
    });

    // TODO: test SUCCESS with variable size result
    test(getAllEntityTypes.SUCCESS, () => {

      const { id } = getAllEntityTypes();
      const response = [MOCK_ENTITY_TYPE_JSON];
      let state = reducer(INITIAL_STATE, getAllEntityTypes.request(id));
      state = reducer(state, getAllEntityTypes.success(id, response));

      expect(state.get('isFetchingAllEntityTypes')).toEqual(true);

      expect(state.get('entityTypes').toJS()).toEqual(
        [MOCK_ENTITY_TYPE_JSON]
      );

      expect(state.get('entityTypesById').toJS()).toEqual(
        { [MOCK_ENTITY_TYPE_JSON.id]: 0 }
      );
    });

    test(getAllEntityTypes.FAILURE, () => {

      const { id } = getAllEntityTypes();
      let state = reducer(INITIAL_STATE, getAllEntityTypes.request(id));
      state = reducer(state, getAllEntityTypes.failure(id));

      expect(state.get('entityTypes').toJS()).toEqual([]);
      expect(state.get('entityTypesById').toJS()).toEqual({});
      expect(state.get('isFetchingAllEntityTypes')).toEqual(true);
    });

    test(getAllEntityTypes.FINALLY, () => {

      const { id } = getAllEntityTypes();
      let state = reducer(INITIAL_STATE, getAllEntityTypes.request(id));
      expect(state.get('isFetchingAllEntityTypes')).toEqual(true);

      state = reducer(state, getAllEntityTypes.finally(id));
      expect(state.get('isFetchingAllEntityTypes')).toEqual(false);
    });

  });

  describe(UPDATE_ENTITY_TYPE_METADATA, () => {

    // TODO: beforeEach()?
    // TODO: need tests for other metadata fields

    describe('title', () => {

      const entityTypeId = MOCK_ENTITY_TYPE.id;
      const mockActionValue = {
        id: entityTypeId,
        metadata: {
          title: randomId()
        }
      };

      test(updateEntityTypeMetaData.REQUEST, () => {

        const { id } = updateEntityTypeMetaData();
        const seqAction = updateEntityTypeMetaData.request(id, mockActionValue);
        const state = reducer(INITIAL_STATE, seqAction);

        expect(state.getIn(['actions', 'updateEntityTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updateEntityTypeMetaData.REQUEST,
            value: mockActionValue
          });
      });

      test(updateEntityTypeMetaData.SUCCESS, () => {

        let state = INITIAL_STATE
          .set('entityTypes', Immutable.fromJS([MOCK_ENTITY_TYPE.asImmutable()]))
          .set('entityTypesById', Immutable.fromJS({ [entityTypeId]: 0 }));

        const { id } = updateEntityTypeMetaData();
        state = reducer(state, updateEntityTypeMetaData.request(id, mockActionValue));
        state = reducer(state, updateEntityTypeMetaData.success(id));

        const expectedEntityType = MOCK_ENTITY_TYPE
          .asImmutable()
          .set('title', mockActionValue.metadata.title);

        expect(state.get('entityTypes').toJS()).toEqual(
          [expectedEntityType.toJS()]
        );

        expect(state.get('entityTypesById').toJS()).toEqual(
          { [MOCK_ENTITY_TYPE.id]: 0 }
        );

        expect(state.getIn(['actions', 'updateEntityTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updateEntityTypeMetaData.REQUEST,
            value: mockActionValue
          });
      });

      test(updateEntityTypeMetaData.FAILURE, () => {

        const { id } = updateEntityTypeMetaData();
        let state = reducer(INITIAL_STATE, updateEntityTypeMetaData.request(id, mockActionValue));
        state = reducer(state, updateEntityTypeMetaData.failure(id));
        expect(state.getIn(['actions', 'updateEntityTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updateEntityTypeMetaData.REQUEST,
            value: mockActionValue
          });
      });

      test(updateEntityTypeMetaData.FINALLY, () => {

        const { id } = updateEntityTypeMetaData();
        let state = reducer(INITIAL_STATE, updateEntityTypeMetaData.request(id, mockActionValue));
        expect(state.getIn(['actions', 'updateEntityTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updateEntityTypeMetaData.REQUEST,
            value: mockActionValue
          });

        state = reducer(state, updateEntityTypeMetaData.finally(id));
        expect(state.hasIn(['actions', 'updateAssociationTypeMetaData', id])).toEqual(false);
      });

    });

  });

});
