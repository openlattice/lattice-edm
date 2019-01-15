import randomUUID from 'uuid/v4';
import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

import reducer from './PropertyTypesReducer';
import { randomStringId } from '../../../utils/Utils';
import {
  MOCK_PROPERTY_TYPE,
  // MOCK_SCHEMA_FQN,
} from '../../../utils/MockDataModels';

import {
  LOCAL_CREATE_PROPERTY_TYPE,
  LOCAL_DELETE_PROPERTY_TYPE,
  LOCAL_UPDATE_PROPERTY_TYPE_META,
  localCreatePropertyType,
  localDeletePropertyType,
  localUpdatePropertyTypeMeta,
} from './PropertyTypesActions';

const {
  FullyQualifiedName,
  PropertyTypeBuilder,
} = Models;

// const {
//   ActionTypes,
// } = Types;

const {
  GET_ENTITY_DATA_MODEL,
  // UPDATE_PROPERTY_TYPE_METADATA,
  // UPDATE_SCHEMA,
  getEntityDataModel,
  // updatePropertyTypeMetaData,
  // updateSchema,
} = EntityDataModelApiActions;

describe('PropertyTypesReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.toJS()).toEqual({
      [LOCAL_CREATE_PROPERTY_TYPE]: { error: false },
      [LOCAL_DELETE_PROPERTY_TYPE]: { error: false },
      [LOCAL_UPDATE_PROPERTY_TYPE_META]: { error: false },
      isCreatingNewPropertyType: false,
      isDeletingPropertyType: false,
      isFetchingAllPropertyTypes: false,
      isUpdatingPropertyTypeMeta: false,
      newlyCreatedPropertyTypeFQN: undefined,
      propertyTypes: [],
      propertyTypesIndexMap: {},
    });
  });

  describe(LOCAL_CREATE_PROPERTY_TYPE, () => {

    test(localCreatePropertyType.REQUEST, () => {

      const { id } = localCreatePropertyType();
      const requestAction = localCreatePropertyType.request(id, MOCK_PROPERTY_TYPE);
      const state = reducer(INITIAL_STATE, requestAction);

      expect(state.getIn([LOCAL_CREATE_PROPERTY_TYPE, id])).toEqual(requestAction);
      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toEqual(undefined);
    });

    test(localCreatePropertyType.SUCCESS, () => {

      const { id } = localCreatePropertyType();
      const requestAction = localCreatePropertyType.request(id, MOCK_PROPERTY_TYPE);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreatePropertyType.success(id, MOCK_PROPERTY_TYPE.id));

      expect(state.getIn([LOCAL_CREATE_PROPERTY_TYPE, id])).toEqual(requestAction);
      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toEqual(MOCK_PROPERTY_TYPE.type);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toBeInstanceOf(FullyQualifiedName);

      const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
      expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
      expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

      const expectedPropertyTypesIndexMap = Map()
        .set(MOCK_PROPERTY_TYPE.id, 0)
        .set(MOCK_PROPERTY_TYPE.type, 0);
      expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
      expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
      state.get('propertyTypesIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(localCreatePropertyType.FAILURE, () => {

      const { id } = localCreatePropertyType();
      const requestAction = localCreatePropertyType.request(id, MOCK_PROPERTY_TYPE);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localCreatePropertyType.failure(id));

      expect(state.getIn([LOCAL_CREATE_PROPERTY_TYPE, id])).toEqual(requestAction);
      expect(state.getIn([LOCAL_CREATE_PROPERTY_TYPE, 'error'])).toEqual(true);
      expect(state.get('isCreatingNewPropertyType')).toEqual(true);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toEqual(undefined);

      const expectedPropertyTypes = List();
      expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
      expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

      const expectedPropertyTypesIndexMap = Map();
      expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
      expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
    });

    test(localCreatePropertyType.FINALLY, () => {

      const { id } = localCreatePropertyType();
      let state = reducer(INITIAL_STATE, localCreatePropertyType.request(id, MOCK_PROPERTY_TYPE));
      state = reducer(state, localCreatePropertyType.success(id, MOCK_PROPERTY_TYPE.id));
      state = reducer(state, localCreatePropertyType.finally(id));
      expect(state.hasIn([LOCAL_CREATE_PROPERTY_TYPE, id])).toEqual(false);
      expect(state.get('isCreatingNewPropertyType')).toEqual(false);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toEqual(MOCK_PROPERTY_TYPE.type);
      expect(state.get('newlyCreatedPropertyTypeFQN')).toBeInstanceOf(FullyQualifiedName);
    });

  });

  describe(LOCAL_DELETE_PROPERTY_TYPE, () => {

    test(localDeletePropertyType.REQUEST, () => {

      const { id } = localDeletePropertyType();
      const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: MOCK_PROPERTY_TYPE.type });
      const state = reducer(INITIAL_STATE, requestAction);
      expect(state.getIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(requestAction);
      expect(state.get('isDeletingPropertyType')).toEqual(true);
    });

    describe(localDeletePropertyType.SUCCESS, () => {

      test('should delete PropertyType', () => {

        const initialState = INITIAL_STATE
          .setIn(['propertyTypes', 0], MOCK_PROPERTY_TYPE.toImmutable())
          .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.id], 0)
          .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.type], 0);

        const { id } = localDeletePropertyType();
        const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: MOCK_PROPERTY_TYPE.type });
        let state = reducer(initialState, requestAction);
        state = reducer(state, localDeletePropertyType.success(id));

        expect(state.getIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(requestAction);
        expect(state.get('isDeletingPropertyType')).toEqual(true);
        expect(state.get('propertyTypes').toJS()).toEqual([]);
        expect(state.get('propertyTypesIndexMap').toJS()).toEqual({});
      });

      test('should correctly update "propertyTypes" and "propertyTypesIndexMap"', () => {

        const mockPropertyType0 = new PropertyTypeBuilder()
          .setDataType('String')
          .setId(randomUUID())
          .setTitle('title')
          .setType(new FullyQualifiedName(randomStringId(), randomStringId()))
          .build();

        const mockPropertyType1 = new PropertyTypeBuilder()
          .setDataType('String')
          .setId(randomUUID())
          .setTitle('title')
          .setType(new FullyQualifiedName(randomStringId(), randomStringId()))
          .build();

        const mockPropertyType2 = new PropertyTypeBuilder()
          .setDataType('String')
          .setId(randomUUID())
          .setTitle('title')
          .setType(new FullyQualifiedName(randomStringId(), randomStringId()))
          .build();

        const initialState = INITIAL_STATE
          .setIn(['propertyTypes', 0], mockPropertyType0.toImmutable())
          .setIn(['propertyTypes', 1], mockPropertyType1.toImmutable())
          .setIn(['propertyTypes', 2], mockPropertyType2.toImmutable())
          .setIn(['propertyTypesIndexMap', mockPropertyType0.id], 0)
          .setIn(['propertyTypesIndexMap', mockPropertyType0.type], 0)
          .setIn(['propertyTypesIndexMap', mockPropertyType1.id], 1)
          .setIn(['propertyTypesIndexMap', mockPropertyType1.type], 1)
          .setIn(['propertyTypesIndexMap', mockPropertyType2.id], 2)
          .setIn(['propertyTypesIndexMap', mockPropertyType2.type], 2);

        const { id } = localDeletePropertyType();
        const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: mockPropertyType1.type });
        let state = reducer(initialState, requestAction);
        state = reducer(state, localDeletePropertyType.success(id));
        expect(state.getIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(requestAction);
        expect(state.get('isDeletingPropertyType')).toEqual(true);

        const expectedPropertyTypes = List()
          .push(mockPropertyType0.toImmutable())
          .push(mockPropertyType2.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(mockPropertyType0.id, 0)
          .set(mockPropertyType0.type, 0)
          .set(mockPropertyType2.id, 1)
          .set(mockPropertyType2.type, 1);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test('should not mutate state if attempting to delete a non-existent PropertyType', () => {

        const initialState = INITIAL_STATE
          .set('propertyTypes', fromJS([MOCK_PROPERTY_TYPE.toImmutable()]))
          .set('propertyTypesIndexMap', fromJS({ [MOCK_PROPERTY_TYPE.id]: 0, [MOCK_PROPERTY_TYPE.type]: 0 }));

        const { id } = localDeletePropertyType();
        const propertyTypeFQN = new FullyQualifiedName(randomStringId(), randomStringId());
        const stateAfterRequest = reducer(initialState, localDeletePropertyType.request(id, { propertyTypeFQN }));
        const stateAfterSuccess = reducer(stateAfterRequest, localDeletePropertyType.success(id));
        expect(stateAfterSuccess.toJS()).toEqual(stateAfterRequest.toJS());
      });

    });

    test(localDeletePropertyType.FAILURE, () => {

      const initialState = INITIAL_STATE
        .set('propertyTypes', fromJS([MOCK_PROPERTY_TYPE.toImmutable()]))
        .set('propertyTypesIndexMap', fromJS({ [MOCK_PROPERTY_TYPE.id]: 0, [MOCK_PROPERTY_TYPE.type]: 0 }));

      const { id } = localDeletePropertyType();
      const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: MOCK_PROPERTY_TYPE.type });
      let state = reducer(initialState, requestAction);
      state = reducer(state, localDeletePropertyType.failure(id));

      expect(state.getIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(requestAction);
      expect(state.get('isDeletingPropertyType')).toEqual(true);
      expect(state.get('propertyTypes').toJS()).toEqual(initialState.get('propertyTypes').toJS());
      expect(state.get('propertyTypesIndexMap').toJS()).toEqual(initialState.get('propertyTypesIndexMap').toJS());
    });

    test(localDeletePropertyType.FINALLY, () => {

      const { id } = localDeletePropertyType();
      const requestAction = localDeletePropertyType.request(id, { propertyTypeFQN: MOCK_PROPERTY_TYPE.type });
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, localDeletePropertyType.success(id));
      state = reducer(state, localDeletePropertyType.finally(id));
      expect(state.hasIn([LOCAL_DELETE_PROPERTY_TYPE, id])).toEqual(false);
      expect(state.get('isDeletingPropertyType')).toEqual(false);
    });

  });

  describe(LOCAL_UPDATE_PROPERTY_TYPE_META, () => {

    const initialState = INITIAL_STATE
      .setIn(['propertyTypes', 0], MOCK_PROPERTY_TYPE.toImmutable())
      .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.id], 0)
      .setIn(['propertyTypesIndexMap', MOCK_PROPERTY_TYPE.type], 0);

    describe('description', () => {

      const mockActionValue = {
        metadata: { description: randomStringId() },
        propertyTypeId: MOCK_PROPERTY_TYPE.id,
        propertyTypeFQN: MOCK_PROPERTY_TYPE.type,
      };

      test(localUpdatePropertyTypeMeta.REQUEST, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(true);
      });

      test(localUpdatePropertyTypeMeta.SUCCESS, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(true);

        const expectedPropertyTypes = List().push(
          MOCK_PROPERTY_TYPE.toImmutable().set('description', mockActionValue.metadata.description)
        );
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FAILURE, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(true);

        const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FINALLY, () => {

        const { id } = localUpdatePropertyTypeMeta();
        let state = reducer(initialState, localUpdatePropertyTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        state = reducer(state, localUpdatePropertyTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(false);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(false);
      });

    });

    describe('title', () => {

      const mockActionValue = {
        metadata: { title: randomStringId() },
        propertyTypeId: MOCK_PROPERTY_TYPE.id,
        propertyTypeFQN: MOCK_PROPERTY_TYPE.type,
      };

      test(localUpdatePropertyTypeMeta.REQUEST, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(true);
      });

      test(localUpdatePropertyTypeMeta.SUCCESS, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(true);

        const expectedPropertyTypes = List().push(
          MOCK_PROPERTY_TYPE.toImmutable().set('title', mockActionValue.metadata.title)
        );
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FAILURE, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(true);

        const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FINALLY, () => {

        const { id } = localUpdatePropertyTypeMeta();
        let state = reducer(initialState, localUpdatePropertyTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        state = reducer(state, localUpdatePropertyTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(false);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(false);
      });

    });

    describe('type', () => {

      const mockActionValue = {
        metadata: { type: new FullyQualifiedName(randomStringId(), randomStringId()) },
        propertyTypeId: MOCK_PROPERTY_TYPE.id,
        propertyTypeFQN: MOCK_PROPERTY_TYPE.type,
      };

      test(localUpdatePropertyTypeMeta.REQUEST, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        const state = reducer(initialState, requestAction);
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(true);
      });

      test(localUpdatePropertyTypeMeta.SUCCESS, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(true);

        const expectedPropertyTypes = List().push(
          MOCK_PROPERTY_TYPE.toImmutable().set('type', fromJS(mockActionValue.metadata.type.toObject()))
        );
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(mockActionValue.metadata.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FAILURE, () => {

        const { id } = localUpdatePropertyTypeMeta();
        const requestAction = localUpdatePropertyTypeMeta.request(id, mockActionValue);
        let state = reducer(initialState, requestAction);
        state = reducer(state, localUpdatePropertyTypeMeta.failure(id));
        expect(state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(requestAction);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(true);

        const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
        expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
        expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

        const expectedPropertyTypesIndexMap = Map()
          .set(MOCK_PROPERTY_TYPE.id, 0)
          .set(MOCK_PROPERTY_TYPE.type, 0);
        expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
        expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
        state.get('propertyTypesIndexMap')
          .filter((v, k) => FullyQualifiedName.isValid(k))
          .keySeq()
          .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
      });

      test(localUpdatePropertyTypeMeta.FINALLY, () => {

        const { id } = localUpdatePropertyTypeMeta();
        let state = reducer(initialState, localUpdatePropertyTypeMeta.request(id, mockActionValue));
        state = reducer(state, localUpdatePropertyTypeMeta.success(id));
        state = reducer(state, localUpdatePropertyTypeMeta.finally(id));
        expect(state.hasIn([LOCAL_UPDATE_PROPERTY_TYPE_META, id])).toEqual(false);
        expect(state.get('isUpdatingPropertyTypeMeta')).toEqual(false);
      });

    });

  });

  describe(GET_ENTITY_DATA_MODEL, () => {

    test(getEntityDataModel.REQUEST, () => {

      const { id } = getEntityDataModel();
      const state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(true);
    });

    // TODO: test SUCCESS with variable size result
    test(getEntityDataModel.SUCCESS, () => {

      const { id } = getEntityDataModel();
      const response = { propertyTypes: [MOCK_PROPERTY_TYPE.toObject()] };
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.success(id, response));
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(true);

      const expectedPropertyTypes = List().push(MOCK_PROPERTY_TYPE.toImmutable());
      expect(state.get('propertyTypes').hashCode()).toEqual(expectedPropertyTypes.hashCode());
      expect(state.get('propertyTypes').equals(expectedPropertyTypes)).toEqual(true);

      const expectedPropertyTypesIndexMap = Map()
        .set(MOCK_PROPERTY_TYPE.id, 0)
        .set(MOCK_PROPERTY_TYPE.type, 0);
      expect(state.get('propertyTypesIndexMap').hashCode()).toEqual(expectedPropertyTypesIndexMap.hashCode());
      expect(state.get('propertyTypesIndexMap').equals(expectedPropertyTypesIndexMap)).toEqual(true);
      state.get('propertyTypesIndexMap')
        .filter((v, k) => FullyQualifiedName.isValid(k))
        .keySeq()
        .forEach(k => expect(k).toBeInstanceOf(FullyQualifiedName));
    });

    test(getEntityDataModel.FAILURE, () => {

      const { id } = getEntityDataModel();
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      state = reducer(state, getEntityDataModel.failure(id));

      expect(state.get('isFetchingAllPropertyTypes')).toEqual(true);
      expect(state.get('propertyTypes').toJS()).toEqual([]);
      expect(state.get('propertyTypesIndexMap').toJS()).toEqual({});
    });

    test(getEntityDataModel.FINALLY, () => {

      const { id } = getEntityDataModel();
      let state = reducer(INITIAL_STATE, getEntityDataModel.request(id));
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(true);

      state = reducer(state, getEntityDataModel.finally(id));
      expect(state.get('isFetchingAllPropertyTypes')).toEqual(false);
    });

  });

});
