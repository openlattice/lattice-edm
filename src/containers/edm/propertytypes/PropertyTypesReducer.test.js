import randomUUID from 'uuid/v4';
import { List, Map, fromJS } from 'immutable';
import { Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

import reducer from './PropertyTypesReducer';
import { randomId } from '../../../utils/Utils';

import {
  MOCK_PROPERTY_TYPE,
  MOCK_PROPERTY_TYPE_JSON,
  MOCK_SCHEMA_FQN,
} from '../../../utils/MockDataModels';

const {
  ActionTypes,
} = Types;

const {
  CREATE_PROPERTY_TYPE,
  DELETE_PROPERTY_TYPE,
  GET_ALL_PROPERTY_TYPES,
  UPDATE_PROPERTY_TYPE_METADATA,
  UPDATE_SCHEMA,
  createPropertyType,
  deletePropertyType,
  getAllPropertyTypes,
  updatePropertyTypeMetaData,
  updateSchema,
} = EntityDataModelApiActions;

describe('PropertyTypesReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.get('isCreatingNewPropertyType')).toEqual(false);
    expect(INITIAL_STATE.get('isFetchingAllPropertyTypes')).toEqual(false);
    expect(INITIAL_STATE.get('newlyCreatedPropertyTypeId')).toEqual('');
    expect(INITIAL_STATE.get('propertyTypes').toJS()).toEqual([]);
    expect(INITIAL_STATE.get('propertyTypesById').toJS()).toEqual({});
    expect(INITIAL_STATE.get('actions').toJS()).toEqual({
      createPropertyType: {},
      deletePropertyType: {},
      updatePropertyTypeMetaData: {},
      updateSchema: {},
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

    describe(deletePropertyType.SUCCESS, () => {

      test('should delete PropertyType', () => {

        // yes, this is not a valid PropertyType, but the reducer only cares about the id
        const mockPropertyType = { id: randomUUID() };

        let state = INITIAL_STATE
          .set('propertyTypes', fromJS([mockPropertyType]))
          .set('propertyTypesById', fromJS({ [mockPropertyType.id]: 0 }));

        const { id } = deletePropertyType();
        state = reducer(state, deletePropertyType.request(id, mockPropertyType.id));
        state = reducer(state, deletePropertyType.success(id));

        expect(state.get('propertyTypes').toJS()).toEqual([]);
        expect(state.get('propertyTypesById').toJS()).toEqual({});
        expect(state.getIn(['actions', 'deletePropertyType', id]).toJS())
          .toEqual({
            id,
            type: deletePropertyType.REQUEST,
            value: mockPropertyType.id
          });
      });

      test('should correctly update "propertyTypes" and "propertyTypesById"', () => {

        // yes, this is not a valid PropertyType, but the reducer only cares about the id
        const mockPropertyType1 = { id: randomUUID() };
        const mockPropertyType2 = { id: randomUUID() };
        const mockPropertyType3 = { id: randomUUID() };

        let state = INITIAL_STATE
          .set('propertyTypes', fromJS([
            mockPropertyType1,
            mockPropertyType2,
            mockPropertyType3
          ]))
          .set('propertyTypesById', fromJS({
            [mockPropertyType1.id]: 0,
            [mockPropertyType2.id]: 1,
            [mockPropertyType3.id]: 2
          }));

        const { id } = deletePropertyType();
        state = reducer(state, deletePropertyType.request(id, mockPropertyType2.id));
        state = reducer(state, deletePropertyType.success(id));

        expect(state.get('propertyTypes').toJS()).toEqual([
          mockPropertyType1,
          mockPropertyType3
        ]);
        expect(state.get('propertyTypesById').toJS()).toEqual({
          [mockPropertyType1.id]: 0,
          [mockPropertyType3.id]: 1
        });
      });

      test('should not mutate state if attempting to delete a non-existent PropertyType', () => {

        // yes, this is not a valid PropertyType, but the reducer only cares about the id
        const mockPropertyType = { id: randomUUID() };

        const initialState = INITIAL_STATE
          .set('propertyTypes', fromJS([mockPropertyType]))
          .set('propertyTypesById', fromJS({ [mockPropertyType.id]: 0 }));

        const { id } = deletePropertyType();
        const stateAfterRequest = reducer(initialState, deletePropertyType.request(id, randomUUID()));
        const stateAfterSuccess = reducer(stateAfterRequest, deletePropertyType.success(id));
        expect(stateAfterSuccess.toJS()).toEqual(stateAfterRequest.toJS());
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
        propertyTypeId,
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
          .set('propertyTypes', fromJS([MOCK_PROPERTY_TYPE.asImmutable()]))
          .set('propertyTypesById', fromJS({ [propertyTypeId]: 0 }));

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

  describe(UPDATE_SCHEMA, () => {

    describe(`${ActionTypes.ADD}`, () => {

      const mockPropertyTypeId = MOCK_PROPERTY_TYPE.id;
      const mockActionValue = {
        action: ActionTypes.ADD,
        propertyTypeIds: [mockPropertyTypeId],
        schemaFqn: MOCK_SCHEMA_FQN,
      };

      test(updateSchema.REQUEST, () => {

        const { id } = updateSchema();
        const seqAction = updateSchema.request(id, mockActionValue);
        const state = reducer(INITIAL_STATE, seqAction);

        expect(state.getIn(['actions', 'updateSchema', id]).toJS())
          .toEqual({
            id,
            type: updateSchema.REQUEST,
            value: mockActionValue,
          });
      });

      test(updateSchema.SUCCESS, () => {

        const mockPropertyType = MOCK_PROPERTY_TYPE
          .asImmutable()
          .set('schemas', List());

        let state = INITIAL_STATE
          .set('propertyTypes', fromJS([mockPropertyType]))
          .set('propertyTypesById', fromJS({ [mockPropertyTypeId]: 0 }));

        const { id } = updateSchema();
        state = reducer(state, updateSchema.request(id, mockActionValue));
        state = reducer(state, updateSchema.success(id));

        const expectedPropertyType = MOCK_PROPERTY_TYPE
          .asImmutable()
          .set('schemas', List([MOCK_SCHEMA_FQN]));

        expect(state.get('propertyTypes').toJS()).toEqual(
          [expectedPropertyType.toJS()]
        );

        expect(state.get('propertyTypesById').toJS()).toEqual(
          { [mockPropertyTypeId]: 0 }
        );

        expect(state.getIn(['actions', 'updateSchema', id]).toJS())
          .toEqual({
            id,
            type: updateSchema.REQUEST,
            value: mockActionValue,
          });
      });

      test(updateSchema.FAILURE, () => {

        let state = INITIAL_STATE
          .set('propertyTypes', fromJS([MOCK_PROPERTY_TYPE.asImmutable()]))
          .set('propertyTypesById', fromJS({ [mockPropertyTypeId]: 0 }));

        const { id } = updateSchema();
        state = reducer(state, updateSchema.request(id, mockActionValue));
        state = reducer(state, updateSchema.failure(id));

        expect(state.get('propertyTypes').toJS()).toEqual(
          [MOCK_PROPERTY_TYPE]
        );

        expect(state.get('propertyTypesById').toJS()).toEqual(
          { [mockPropertyTypeId]: 0 }
        );

        expect(state.getIn(['actions', 'updateSchema', id]).toJS())
          .toEqual({
            id,
            type: updateSchema.REQUEST,
            value: mockActionValue,
          });
      });

      test(updateSchema.FINALLY, () => {

        const { id } = updateSchema();
        let state = reducer(INITIAL_STATE, updateSchema.request(id, mockActionValue));
        expect(state.getIn(['actions', 'updateSchema', id]).toJS())
          .toEqual({
            id,
            type: updateSchema.REQUEST,
            value: mockActionValue,
          });

        state = reducer(state, updateSchema.finally(id));
        expect(state.hasIn(['actions', 'updateSchema', id])).toEqual(false);
      });

    });

    describe(`${ActionTypes.REMOVE}`, () => {

      const mockPropertyTypeId = MOCK_PROPERTY_TYPE.id;
      const mockActionValue = {
        action: ActionTypes.REMOVE,
        propertyTypeIds: [mockPropertyTypeId],
        schemaFqn: MOCK_SCHEMA_FQN,
      };

      test(updateSchema.REQUEST, () => {

        const { id } = updateSchema();
        const seqAction = updateSchema.request(id, mockActionValue);
        const state = reducer(INITIAL_STATE, seqAction);

        expect(state.getIn(['actions', 'updateSchema', id]).toJS())
          .toEqual({
            id,
            type: updateSchema.REQUEST,
            value: mockActionValue,
          });
      });

      test(updateSchema.SUCCESS, () => {

        let state = INITIAL_STATE
          .set('propertyTypes', fromJS([MOCK_PROPERTY_TYPE.asImmutable()]))
          .set('propertyTypesById', fromJS({ [mockPropertyTypeId]: 0 }));

        const { id } = updateSchema();
        state = reducer(state, updateSchema.request(id, mockActionValue));
        state = reducer(state, updateSchema.success(id));

        const expectedPropertyType = MOCK_PROPERTY_TYPE
          .asImmutable()
          .set('schemas', List());

        expect(state.get('propertyTypes').toJS()).toEqual(
          [expectedPropertyType.toJS()]
        );

        expect(state.get('propertyTypesById').toJS()).toEqual(
          { [mockPropertyTypeId]: 0 }
        );

        expect(state.getIn(['actions', 'updateSchema', id]).toJS())
          .toEqual({
            id,
            type: updateSchema.REQUEST,
            value: mockActionValue,
          });
      });

      test(updateSchema.FAILURE, () => {

        let state = INITIAL_STATE
          .set('propertyTypes', fromJS([MOCK_PROPERTY_TYPE.asImmutable()]))
          .set('propertyTypesById', fromJS({ [mockPropertyTypeId]: 0 }));

        const { id } = updateSchema();
        state = reducer(state, updateSchema.request(id, mockActionValue));
        state = reducer(state, updateSchema.failure(id));

        expect(state.get('propertyTypes').toJS()).toEqual(
          [MOCK_PROPERTY_TYPE]
        );

        expect(state.get('propertyTypesById').toJS()).toEqual(
          { [mockPropertyTypeId]: 0 }
        );

        expect(state.getIn(['actions', 'updateSchema', id]).toJS())
          .toEqual({
            id,
            type: updateSchema.REQUEST,
            value: mockActionValue,
          });
      });

      test(updateSchema.FINALLY, () => {

        const { id } = updateSchema();
        let state = reducer(INITIAL_STATE, updateSchema.request(id, mockActionValue));
        expect(state.getIn(['actions', 'updateSchema', id]).toJS())
          .toEqual({
            id,
            type: updateSchema.REQUEST,
            value: mockActionValue,
          });

        state = reducer(state, updateSchema.finally(id));
        expect(state.hasIn(['actions', 'updateSchema', id])).toEqual(false);
      });


    });

  });

});
