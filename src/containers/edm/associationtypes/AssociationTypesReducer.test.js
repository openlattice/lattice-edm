/*
 *
 */

import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './AssociationTypesReducer';

import {
  MOCK_ASSOCIATION_TYPE,
  MOCK_ASSOCIATION_TYPE_JSON
} from '../../../utils/MockDataModels';

const {
  CREATE_ASSOCIATION_TYPE,
  DELETE_ASSOCIATION_TYPE,
  GET_ALL_ASSOCIATION_TYPES,
  createAssociationType,
  deleteAssociationType,
  getAllAssociationTypes
} = EntityDataModelApiActionFactory;

describe('AssociationTypesReducer', () => {

  const INITIAL_STATE :Map<*, *> = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Immutable.Map);
    expect(INITIAL_STATE.get('associationTypeIdToDelete')).toEqual('');
    expect(INITIAL_STATE.get('associationTypes')).toEqual(Immutable.List());
    expect(INITIAL_STATE.get('associationTypesById')).toEqual(Immutable.Map());
    expect(INITIAL_STATE.get('isCreatingNewAssociationType')).toEqual(false);
    expect(INITIAL_STATE.get('isFetchingAllAssociationTypes')).toEqual(false);
    expect(INITIAL_STATE.get('newlyCreatedAssociationTypeId')).toEqual('');
  });

  describe(CREATE_ASSOCIATION_TYPE, () => {

    test(createAssociationType.REQUEST, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, createAssociationType.request(MOCK_ASSOCIATION_TYPE));
      expect(state.get('isCreatingNewAssociationType')).toEqual(true);
      expect(state.get('newlyCreatedAssociationTypeId')).toEqual('');
      expect(state.get('tempAssociationType')).toEqual(MOCK_ASSOCIATION_TYPE);
    });

    test(createAssociationType.SUCCESS, () => {

      let state :Map<*, *> = reducer(INITIAL_STATE, createAssociationType.request(MOCK_ASSOCIATION_TYPE));
      state = reducer(state, createAssociationType.success(MOCK_ASSOCIATION_TYPE.entityType.id));
      expect(state.get('isCreatingNewAssociationType')).toEqual(true);
      expect(state.get('newlyCreatedAssociationTypeId')).toEqual(MOCK_ASSOCIATION_TYPE.entityType.id);

      const expectedAssociationType = MOCK_ASSOCIATION_TYPE.asImmutable();
      expect(state.get('associationTypes')).toEqual(
        Immutable.fromJS([expectedAssociationType])
      );

      expect(state.get('associationTypesById')).toEqual(
        Immutable.fromJS({ [MOCK_ASSOCIATION_TYPE.entityType.id]: 0 })
      );
    });

    test(createAssociationType.FAILURE, () => {
      // TODO: need to properly handle the failure case
      let state :Map<*, *> = reducer(INITIAL_STATE, createAssociationType.request(MOCK_ASSOCIATION_TYPE));
      state = reducer(state, createAssociationType.failure());
      expect(state.get('isCreatingNewAssociationType')).toEqual(true);
      expect(state.get('newlyCreatedAssociationTypeId')).toEqual('');
      expect(state.get('tempAssociationType')).toEqual(MOCK_ASSOCIATION_TYPE);
    });

    test(createAssociationType.FINALLY, () => {
      const state :Map<*, *> = reducer(INITIAL_STATE, createAssociationType.finally());
      expect(state.get('isCreatingNewAssociationType')).toEqual(false);
      expect(state.get('newlyCreatedAssociationTypeId')).toEqual('');
      expect(state.get('tempAssociationType')).toEqual(null);
    });

  });

  describe(DELETE_ASSOCIATION_TYPE, () => {

    test(deleteAssociationType.REQUEST, () => {
      const associationTypeId :string = MOCK_ASSOCIATION_TYPE.entityType.id;
      const state :Map<*, *> = reducer(INITIAL_STATE, deleteAssociationType.request(associationTypeId));
      expect(state.get('associationTypeIdToDelete')).toEqual(associationTypeId);
    });

    test(deleteAssociationType.SUCCESS, () => {

      const associationTypeId :string = MOCK_ASSOCIATION_TYPE.entityType.id;
      let state :Map<*, *> = INITIAL_STATE
        .set('associationTypes', Immutable.fromJS([MOCK_ASSOCIATION_TYPE.asImmutable()]))
        .set('associationTypesById', Immutable.fromJS({ [associationTypeId]: 0 }));

      state = reducer(state, deleteAssociationType.request(associationTypeId));
      state = reducer(state, deleteAssociationType.success());

      expect(state.get('associationTypeIdToDelete')).toEqual(associationTypeId);
      expect(state.get('associationTypes')).toEqual(Immutable.List());
      expect(state.get('associationTypesById')).toEqual(Immutable.Map());
    });

    test(deleteAssociationType.FAILURE, () => {
      const associationTypeId :string = MOCK_ASSOCIATION_TYPE.entityType.id;
      let state :Map<*, *> = reducer(INITIAL_STATE, deleteAssociationType.request(associationTypeId));
      state = reducer(state, deleteAssociationType.failure());
      expect(state.get('associationTypeIdToDelete')).toEqual(associationTypeId);
    });

    test(deleteAssociationType.FINALLY, () => {
      const associationTypeId :string = MOCK_ASSOCIATION_TYPE.entityType.id;
      let state :Map<*, *> = reducer(INITIAL_STATE, deleteAssociationType.request(associationTypeId));
      expect(state.get('associationTypeIdToDelete')).toEqual(associationTypeId);
      state = reducer(state, deleteAssociationType.finally());
      expect(state.get('associationTypeIdToDelete')).toEqual('');
    });

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
