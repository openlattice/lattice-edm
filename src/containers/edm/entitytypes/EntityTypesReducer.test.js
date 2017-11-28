/*
 *
 */

import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './EntityTypesReducer';
import { MOCK_ENTITY_TYPE_JSON } from '../../../utils/MockDataModels';

const { GET_ALL_ENTITY_TYPES, getAllEntityTypes } = EntityDataModelApiActionFactory;

describe('EntityTypesReducer', () => {

  const INITIAL_STATE :Map<*, *> = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Immutable.Map);
    expect(INITIAL_STATE.get('entityTypes')).toEqual(Immutable.List());
    expect(INITIAL_STATE.get('entityTypesById')).toEqual(Immutable.Map());
    expect(INITIAL_STATE.get('isCreatingNewEntityType')).toEqual(false);
    expect(INITIAL_STATE.get('isFetchingAllEntityTypes')).toEqual(false);
    expect(INITIAL_STATE.get('newlyCreatedEntityTypeId')).toEqual('');
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
