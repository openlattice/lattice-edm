/*
 *
 */

import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './PropertyTypesReducer';
import { MOCK_PROPERTY_TYPE_JSON } from '../../../utils/MockDataModels';

const { GET_ALL_PROPERTY_TYPES, getAllPropertyTypes } = EntityDataModelApiActionFactory;

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
