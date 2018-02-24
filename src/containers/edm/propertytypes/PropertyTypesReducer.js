/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';

const {
  createPropertyType,
  deletePropertyType,
  getAllPropertyTypes,
  updatePropertyTypeMetaData
} = EntityDataModelApiActionFactory;

const {
  PropertyType,
  PropertyTypeBuilder
} = Models;

const INITIAL_STATE :Map<*, *> = fromJS({
  actions: {
    createPropertyType: Map(),
    deletePropertyType: Map(),
    updatePropertyTypeMetaData: Map()
  },
  isCreatingNewPropertyType: false,
  isFetchingAllPropertyTypes: false,
  newlyCreatedPropertyTypeId: '',
  propertyTypes: List(),
  propertyTypesById: Map()
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case createPropertyType.case(action.type): {
      return createPropertyType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewPropertyType', true)
            .set('newlyCreatedPropertyTypeId', '')
            .setIn(['actions', 'createPropertyType', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'createPropertyType', seqAction.id], Map());

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const newPropertyTypeId :string = seqAction.value;
          const tempPropertyType :PropertyType = storedSeqAction.get('value');

          const newPropertyType :PropertyType = new PropertyTypeBuilder()
            .setId(newPropertyTypeId)
            .setType(tempPropertyType.type)
            .setTitle(tempPropertyType.title)
            .setDescription(tempPropertyType.description)
            .setDataType(tempPropertyType.datatype)
            .setPii(tempPropertyType.piiField)
            .setAnalyzer(tempPropertyType.analyzer)
            .setSchemas(tempPropertyType.schemas)
            .build();

          const iPropertyType :Map<*, *> = newPropertyType.asImmutable();
          const current :List<Map<*, *>> = state.get('propertyTypes', List());
          const updated :List<Map<*, *>> = current.push(iPropertyType);

          const currentById :Map<string, number> = state.get('propertyTypesById', Map());
          const updatedById :Map<string, number> = currentById.set(newPropertyTypeId, updated.size - 1);

          return state
            .set('newlyCreatedPropertyTypeId', newPropertyTypeId)
            .set('propertyTypes', updated)
            .set('propertyTypesById', updatedById);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewPropertyType', false)
            .set('newlyCreatedPropertyTypeId', '')
            .deleteIn(['actions', 'createPropertyType', seqAction.id]);
        }
      });
    }

    case deletePropertyType.case(action.type): {
      return deletePropertyType.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'deletePropertyType', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'deletePropertyType', seqAction.id], Map());

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const propertyTypeId :string = storedSeqAction.get('value');
          const propertyTypeIndex :number = state.getIn(['propertyTypesById', propertyTypeId], -1);

          if (propertyTypeIndex === -1) {
            return state;
          }

          const current :List<Map<*, *>> = state.get('propertyTypes', List());
          const updated :List<Map<*, *>> = current.delete(propertyTypeIndex);

          // !!! BUG !!! - need to update id -> index mapping
          // TODO: fix bug
          const currentById :Map<string, number> = state.get('propertyTypesById', Map());
          const updatedById :Map<string, number> = currentById.delete(propertyTypeId);

          return state
            .set('propertyTypes', updated)
            .set('propertyTypesById', updatedById);
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'deletePropertyType', seqAction.id]);
        }
      });
    }

    case getAllPropertyTypes.case(action.type): {
      return getAllPropertyTypes.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingAllPropertyTypes', true);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const propertyTypes :List<Map<*, *>> = fromJS(seqAction.value);
          const propertyTypesById :Map<string, number> = Map()
            .withMutations((byIdMap :Map<string, number>) => {
              propertyTypes.forEach((propertyType :Map<*, *>, propertyTypeIndex :number) => {
                byIdMap.set(propertyType.get('id'), propertyTypeIndex);
              });
            });
          return state
            .set('propertyTypes', propertyTypes)
            .set('propertyTypesById', propertyTypesById);
        },
        FAILURE: () => {
          return state
            .set('propertyTypes', List())
            .set('propertyTypesById', Map());
        },
        FINALLY: () => {
          return state.set('isFetchingAllPropertyTypes', false);
        }
      });
    }

    case updatePropertyTypeMetaData.case(action.type): {
      return updatePropertyTypeMetaData.reducer(state, action, {
        REQUEST: () => {
          // TODO: not ideal. perhaps there's a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['actions', 'updatePropertyTypeMetaData', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const storedSeqAction :Map<*, *> = state.getIn(
            ['actions', 'updatePropertyTypeMetaData', seqAction.id],
            Map()
          );

          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const propertyTypeId :string = storedSeqAction.getIn(['value', 'id']);
          const propertyTypeIndex :number = state.getIn(['propertyTypesById', propertyTypeId], -1);
          if (propertyTypeIndex < 0) {
            return state;
          }

          const metadata :Map<*, *> = storedSeqAction.getIn(['value', 'metadata']);
          if (metadata.has('description')) {
            return state.setIn(['propertyTypes', propertyTypeIndex, 'description'], metadata.get('description'));
          }
          else if (metadata.has('title')) {
            return state.setIn(['propertyTypes', propertyTypeIndex, 'title'], metadata.get('title'));
          }
          else if (metadata.has('type')) {
            // TODO: potential bug with how immutable.js deals with custom objects
            // TODO: consider storing plain object instead of FullyQualifiedName object
            return state.setIn(['propertyTypes', propertyTypeIndex, 'type'], metadata.get('type'));
          }

          return state;
        },
        FAILURE: () => {
          // TODO: need to properly handle the failure case
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state.deleteIn(['actions', 'updatePropertyTypeMetaData', seqAction.id]);
        }
      });
    }

    default:
      return state;
  }
}
