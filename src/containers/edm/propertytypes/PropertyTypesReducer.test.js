/*
 *
 */

import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './PropertyTypesReducer';

import {
  MOCK_PROPERTY_TYPE,
  MOCK_PROPERTY_TYPE_JSON
} from '../../../utils/MockDataModels';

const {
  CREATE_PROPERTY_TYPE,
  GET_ALL_PROPERTY_TYPES,
  createPropertyType,
  getAllPropertyTypes
} = EntityDataModelApiActionFactory;

describe('PropertyTypesReducer', () => {

  const INITIAL_STATE :Map<*, *> = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Immutable.Map);
    expect(INITIAL_STATE.get('propertyTypes')).toEqual(Immutable.List());
    expect(INITIAL_STATE.get('propertyTypesById')).toEqual(Immutable.Map());
    expect(INITIAL_STATE.get('isCreatingNewPropertyType')).toEqual(false);
    expect(INITIAL_STATE.get('isFetchingAllPropertyTypes')).toEqual(false);
    expect(INITIAL_STATE.get('newlyCreatedPropertyTypeId')).toEqual('');
  });

  describe(CREATE_PROPERTY_TYPE, () => {

    test(createPropertyType.REQUEST, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, createPropertyType.request(MOCK_PROPERTY_TYPE));
      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeId')).toEqual('');
      expect(state.get('tempPropertyType')).toEqual(MOCK_PROPERTY_TYPE);
    });

    test(createPropertyType.SUCCESS, () => {

      let state :Map<*, *> = reducer(INITIAL_STATE, createPropertyType.request(MOCK_PROPERTY_TYPE));
      state = reducer(state, createPropertyType.success(MOCK_PROPERTY_TYPE.id));
      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeId')).toEqual(MOCK_PROPERTY_TYPE.id);

      const expectedPropertyType = MOCK_PROPERTY_TYPE.asImmutable();
      expect(state.get('propertyTypes')).toEqual(
        Immutable.fromJS([expectedPropertyType])
      );

      expect(state.get('propertyTypesById')).toEqual(
        Immutable.fromJS({ [MOCK_PROPERTY_TYPE.id]: 0 })
      );
    });

    test(createPropertyType.FAILURE, () => {
      // TODO: need to properly handle the failure case
      let state :Map<*, *> = reducer(INITIAL_STATE, createPropertyType.request(MOCK_PROPERTY_TYPE));
      state = reducer(state, createPropertyType.failure());
      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
      expect(state.get('tempPropertyType')).toEqual(MOCK_PROPERTY_TYPE);
      expect(state.get('newlyCreatedPropertyTypeId')).toEqual('');
    });

    test(createPropertyType.FINALLY, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, createPropertyType.finally());
      expect(state.get('isCreatingNewPropertyType')).toEqual(false);
      expect(state.get('newlyCreatedPropertyTypeId')).toEqual('');
      expect(state.get('tempPropertyType')).toEqual(null);
    });

  });

  describe(GET_ALL_PROPERTY_TYPES, () => {

    test(getAllPropertyTypes.REQUEST, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllPropertyTypes.request());
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(true);
    });

    // TODO: test SUCCESS with variable size result
    test(getAllPropertyTypes.SUCCESS, () => {

      const response = [MOCK_PROPERTY_TYPE_JSON];
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllPropertyTypes.success(response));

      expect(state.get('propertyTypes')).toEqual(
        Immutable.fromJS([MOCK_PROPERTY_TYPE_JSON])
      );

      expect(state.get('propertyTypesById')).toEqual(
        Immutable.fromJS({ [MOCK_PROPERTY_TYPE_JSON.id]: 0 })
      );
    });

    test(getAllPropertyTypes.FAILURE, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllPropertyTypes.failure());
      expect(state.get('propertyTypes')).toEqual(Immutable.List());
      expect(state.get('propertyTypesById')).toEqual(Immutable.Map());
    });

    test(getAllPropertyTypes.FINALLY, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllPropertyTypes.finally());
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(false);
    });

  });

});
