/*
 * @flow
 */

import Immutable from 'immutable';
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

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  isCreatingNewPropertyType: false,
  isFetchingAllPropertyTypes: false,
  newlyCreatedPropertyTypeId: '',
  propertyTypeIdToDelete: '',
  propertyTypes: Immutable.List(),
  propertyTypesById: Immutable.Map(),
  tempPropertyType: null,
  updateActionsMap: Immutable.Map()
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case createPropertyType.case(action.type): {
      return createPropertyType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isCreatingNewPropertyType', true)
            .set('newlyCreatedPropertyTypeId', '')
            .set('tempPropertyType', seqAction.value);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const newPropertyTypeId :string = seqAction.value;
          const tempPropertyType :PropertyType = state.get('tempPropertyType');

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
          const current :List<Map<*, *>> = state.get('propertyTypes', Immutable.List());
          const updated :List<Map<*, *>> = current.push(iPropertyType);

          const currentById :Map<string, number> = state.get('propertyTypesById', Immutable.Map());
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
          return state
            .set('isCreatingNewPropertyType', false)
            .set('newlyCreatedPropertyTypeId', '')
            .set('tempPropertyType', null);
        }
      });
    }

    case deletePropertyType.case(action.type): {
      return deletePropertyType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = (action :any);
          return state.set('propertyTypeIdToDelete', seqAction.value);
        },
        SUCCESS: () => {

          const propertyTypeId :string = state.get('propertyTypeIdToDelete', '');
          const propertyTypeIndex :number = state.getIn(['propertyTypesById', propertyTypeId], -1);

          if (propertyTypeIndex === -1) {
            return state;
          }

          const current :List<Map<*, *>> = state.get('propertyTypes', Immutable.List());
          const updated :List<Map<*, *>> = current.delete(propertyTypeIndex);

          // !!! BUG !!! - need to update id -> index mapping
          const currentById :Map<string, number> = state.get('propertyTypesById', Immutable.Map());
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
          return state.set('propertyTypeIdToDelete', '');
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
          const propertyTypes :List<Map<*, *>> = Immutable.fromJS(seqAction.value);
          const propertyTypesById :Map<string, number> = Immutable.Map()
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
            .set('propertyTypes', Immutable.List())
            .set('propertyTypesById', Immutable.Map());
        },
        FINALLY: () => {
          return state.set('isFetchingAllPropertyTypes', false);
        }
      });
    }

    case updatePropertyTypeMetaData.case(action.type): {
      return updatePropertyTypeMetaData.reducer(state, action, {
        REQUEST: () => {
          // TODO: this is not ideal. figure out a better way to get access to the trigger action value
          const seqAction :SequenceAction = (action :any);
          return state.setIn(['updateActionsMap', seqAction.id], Immutable.fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          const updateSeqAction :Map<*, *> = state.getIn(['updateActionsMap', seqAction.id], Immutable.Map());

          if (updateSeqAction.isEmpty()) {
            return state;
          }

          const propertyTypeId :string = updateSeqAction.getIn(['value', 'id'], '');
          const propertyTypeIndex :number = state.getIn(['propertyTypesById', propertyTypeId], -1);
          if (propertyTypeIndex < 0) {
            return state;
          }

          const metadata :Map<*, *> = updateSeqAction.getIn(['value', 'metadata'], Immutable.Map());
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
          return state.deleteIn(['updateActionsMap', seqAction.id]);
        }
      });
    }

    default:
      return state;
  }
}
