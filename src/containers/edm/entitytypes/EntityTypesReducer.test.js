/*
 *
 */

import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './EntityTypesReducer';

import {
  MOCK_ENTITY_TYPE,
  MOCK_ENTITY_TYPE_JSON
} from '../../../utils/MockDataModels';

const {
  CREATE_ENTITY_TYPE,
  DELETE_ENTITY_TYPE,
  GET_ALL_ENTITY_TYPES,
  createEntityType,
  deleteEntityType,
  getAllEntityTypes
} = EntityDataModelApiActionFactory;

describe('EntityTypesReducer', () => {

  const INITIAL_STATE :Map<*, *> = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Immutable.Map);
    expect(INITIAL_STATE.get('entityTypeIdToDelete')).toEqual('');
    expect(INITIAL_STATE.get('entityTypes')).toEqual(Immutable.List());
    expect(INITIAL_STATE.get('entityTypesById')).toEqual(Immutable.Map());
    expect(INITIAL_STATE.get('isCreatingNewEntityType')).toEqual(false);
    expect(INITIAL_STATE.get('isFetchingAllEntityTypes')).toEqual(false);
    expect(INITIAL_STATE.get('newlyCreatedEntityTypeId')).toEqual('');
    expect(INITIAL_STATE.get('tempEntityType')).toEqual(null);
  });

  describe(CREATE_ENTITY_TYPE, () => {

    test(createEntityType.REQUEST, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, createEntityType.request(MOCK_ENTITY_TYPE));
      expect(state.get('isCreatingNewEntityType')).toEqual(true);
      expect(state.get('newlyCreatedEntityTypeId')).toEqual('');
      expect(state.get('tempEntityType')).toEqual(MOCK_ENTITY_TYPE);
    });

    test(createEntityType.SUCCESS, () => {

      let state :Map<*, *> = reducer(INITIAL_STATE, createEntityType.request(MOCK_ENTITY_TYPE));
      state = reducer(state, createEntityType.success(MOCK_ENTITY_TYPE.id));
      expect(state.get('isCreatingNewEntityType')).toEqual(true);
      expect(state.get('newlyCreatedEntityTypeId')).toEqual(MOCK_ENTITY_TYPE.id);

      const expectedEntityType = MOCK_ENTITY_TYPE.asImmutable();
      expect(state.get('entityTypes')).toEqual(
        Immutable.fromJS([expectedEntityType])
      );

      expect(state.get('entityTypesById')).toEqual(
        Immutable.fromJS({ [MOCK_ENTITY_TYPE.id]: 0 })
      );
    });

    test(createEntityType.FAILURE, () => {
      // TODO: need to properly handle the failure case
      let state :Map<*, *> = reducer(INITIAL_STATE, createEntityType.request(MOCK_ENTITY_TYPE));
      state = reducer(state, createEntityType.failure());
      expect(state.get('isCreatingNewEntityType')).toEqual(true);
      expect(state.get('newlyCreatedEntityTypeId')).toEqual('');
      expect(state.get('tempEntityType')).toEqual(MOCK_ENTITY_TYPE);
    });

    test(createEntityType.FINALLY, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, createEntityType.finally());
      expect(state.get('isCreatingNewEntityType')).toEqual(false);
      expect(state.get('newlyCreatedEntityTypeId')).toEqual('');
      expect(state.get('tempEntityType')).toEqual(null);
    });

  });

  describe(DELETE_ENTITY_TYPE, () => {

    test(deleteEntityType.REQUEST, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, deleteEntityType.request(MOCK_ENTITY_TYPE.id));
      expect(state.get('entityTypeIdToDelete')).toEqual(MOCK_ENTITY_TYPE.id);
    });

    test(deleteEntityType.SUCCESS, () => {

      let state :Map<*, *> = INITIAL_STATE
        .set('entityTypes', Immutable.fromJS([MOCK_ENTITY_TYPE.asImmutable()]))
        .set('entityTypesById', Immutable.fromJS({ [MOCK_ENTITY_TYPE.id]: 0 }));

      state = reducer(state, deleteEntityType.request(MOCK_ENTITY_TYPE.id));
      state = reducer(state, deleteEntityType.success());

      expect(state.get('entityTypeIdToDelete')).toEqual(MOCK_ENTITY_TYPE.id);
      expect(state.get('entityTypes')).toEqual(Immutable.List());
      expect(state.get('entityTypesById')).toEqual(Immutable.Map());
    });

    test(deleteEntityType.FAILURE, () => {
      let state :Map<*, *> = reducer(INITIAL_STATE, deleteEntityType.request(MOCK_ENTITY_TYPE.id));
      state = reducer(state, deleteEntityType.failure());
      expect(state.get('entityTypeIdToDelete')).toEqual(MOCK_ENTITY_TYPE.id);
    });

    test(deleteEntityType.FINALLY, () => {
      const entityTypeId :string = MOCK_ENTITY_TYPE.id;
      let state :Map<*, *> = reducer(INITIAL_STATE, deleteEntityType.request(entityTypeId));
      expect(state.get('entityTypeIdToDelete')).toEqual(entityTypeId);
      state = reducer(state, deleteEntityType.finally());
      expect(state.get('entityTypeIdToDelete')).toEqual('');
    });

  });

  describe(GET_ALL_ENTITY_TYPES, () => {

    test(getAllEntityTypes.REQUEST, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllEntityTypes.request());
      expect(state.get('isFetchingAllEntityTypes')).toEqual(true);
    });

    // TODO: test SUCCESS with variable size result
    test(getAllEntityTypes.SUCCESS, () => {

      const response = [MOCK_ENTITY_TYPE_JSON];
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllEntityTypes.success(response));

      expect(state.get('entityTypes')).toEqual(
        Immutable.fromJS([MOCK_ENTITY_TYPE_JSON])
      );

      expect(state.get('entityTypesById')).toEqual(
        Immutable.fromJS({ [MOCK_ENTITY_TYPE_JSON.id]: 0 })
      );
    });

    test(getAllEntityTypes.FAILURE, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllEntityTypes.failure());
      expect(state.get('entityTypes')).toEqual(Immutable.List());
      expect(state.get('entityTypesById')).toEqual(Immutable.Map());
    });

    test(getAllEntityTypes.FINALLY, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllEntityTypes.finally());
      expect(state.get('isFetchingAllEntityTypes')).toEqual(false);
    });

  });

});
