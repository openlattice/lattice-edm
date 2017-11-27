/*
 * @flow
 */

import Immutable from 'immutable';

import reducer from './PropertyTypesReducer';

import {
  MOCK_PROPERTY_TYPE_DM
} from '../../../utils/MockDataModels';

import {
  createPropertyTypeFailure,
  createPropertyTypeRequest,
  createPropertyTypeSuccess
} from './PropertyTypesActionFactory';

describe('PropertyTypesReducer', () => {

  test('initial state', () => {

    const state :Map<*, *> = reducer(undefined, { type: '__TEST__' });

    expect(state).toBeInstanceOf(Immutable.Map);
    expect(state.get('propertyTypes')).toEqual(Immutable.List());
    expect(state.get('propertyTypesById')).toEqual(Immutable.Map());
    expect(state.get('isCreatingNewPropertyType')).toEqual(false);
    expect(state.get('isFetchingAllPropertyTypes')).toEqual(false);
    expect(state.get('newlyCreatedPropertyTypeId')).toEqual('');
  });

  describe('CREATE_PROPERTY_TYPE', () => {

    test('REQUEST', () => {

      const INITIAL_STATE :Map<*, *> = reducer(undefined, { type: '__TEST__' });

      const state :Map<*, *> = reducer(INITIAL_STATE, createPropertyTypeRequest());
      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
    });

    test('FAILURE', () => {

      let state = reducer(undefined, { type: '__TEST__' });

      state = reducer(state, createPropertyTypeRequest());
      expect(state.get('isCreatingNewPropertyType')).toEqual(true);

      state = reducer(state, createPropertyTypeFailure());
      expect(state.get('isCreatingNewPropertyType')).toEqual(false);
    });

    test('SUCCESS', () => {

      let state = reducer(undefined, { type: '__TEST__' });

      state = reducer(state, createPropertyTypeRequest());
      expect(state.get('isCreatingNewPropertyType')).toEqual(true);

      state = reducer(state, createPropertyTypeSuccess(MOCK_PROPERTY_TYPE_DM, MOCK_PROPERTY_TYPE_DM.id));
      expect(state.get('isCreatingNewPropertyType')).toEqual(false);

      expect(state.get('propertyTypes').size).toEqual(1);
      expect(state.getIn(['propertyTypes', 0]).toJS()).toEqual(MOCK_PROPERTY_TYPE_DM);

      expect(state.get('propertyTypesById').size).toEqual(1);
      expect(state.getIn(['propertyTypesById', MOCK_PROPERTY_TYPE_DM.id])).toEqual(0);
    });

  });

});
