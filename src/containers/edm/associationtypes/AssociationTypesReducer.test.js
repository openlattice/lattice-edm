/*
 *
 */

import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './AssociationTypesReducer';
import { randomId } from '../../../utils/Utils';

import {
  MOCK_ASSOCIATION_TYPE,
  MOCK_ASSOCIATION_TYPE_JSON
} from '../../../utils/MockDataModels';

const {
  CREATE_ASSOCIATION_TYPE,
  DELETE_ASSOCIATION_TYPE,
  GET_ALL_ASSOCIATION_TYPES,
  UPDATE_ASSOCIATION_TYPE_METADATA,
  createAssociationType,
  deleteAssociationType,
  getAllAssociationTypes,
  updateAssociationTypeMetaData
} = EntityDataModelApiActionFactory;

describe('AssociationTypesReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Immutable.Map);
    expect(INITIAL_STATE.get('associationTypes').toJS()).toEqual([]);
    expect(INITIAL_STATE.get('associationTypesById').toJS()).toEqual({});
    expect(INITIAL_STATE.get('isCreatingNewAssociationType')).toEqual(false);
    expect(INITIAL_STATE.get('isFetchingAllAssociationTypes')).toEqual(false);
    expect(INITIAL_STATE.get('newlyCreatedAssociationTypeId')).toEqual('');
    expect(INITIAL_STATE.get('actions').toJS()).toEqual({
      addDestinationEntityTypeToAssociationType: {},
      addSourceEntityTypeToAssociationType: {},
      createAssociationType: {},
      deleteAssociationType: {},
      removeDestinationEntityTypeFromAssociationType: {},
      removePropertyTypeFromEntityType: {},
      removeSourceEntityTypeFromAssociationType: {},
      updateAssociationTypeMetaData: {}
    });
  });

  describe(CREATE_ASSOCIATION_TYPE, () => {

    test(createAssociationType.REQUEST, () => {

      const { id } = createAssociationType();
      const state = reducer(INITIAL_STATE, createAssociationType.request(id, MOCK_ASSOCIATION_TYPE));

      expect(state.get('isCreatingNewAssociationType')).toEqual(true);
      expect(state.get('newlyCreatedAssociationTypeId')).toEqual('');
      expect(state.getIn(['actions', 'createAssociationType', id]).toJS())
        .toEqual({
          id,
          type: createAssociationType.REQUEST,
          value: MOCK_ASSOCIATION_TYPE
        });
    });

    test(createAssociationType.SUCCESS, () => {

      const { id } = createAssociationType();
      let state = reducer(INITIAL_STATE, createAssociationType.request(id, MOCK_ASSOCIATION_TYPE));
      state = reducer(state, createAssociationType.success(id, MOCK_ASSOCIATION_TYPE.entityType.id));

      expect(state.get('isCreatingNewAssociationType')).toEqual(true);
      expect(state.get('newlyCreatedAssociationTypeId')).toEqual(MOCK_ASSOCIATION_TYPE.entityType.id);
      expect(state.getIn(['actions', 'createAssociationType', id]).toJS())
        .toEqual({
          id,
          type: createAssociationType.REQUEST,
          value: MOCK_ASSOCIATION_TYPE
        });

      expect(state.get('associationTypes').toJS()).toEqual(
        [MOCK_ASSOCIATION_TYPE]
      );

      expect(state.get('associationTypesById').toJS()).toEqual(
        { [MOCK_ASSOCIATION_TYPE.entityType.id]: 0 }
      );
    });

    test(createAssociationType.FAILURE, () => {

      const { id } = createAssociationType();
      let state = reducer(INITIAL_STATE, createAssociationType.request(id, MOCK_ASSOCIATION_TYPE));
      state = reducer(state, createAssociationType.failure(id));

      expect(state.get('isCreatingNewAssociationType')).toEqual(true);
      expect(state.get('newlyCreatedAssociationTypeId')).toEqual('');
      expect(state.getIn(['actions', 'createAssociationType', id]).toJS())
        .toEqual({
          id,
          type: createAssociationType.REQUEST,
          value: MOCK_ASSOCIATION_TYPE
        });
    });

    test(createAssociationType.FINALLY, () => {

      const { id } = createAssociationType();
      let state = reducer(INITIAL_STATE, createAssociationType.request(id, MOCK_ASSOCIATION_TYPE));
      expect(state.getIn(['actions', 'createAssociationType', id]).toJS())
        .toEqual({
          id,
          type: createAssociationType.REQUEST,
          value: MOCK_ASSOCIATION_TYPE
        });

      state = reducer(state, createAssociationType.finally(id));
      expect(state.get('isCreatingNewAssociationType')).toEqual(false);
      expect(state.get('newlyCreatedAssociationTypeId')).toEqual('');
      expect(state.hasIn(['actions', 'createAssociationType', id])).toEqual(false);
    });

  });

  describe(DELETE_ASSOCIATION_TYPE, () => {

    test(deleteAssociationType.REQUEST, () => {

      const { id } = deleteAssociationType();
      const associationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;
      const state = reducer(INITIAL_STATE, deleteAssociationType.request(id, associationTypeId));

      expect(state.getIn(['actions', 'deleteAssociationType', id]).toJS())
        .toEqual({
          id,
          type: deleteAssociationType.REQUEST,
          value: associationTypeId
        });
    });

    test(deleteAssociationType.SUCCESS, () => {

      const { id } = deleteAssociationType();
      const associationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;

      let state = INITIAL_STATE
        .set('associationTypes', Immutable.fromJS([MOCK_ASSOCIATION_TYPE.asImmutable()]))
        .set('associationTypesById', Immutable.fromJS({ [associationTypeId]: 0 }));

      state = reducer(state, deleteAssociationType.request(id, associationTypeId));
      state = reducer(state, deleteAssociationType.success(id));

      expect(state.get('associationTypes').toJS()).toEqual([]);
      expect(state.get('associationTypesById').toJS()).toEqual({});

      expect(state.getIn(['actions', 'deleteAssociationType', id]).toJS())
        .toEqual({
          id,
          type: deleteAssociationType.REQUEST,
          value: associationTypeId
        });
    });

    test(deleteAssociationType.FAILURE, () => {

      const { id } = deleteAssociationType();
      const associationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;

      let state = reducer(INITIAL_STATE, deleteAssociationType.request(id, associationTypeId));
      state = reducer(state, deleteAssociationType.failure(id));

      expect(state.getIn(['actions', 'deleteAssociationType', id]).toJS())
        .toEqual({
          id,
          type: deleteAssociationType.REQUEST,
          value: associationTypeId
        });
    });

    test(deleteAssociationType.FINALLY, () => {

      const { id } = deleteAssociationType();
      const associationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;

      let state = reducer(INITIAL_STATE, deleteAssociationType.request(id, associationTypeId));
      expect(state.getIn(['actions', 'deleteAssociationType', id]).toJS())
        .toEqual({
          id,
          type: deleteAssociationType.REQUEST,
          value: associationTypeId
        });

      state = reducer(state, deleteAssociationType.finally(id));
      expect(state.hasIn(['actions', 'createAssociationType', id])).toEqual(false);
    });

  });

  describe(GET_ALL_ASSOCIATION_TYPES, () => {

    test(getAllAssociationTypes.REQUEST, () => {
      const { id } = getAllAssociationTypes();
      const state = reducer(INITIAL_STATE, getAllAssociationTypes.request(id));
      expect(state.get('isFetchingAllAssociationTypes')).toEqual(true);
    });

    // TODO: test SUCCESS with variable size result
    test(getAllAssociationTypes.SUCCESS, () => {

      const { id } = getAllAssociationTypes();
      const response = [MOCK_ASSOCIATION_TYPE_JSON];
      let state = reducer(INITIAL_STATE, getAllAssociationTypes.request(id));
      state = reducer(state, getAllAssociationTypes.success(id, response));

      expect(state.get('isFetchingAllAssociationTypes')).toEqual(true);

      expect(state.get('associationTypes').toJS()).toEqual(
        [MOCK_ASSOCIATION_TYPE_JSON]
      );

      expect(state.get('associationTypesById').toJS()).toEqual(
        { [MOCK_ASSOCIATION_TYPE_JSON.entityType.id]: 0 }
      );
    });

    test(getAllAssociationTypes.FAILURE, () => {

      const { id } = getAllAssociationTypes();
      let state = reducer(INITIAL_STATE, getAllAssociationTypes.request(id));
      state = reducer(state, getAllAssociationTypes.failure(id));

      expect(state.get('associationTypes').toJS()).toEqual([]);
      expect(state.get('associationTypesById').toJS()).toEqual({});
      expect(state.get('isFetchingAllAssociationTypes')).toEqual(true);
    });

    test(getAllAssociationTypes.FINALLY, () => {

      const { id } = getAllAssociationTypes();
      let state = reducer(INITIAL_STATE, getAllAssociationTypes.request(id));
      expect(state.get('isFetchingAllAssociationTypes')).toEqual(true);

      state = reducer(state, getAllAssociationTypes.finally(id));
      expect(state.get('isFetchingAllAssociationTypes')).toEqual(false);
    });

  });

  describe(UPDATE_ASSOCIATION_TYPE_METADATA, () => {

    // TODO: beforeEach()?
    // TODO: need tests for other metadata fields

    describe('title', () => {

      const associationTypeId = MOCK_ASSOCIATION_TYPE.entityType.id;
      const mockActionValue = {
        id: associationTypeId,
        metadata: {
          title: randomId()
        }
      };

      test(updateAssociationTypeMetaData.REQUEST, () => {

        const { id } = updateAssociationTypeMetaData();
        const seqAction = updateAssociationTypeMetaData.request(id, mockActionValue);
        const state = reducer(INITIAL_STATE, seqAction);

        expect(state.getIn(['actions', 'updateAssociationTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updateAssociationTypeMetaData.REQUEST,
            value: mockActionValue
          });
      });

      test(updateAssociationTypeMetaData.SUCCESS, () => {

        let state = INITIAL_STATE
          .set('associationTypes', Immutable.fromJS([MOCK_ASSOCIATION_TYPE.asImmutable()]))
          .set('associationTypesById', Immutable.fromJS({ [associationTypeId]: 0 }));

        const { id } = updateAssociationTypeMetaData();
        state = reducer(state, updateAssociationTypeMetaData.request(id, mockActionValue));
        state = reducer(state, updateAssociationTypeMetaData.success(id));

        const expectedAssociationType = MOCK_ASSOCIATION_TYPE
          .asImmutable()
          .setIn(['entityType', 'title'], mockActionValue.metadata.title);

        expect(state.get('associationTypes').toJS()).toEqual(
          [expectedAssociationType.toJS()]
        );

        expect(state.get('associationTypesById').toJS()).toEqual(
          { [associationTypeId]: 0 }
        );

        expect(state.getIn(['actions', 'updateAssociationTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updateAssociationTypeMetaData.REQUEST,
            value: mockActionValue
          });
      });

      test(updateAssociationTypeMetaData.FAILURE, () => {

        const { id } = updateAssociationTypeMetaData();
        let state = reducer(INITIAL_STATE, updateAssociationTypeMetaData.request(id, mockActionValue));
        state = reducer(state, updateAssociationTypeMetaData.failure(id));

        expect(state.getIn(['actions', 'updateAssociationTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updateAssociationTypeMetaData.REQUEST,
            value: mockActionValue
          });
      });

      test(updateAssociationTypeMetaData.FINALLY, () => {

        const { id } = updateAssociationTypeMetaData();
        let state = reducer(INITIAL_STATE, updateAssociationTypeMetaData.request(id, mockActionValue));
        expect(state.getIn(['actions', 'updateAssociationTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updateAssociationTypeMetaData.REQUEST,
            value: mockActionValue
          });

        state = reducer(state, updateAssociationTypeMetaData.finally(id));
        expect(state.hasIn(['actions', 'updateAssociationTypeMetaData', id])).toEqual(false);
      });

    });

  });

});
