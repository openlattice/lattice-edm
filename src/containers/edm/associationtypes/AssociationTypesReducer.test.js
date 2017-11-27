/*
 * @flow
 */

import Immutable from 'immutable';

import reducer from './AssociationTypesReducer';

import {
  MOCK_ASSOCIATION_TYPE_DM
} from '../../../utils/MockDataModels';

import {
  createAssociationTypeFailure,
  createAssociationTypeRequest,
  createAssociationTypeSuccess
} from './AssociationTypesActionFactory';

describe('AssociationTypesReducer', () => {

  test('initial state', () => {

    const state :Map<*, *> = reducer(undefined, { type: '__TEST__' });

    expect(state).toBeInstanceOf(Immutable.Map);
    expect(state.get('associationTypes')).toEqual(Immutable.List());
    expect(state.get('associationTypesById')).toEqual(Immutable.Map());
    expect(state.get('isCreatingNewAssociationType')).toEqual(false);
    expect(state.get('isFetchingAllAssociationTypes')).toEqual(false);
    expect(state.get('newlyCreatedAssociationTypeId')).toEqual('');
  });

  describe('CREATE_ENTITY_TYPE', () => {

    test('REQUEST', () => {

      const INITIAL_STATE :Map<*, *> = reducer(undefined, { type: '__TEST__' });

      const state :Map<*, *> = reducer(INITIAL_STATE, createAssociationTypeRequest());
      expect(state.get('isCreatingNewAssociationType')).toEqual(true);
    });

    test('FAILURE', () => {

      let state = reducer(undefined, { type: '__TEST__' });

      state = reducer(state, createAssociationTypeRequest());
      expect(state.get('isCreatingNewAssociationType')).toEqual(true);

      state = reducer(state, createAssociationTypeFailure());
      expect(state.get('isCreatingNewAssociationType')).toEqual(false);
    });

    test('SUCCESS', () => {

      let state = reducer(undefined, { type: '__TEST__' });

      state = reducer(state, createAssociationTypeRequest());
      expect(state.get('isCreatingNewAssociationType')).toEqual(true);

      state = reducer(state, createAssociationTypeSuccess(MOCK_ASSOCIATION_TYPE_DM, MOCK_ASSOCIATION_TYPE_DM.id));
      expect(state.get('isCreatingNewAssociationType')).toEqual(false);

      expect(state.get('associationTypes').size).toEqual(1);
      expect(state.getIn(['associationTypes', 0]).toJS()).toEqual(MOCK_ASSOCIATION_TYPE_DM);

      expect(state.get('associationTypesById').size).toEqual(1);
      expect(state.getIn(['associationTypesById', MOCK_ASSOCIATION_TYPE_DM.id])).toEqual(0);
    });

  });

});
