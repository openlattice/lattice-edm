/*
 *
 */

import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './AssociationTypesReducer';
import { MOCK_ASSOCIATION_TYPE_JSON } from '../../../utils/MockDataModels';

const { GET_ALL_ASSOCIATION_TYPES, getAllAssociationTypes } = EntityDataModelApiActionFactory;

describe('AssociationTypesReducer', () => {

  const INITIAL_STATE :Map<*, *> = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Immutable.Map);
    expect(INITIAL_STATE.get('associationTypes')).toEqual(Immutable.List());
    expect(INITIAL_STATE.get('associationTypesById')).toEqual(Immutable.Map());
    expect(INITIAL_STATE.get('isCreatingNewAssociationType')).toEqual(false);
    expect(INITIAL_STATE.get('isFetchingAllAssociationTypes')).toEqual(false);
    expect(INITIAL_STATE.get('newlyCreatedAssociationTypeId')).toEqual('');
  });

  describe(GET_ALL_ASSOCIATION_TYPES, () => {

    test(getAllAssociationTypes.REQUEST, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllAssociationTypes.request());
      expect(state.get('isFetchingAllAssociationTypes')).toEqual(true);
    });

    // TODO: test SUCCESS with variable size result
    test(getAllAssociationTypes.SUCCESS, () => {

      const response = [MOCK_ASSOCIATION_TYPE_JSON];
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllAssociationTypes.success(response));

      expect(state.get('associationTypes')).toEqual(
        Immutable.fromJS([MOCK_ASSOCIATION_TYPE_JSON])
      );

      expect(state.get('associationTypesById')).toEqual(
        Immutable.fromJS({ [MOCK_ASSOCIATION_TYPE_JSON.entityType.id]: 0 })
      );
    });

    test(getAllAssociationTypes.FAILURE, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllAssociationTypes.failure());
      expect(state.get('associationTypes')).toEqual(Immutable.List());
      expect(state.get('associationTypesById')).toEqual(Immutable.Map());
    });

    test(getAllAssociationTypes.FINALLY, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, getAllAssociationTypes.finally());
      expect(state.get('isFetchingAllAssociationTypes')).toEqual(false);
    });

  });

});
