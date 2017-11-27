/*
 * @flow
 */

import Immutable from 'immutable';

import reducer from './EntityTypesReducer';

import {
  MOCK_ENTITY_TYPE_DM
} from '../../../utils/MockDataModels';

import {
  createEntityTypeFailure,
  createEntityTypeRequest,
  createEntityTypeSuccess
} from './EntityTypesActionFactory';

describe('EntityTypesReducer', () => {

  test('initial state', () => {

    const state :Map<*, *> = reducer(undefined, { type: '__TEST__' });

    expect(state).toBeInstanceOf(Immutable.Map);
    expect(state.get('entityTypes')).toEqual(Immutable.List());
    expect(state.get('entityTypesById')).toEqual(Immutable.Map());
    expect(state.get('isCreatingNewEntityType')).toEqual(false);
    expect(state.get('isFetchingAllEntityTypes')).toEqual(false);
    expect(state.get('newlyCreatedEntityTypeId')).toEqual('');
  });

  describe('CREATE_ENTITY_TYPE', () => {

    test('REQUEST', () => {

      const INITIAL_STATE :Map<*, *> = reducer(undefined, { type: '__TEST__' });

      const state :Map<*, *> = reducer(INITIAL_STATE, createEntityTypeRequest());
      expect(state.get('isCreatingNewEntityType')).toEqual(true);
    });

    test('FAILURE', () => {

      let state = reducer(undefined, { type: '__TEST__' });

      state = reducer(state, createEntityTypeRequest());
      expect(state.get('isCreatingNewEntityType')).toEqual(true);

      state = reducer(state, createEntityTypeFailure());
      expect(state.get('isCreatingNewEntityType')).toEqual(false);
    });

    test('SUCCESS', () => {

      let state = reducer(undefined, { type: '__TEST__' });

      state = reducer(state, createEntityTypeRequest());
      expect(state.get('isCreatingNewEntityType')).toEqual(true);

      state = reducer(state, createEntityTypeSuccess(MOCK_ENTITY_TYPE_DM, MOCK_ENTITY_TYPE_DM.id));
      expect(state.get('isCreatingNewEntityType')).toEqual(false);

      expect(state.get('entityTypes').size).toEqual(1);
      expect(state.getIn(['entityTypes', 0]).toJS()).toEqual(MOCK_ENTITY_TYPE_DM);

      expect(state.get('entityTypesById').size).toEqual(1);
      expect(state.getIn(['entityTypesById', MOCK_ENTITY_TYPE_DM.id])).toEqual(0);
    });

  });

});
