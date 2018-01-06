/*
 *
 */

import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

import reducer from './PropertyTypesReducer';
import { randomId } from '../../../utils/Utils';

import {
  MOCK_PROPERTY_TYPE,
  MOCK_PROPERTY_TYPE_JSON
} from '../../../utils/MockDataModels';

const {
  CREATE_PROPERTY_TYPE,
  DELETE_PROPERTY_TYPE,
  GET_ALL_PROPERTY_TYPES,
  UPDATE_PROPERTY_TYPE_METADATA,
  createPropertyType,
  deletePropertyType,
  getAllPropertyTypes,
  updatePropertyTypeMetaData
} = EntityDataModelApiActionFactory;

describe('PropertyTypesReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Immutable.Map);
    expect(INITIAL_STATE.get('isCreatingNewPropertyType')).toEqual(false);
    expect(INITIAL_STATE.get('isFetchingAllPropertyTypes')).toEqual(false);
    expect(INITIAL_STATE.get('newlyCreatedPropertyTypeId')).toEqual('');
    expect(INITIAL_STATE.get('propertyTypes').toJS()).toEqual([]);
    expect(INITIAL_STATE.get('propertyTypesById').toJS()).toEqual({});
    expect(INITIAL_STATE.get('actions').toJS()).toEqual({
      createPropertyType: {},
      deletePropertyType: {},
      updatePropertyTypeMetaData: {}
    });
  });

  describe(CREATE_PROPERTY_TYPE, () => {

    test(createPropertyType.REQUEST, () => {

      const { id } = createPropertyType();
      const state = reducer(INITIAL_STATE, createPropertyType.request(id, MOCK_PROPERTY_TYPE));

      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeId')).toEqual('');
      expect(state.getIn(['actions', 'createPropertyType', id]).toJS())
        .toEqual({
          id,
          type: createPropertyType.REQUEST,
          value: MOCK_PROPERTY_TYPE
        });
    });

    test(createPropertyType.SUCCESS, () => {

      const { id } = createPropertyType();
      const propertyTypeId = MOCK_PROPERTY_TYPE.id;
      let state = reducer(INITIAL_STATE, createPropertyType.request(id, MOCK_PROPERTY_TYPE));
      state = reducer(state, createPropertyType.success(id, propertyTypeId));

      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeId')).toEqual(propertyTypeId);
      expect(state.getIn(['actions', 'createPropertyType', id]).toJS())
        .toEqual({
          id,
          type: createPropertyType.REQUEST,
          value: MOCK_PROPERTY_TYPE
        });

      expect(state.get('propertyTypes').toJS()).toEqual(
        [MOCK_PROPERTY_TYPE]
      );

      expect(state.get('propertyTypesById').toJS()).toEqual(
        { [propertyTypeId]: 0 }
      );
    });

    test(createPropertyType.FAILURE, () => {

      const { id } = createPropertyType();
      let state = reducer(INITIAL_STATE, createPropertyType.request(id, MOCK_PROPERTY_TYPE));
      state = reducer(state, createPropertyType.failure(id));

      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeId')).toEqual('');
      expect(state.getIn(['actions', 'createPropertyType', id]).toJS())
        .toEqual({
          id,
          type: createPropertyType.REQUEST,
          value: MOCK_PROPERTY_TYPE
        });
    });

    test(createPropertyType.FINALLY, () => {

      const { id } = createPropertyType();
      let state = reducer(INITIAL_STATE, createPropertyType.request(id, MOCK_PROPERTY_TYPE));
      expect(state.getIn(['actions', 'createPropertyType', id]).toJS())
        .toEqual({
          id,
          type: createPropertyType.REQUEST,
          value: MOCK_PROPERTY_TYPE
        });

      state = reducer(state, createPropertyType.finally(id));
      expect(state.get('isCreatingNewPropertyType')).toEqual(false);
      expect(state.get('newlyCreatedPropertyTypeId')).toEqual('');
      expect(state.hasIn(['actions', 'createPropertyType', id])).toEqual(false);
    });

  });

  describe(DELETE_PROPERTY_TYPE, () => {

    test(deletePropertyType.REQUEST, () => {

      const { id } = deletePropertyType();
      const propertyTypeId = MOCK_PROPERTY_TYPE.id;
      const state = reducer(INITIAL_STATE, deletePropertyType.request(id, propertyTypeId));

      expect(state.getIn(['actions', 'deletePropertyType', id]).toJS())
        .toEqual({
          id,
          type: deletePropertyType.REQUEST,
          value: propertyTypeId
        });
    });

    test(deletePropertyType.SUCCESS, () => {

      const { id } = deletePropertyType();
      const propertyTypeId = MOCK_PROPERTY_TYPE.id;

      let state = INITIAL_STATE
        .set('propertyTypes', Immutable.fromJS([MOCK_PROPERTY_TYPE.asImmutable()]))
        .set('propertyTypesById', Immutable.fromJS({ [propertyTypeId]: 0 }));

      state = reducer(state, deletePropertyType.request(id, propertyTypeId));
      state = reducer(state, deletePropertyType.success(id));

      expect(state.get('propertyTypes').toJS()).toEqual([]);
      expect(state.get('propertyTypesById').toJS()).toEqual({});

      expect(state.getIn(['actions', 'deletePropertyType', id]).toJS())
        .toEqual({
          id,
          type: deletePropertyType.REQUEST,
          value: propertyTypeId
        });
    });

    test(deletePropertyType.FAILURE, () => {

      const { id } = deletePropertyType();
      const propertyTypeId = MOCK_PROPERTY_TYPE.id;

      let state = reducer(INITIAL_STATE, deletePropertyType.request(id, propertyTypeId));
      state = reducer(state, deletePropertyType.failure(id));

      expect(state.getIn(['actions', 'deletePropertyType', id]).toJS())
        .toEqual({
          id,
          type: deletePropertyType.REQUEST,
          value: propertyTypeId
        });
    });

    test(deletePropertyType.FINALLY, () => {

      const { id } = deletePropertyType();
      const propertyTypeId = MOCK_PROPERTY_TYPE.id;

      let state = reducer(INITIAL_STATE, deletePropertyType.request(id, propertyTypeId));
      expect(state.getIn(['actions', 'deletePropertyType', id]).toJS())
        .toEqual({
          id,
          type: deletePropertyType.REQUEST,
          value: propertyTypeId
        });

      state = reducer(state, deletePropertyType.finally(id));
      expect(state.hasIn(['actions', 'deletePropertyType', id])).toEqual(false);
    });

  });

  describe(GET_ALL_PROPERTY_TYPES, () => {

    test(getAllPropertyTypes.REQUEST, () => {
      const { id } = getAllPropertyTypes();
      const state = reducer(INITIAL_STATE, getAllPropertyTypes.request(id));
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(true);
    });

    // TODO: test SUCCESS with variable size result
    test(getAllPropertyTypes.SUCCESS, () => {

      const { id } = getAllPropertyTypes();
      const response = [MOCK_PROPERTY_TYPE_JSON];

      let state = reducer(INITIAL_STATE, getAllPropertyTypes.request(id));
      state = reducer(state, getAllPropertyTypes.success(id, response));

      expect(state.get('isFetchingAllPropertyTypes')).toEqual(true);

      expect(state.get('propertyTypes').toJS()).toEqual(
        [MOCK_PROPERTY_TYPE_JSON]
      );

      expect(state.get('propertyTypesById').toJS()).toEqual(
        { [MOCK_PROPERTY_TYPE_JSON.id]: 0 }
      );
    });

    test(getAllPropertyTypes.FAILURE, () => {

      const { id } = getAllPropertyTypes();
      let state = reducer(INITIAL_STATE, getAllPropertyTypes.request(id));
      state = reducer(state, getAllPropertyTypes.failure(id));

      expect(state.get('propertyTypes').toJS()).toEqual([]);
      expect(state.get('propertyTypesById').toJS()).toEqual({});
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(true);
    });

    test(getAllPropertyTypes.FINALLY, () => {

      const { id } = getAllPropertyTypes();
      let state = reducer(INITIAL_STATE, getAllPropertyTypes.request(id));
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(true);

      state = reducer(state, getAllPropertyTypes.finally(id));
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(false);
    });

  });

  describe(UPDATE_PROPERTY_TYPE_METADATA, () => {

    // TODO: beforeEach()?
    // TODO: need tests for other metadata fields

    describe('title', () => {

      const propertyTypeId = MOCK_PROPERTY_TYPE.id;
      const mockActionValue = {
        id: propertyTypeId,
        metadata: {
          title: randomId()
        }
      };

      test(updatePropertyTypeMetaData.REQUEST, () => {

        const { id } = updatePropertyTypeMetaData();
        const seqAction = updatePropertyTypeMetaData.request(id, mockActionValue);
        const state = reducer(INITIAL_STATE, seqAction);

        expect(state.getIn(['actions', 'updatePropertyTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updatePropertyTypeMetaData.REQUEST,
            value: mockActionValue
          });
      });

      test(updatePropertyTypeMetaData.SUCCESS, () => {

        let state = INITIAL_STATE
          .set('propertyTypes', Immutable.fromJS([MOCK_PROPERTY_TYPE.asImmutable()]))
          .set('propertyTypesById', Immutable.fromJS({ [propertyTypeId]: 0 }));

        const { id } = updatePropertyTypeMetaData();
        state = reducer(state, updatePropertyTypeMetaData.request(id, mockActionValue));
        state = reducer(state, updatePropertyTypeMetaData.success(id));

        const expectedPropertyType = MOCK_PROPERTY_TYPE
          .asImmutable()
          .set('title', mockActionValue.metadata.title);

        expect(state.get('propertyTypes').toJS()).toEqual(
          [expectedPropertyType.toJS()]
        );

        expect(state.get('propertyTypesById').toJS()).toEqual(
          { [propertyTypeId]: 0 }
        );

        expect(state.getIn(['actions', 'updatePropertyTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updatePropertyTypeMetaData.REQUEST,
            value: mockActionValue
          });
      });

      test(updatePropertyTypeMetaData.FAILURE, () => {

        const { id } = updatePropertyTypeMetaData();
        let state = reducer(INITIAL_STATE, updatePropertyTypeMetaData.request(id, mockActionValue));
        state = reducer(state, updatePropertyTypeMetaData.failure(id));

        expect(state.getIn(['actions', 'updatePropertyTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updatePropertyTypeMetaData.REQUEST,
            value: mockActionValue
          });
      });

      test(updatePropertyTypeMetaData.FINALLY, () => {

        const { id } = updatePropertyTypeMetaData();
        let state = reducer(INITIAL_STATE, updatePropertyTypeMetaData.request(id, mockActionValue));
        expect(state.getIn(['actions', 'updatePropertyTypeMetaData', id]).toJS())
          .toEqual({
            id,
            type: updatePropertyTypeMetaData.REQUEST,
            value: mockActionValue
          });

        state = reducer(state, updatePropertyTypeMetaData.finally(id));
        expect(state.hasIn(['actions', 'updatePropertyTypeMetaData', id])).toEqual(false);
      });

    });

  });

});
