/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import {
  List,
  Map,
  fromJS,
  has,
} from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

import Logger from '../../../utils/Logger';
import {
  LOCAL_CREATE_PROPERTY_TYPE,
  LOCAL_DELETE_PROPERTY_TYPE,
  LOCAL_UPDATE_PROPERTY_TYPE_META,
  localCreatePropertyType,
  localDeletePropertyType,
  localUpdatePropertyTypeMeta,
} from './PropertyTypesActions';
import type { IndexMap, UpdatePropertyTypeMeta } from '../Types';

const LOG :Logger = new Logger('PropertyTypesReducer');

const {
  getEntityDataModel,
  updateSchema,
} = EntityDataModelApiActions;

const {
  FullyQualifiedName,
  PropertyType,
  PropertyTypeBuilder,
} = Models;

const {
  ActionTypes,
} = Types;

const INITIAL_STATE :Map<*, *> = fromJS({
  [LOCAL_CREATE_PROPERTY_TYPE]: { error: Map() },
  [LOCAL_DELETE_PROPERTY_TYPE]: { error: Map() },
  [LOCAL_UPDATE_PROPERTY_TYPE_META]: { error: Map() },
  actions: {
    updateSchema: Map(),
  },
  isCreatingNewPropertyType: false,
  isDeletingPropertyType: false,
  isFetchingAllPropertyTypes: false,
  isUpdatingPropertyTypeMeta: false,
  newlyCreatedPropertyTypeFQN: '',
  propertyTypes: List(),
  propertyTypesIndexMap: Map(),
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case localCreatePropertyType.case(action.type): {
      return localCreatePropertyType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('isCreatingNewPropertyType', true)
            .setIn([LOCAL_CREATE_PROPERTY_TYPE, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_CREATE_PROPERTY_TYPE, seqAction.id]);

          if (storedSeqAction) {

            const storedPropertyType :PropertyType = storedSeqAction.value;
            const propertyTypeFQN :FQN = new FullyQualifiedName(storedPropertyType.type);
            const propertyTypeId :?UUID = seqAction.value; // id won't be available in "offline" mode
            const newPropertyTypeAsImmutable :Map<*, *> = new PropertyTypeBuilder()
              .setId(propertyTypeId)
              .setType(propertyTypeFQN)
              .setTitle(storedPropertyType.title)
              .setDescription(storedPropertyType.description)
              .setDataType(storedPropertyType.datatype)
              .setPii(storedPropertyType.piiField)
              .setAnalyzer(storedPropertyType.analyzer)
              .setSchemas(storedPropertyType.schemas)
              .build()
              .asImmutable();

            const updatedPropertyTypes :List<Map<*, *>> = state
              .get('propertyTypes')
              .push(newPropertyTypeAsImmutable);

            const updatedPropertyTypesIndexMap :IndexMap = state
              .get('propertyTypesIndexMap')
              .set(propertyTypeFQN, updatedPropertyTypes.count() - 1);

            return state
              .set('newlyCreatedPropertyTypeFQN', propertyTypeFQN)
              .set('propertyTypes', updatedPropertyTypes)
              .set('propertyTypesIndexMap', updatedPropertyTypesIndexMap);
          }
          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_CREATE_PROPERTY_TYPE, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_CREATE_PROPERTY_TYPE, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('isCreatingNewPropertyType', false)
            .deleteIn([LOCAL_CREATE_PROPERTY_TYPE, seqAction.id]);
        },
      });
    }

    case localDeletePropertyType.case(action.type): {
      return localDeletePropertyType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('isDeletingPropertyType', true)
            .setIn([LOCAL_DELETE_PROPERTY_TYPE, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_DELETE_PROPERTY_TYPE, seqAction.id]);

          if (storedSeqAction) {

            const targetFQN :FQN = storedSeqAction.value.propertyTypeFQN;
            const targetIndex :number = state.getIn(['propertyTypesIndexMap', targetFQN], -1);
            if (targetIndex === -1) {
              return state;
            }

            const currentPropertyTypes :List<Map<*, *>> = state.get('propertyTypes', List());
            const updatedPropertyTypes :List<Map<*, *>> = currentPropertyTypes.delete(targetIndex);
            const updatedPropertyTypesIndexMap :IndexMap = Map().asMutable();

            updatedPropertyTypes.forEach((propertyType :Map<*, *>, index :number) => {
              const propertyTypeFQN :FQN = propertyType.get('type');
              updatedPropertyTypesIndexMap.set(propertyTypeFQN, index);
            });

            return state
              .set('propertyTypes', updatedPropertyTypes)
              .set('propertyTypesIndexMap', updatedPropertyTypesIndexMap);
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_DELETE_PROPERTY_TYPE, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_DELETE_PROPERTY_TYPE, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('isDeletingPropertyType', false)
            .deleteIn([LOCAL_DELETE_PROPERTY_TYPE, seqAction.id]);
        },
      });
    }

    case localUpdatePropertyTypeMeta.case(action.type): {
      return localUpdatePropertyTypeMeta.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('isUpdatingPropertyTypeMeta', true)
            .setIn([LOCAL_UPDATE_PROPERTY_TYPE_META, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, seqAction.id]);

          if (storedSeqAction) {

            const {
              metadata,
              propertyTypeFQN,
            } :UpdatePropertyTypeMeta = storedSeqAction.value;

            const propertyTypeIndex :number = state.getIn(['propertyTypesIndexMap', propertyTypeFQN], -1);
            if (propertyTypeIndex === -1) {
              return state;
            }

            if (has(metadata, 'description')) {
              return state.setIn(['propertyTypes', propertyTypeIndex, 'description'], metadata.description);
            }

            if (has(metadata, 'title')) {
              return state.setIn(['propertyTypes', propertyTypeIndex, 'title'], metadata.title);
            }

            if (has(metadata, 'type')) {
              const newPropertyTypeFQN = new FullyQualifiedName(metadata.type);
              return state
                .deleteIn(['propertyTypesIndexMap', propertyTypeFQN])
                .setIn(['propertyTypesIndexMap', newPropertyTypeFQN], propertyTypeIndex)
                .setIn(['propertyTypes', propertyTypeIndex, 'type'], newPropertyTypeFQN);
            }
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('isUpdatingPropertyTypeMeta', false)
            .deleteIn([LOCAL_UPDATE_PROPERTY_TYPE_META, seqAction.id]);
        },
      });
    }

    case getEntityDataModel.case(action.type): {
      return getEntityDataModel.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingAllPropertyTypes', true);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const responsePropertyTypes :Object[] = seqAction.value.propertyTypes;
          if (!responsePropertyTypes || responsePropertyTypes.length === 0) {
            LOG.error('getEntityDataModel() - no PropertyTypes available', responsePropertyTypes);
            return state;
          }

          const propertyTypes :List<Map<*, *>> = List().asMutable();
          const propertyTypesIndexMap :IndexMap = Map().asMutable();

          responsePropertyTypes.forEach((pt :Object, index :number) => {
            try {
              const propertyTypeFQN :FQN = new FullyQualifiedName(pt.type);
              const propertyTypeAsImmutable :PropertyType = new PropertyTypeBuilder()
                .setId(pt.id)
                .setType(propertyTypeFQN)
                .setTitle(pt.title)
                .setDescription(pt.description)
                .setDataType(pt.datatype)
                .setPii(pt.piiField)
                .setAnalyzer(pt.analyzer)
                .setSchemas(pt.schemas)
                .build()
                .asImmutable();
              propertyTypes.push(propertyTypeAsImmutable);
              propertyTypesIndexMap.set(propertyTypeFQN, index);
            }
            catch (e) {
              LOG.error('getEntityDataModel()', e);
            }
          });

          return state
            .set('propertyTypes', propertyTypes.asImmutable())
            .set('propertyTypesIndexMap', propertyTypesIndexMap.asImmutable());
        },
        FAILURE: () => {
          return state
            .set('propertyTypes', List())
            .set('propertyTypesIndexMap', Map());
        },
        FINALLY: () => {
          return state.set('isFetchingAllPropertyTypes', false);
        }
      });
    }

    case updateSchema.case(action.type): {
      return updateSchema.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn(['actions', 'updateSchema', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :Map<*, *> = state.getIn(['actions', 'updateSchema', seqAction.id], Map());
          if (storedSeqAction.isEmpty()) {
            return state;
          }

          const schemaFqn :FullyQualifiedName = new FullyQualifiedName(storedSeqAction.getIn(['value', 'schemaFqn']));
          const actionPropertyTypeIds :List<string> = storedSeqAction.getIn(['value', 'propertyTypeIds'], List());
          // TODO: ":string" should be ":ActionType"
          const actionType :string = storedSeqAction.getIn(['value', 'action']);

          let updatedState :Map<*, *> = state;
          actionPropertyTypeIds.forEach((propertyTypeId :string) => {
            const propertyTypeIndex :number = state.getIn(['propertyTypesById', propertyTypeId], -1);
            if (propertyTypeIndex >= 0) {
              const existingSchemas :List<FullyQualifiedName> = updatedState.getIn(
                ['propertyTypes', propertyTypeIndex, 'schemas'],
                List(),
              );
              if (actionType === ActionTypes.ADD) {
                const updatedSchemas :List<FullyQualifiedName> = existingSchemas.push(schemaFqn);
                updatedState = updatedState.setIn(['propertyTypes', propertyTypeIndex, 'schemas'], updatedSchemas);
              }
              else if (actionType === ActionTypes.REMOVE) {
                const targetIndex :number = existingSchemas.findIndex((fqn :FullyQualifiedName) => (
                  FullyQualifiedName.toString(fqn) === schemaFqn.toString()
                ));
                if (targetIndex >= 0) {
                  const updatedSchemas :List<FullyQualifiedName> = existingSchemas.delete(targetIndex);
                  updatedState = updatedState.setIn(['propertyTypes', propertyTypeIndex, 'schemas'], updatedSchemas);
                }
              }
            }
          });

          return updatedState;
        },
        FAILURE: () => {
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn(['actions', 'updateSchema', seqAction.id]);
        },
      });
    }

    default:
      return state;
  }
}
