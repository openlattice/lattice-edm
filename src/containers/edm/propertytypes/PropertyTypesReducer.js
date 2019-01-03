/*
 * @flow
 */

/* eslint-disable arrow-body-style */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActions } from 'lattice-sagas';

import Logger from '../../../utils/Logger';
import {
  LOCAL_CREATE_PROPERTY_TYPE,
  localCreatePropertyType,
} from './PropertyTypesActions';

import type { IndexMap } from '../Types';

const LOG :Logger = new Logger('PropertyTypesReducer');

const {
  deletePropertyType,
  getEntityDataModel,
  updatePropertyTypeMetaData,
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
  actions: {
    createPropertyType: Map(),
    deletePropertyType: Map(),
    updatePropertyTypeMetaData: Map(),
    updateSchema: Map(),
  },
  isCreatingNewPropertyType: false,
  isFetchingAllPropertyTypes: false,
  newlyCreatedPropertyTypeId: '',
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

            const fqnOrId :FQN | UUID = propertyTypeId || propertyTypeFQN;
            const updatedPropertyTypesIndexMap :IndexMap = state
              .get('propertyTypesIndexMap')
              .set(fqnOrId, updatedPropertyTypes.count() - 1);

            return state
              .set('newlyCreatedPropertyTypeId', fqnOrId)
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
            // .set('newlyCreatedPropertyTypeId', '')
            .deleteIn([LOCAL_CREATE_PROPERTY_TYPE, seqAction.id]);
        },
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

          const targetId :string = storedSeqAction.get('value');
          const targetIndex :number = state.getIn(['propertyTypesById', targetId], -1);
          if (targetIndex === -1) {
            return state;
          }

          const currentPropertyTypes :List<Map<*, *>> = state.get('propertyTypes', List());
          const updatedPropertyTypes :List<Map<*, *>> = currentPropertyTypes.delete(targetIndex);
          const updatedPropertyTypesById :Map<string, number> = Map()
            .withMutations((byIdMap :Map<string, number>) => {
              updatedPropertyTypes.forEach((propertyType :Map<*, *>, propertyTypeIndex :number) => {
                byIdMap.set(propertyType.get('id'), propertyTypeIndex);
              });
            });

          return state
            .set('propertyTypes', updatedPropertyTypes)
            .set('propertyTypesById', updatedPropertyTypesById);
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
          const propertyTypesIndexMap :Map<FQN | UUID, number> = Map().asMutable();

          responsePropertyTypes.forEach((pt :Object, index :number) => {
            try {
              const propertyTypeAsImmutable :PropertyType = new PropertyTypeBuilder()
                .setId(pt.id)
                .setType(new FullyQualifiedName(pt.type))
                .setTitle(pt.title)
                .setDescription(pt.description)
                .setDataType(pt.datatype)
                .setPii(pt.piiField)
                .setAnalyzer(pt.analyzer)
                .setSchemas(pt.schemas)
                .build()
                .asImmutable();
              propertyTypes.push(propertyTypeAsImmutable);
              propertyTypesIndexMap.set(pt.id, index);
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

          const propertyTypeId :string = storedSeqAction.getIn(['value', 'propertyTypeId']);
          const propertyTypeIndex :number = state.getIn(['propertyTypesById', propertyTypeId], -1);
          if (propertyTypeIndex < 0) {
            return state;
          }

          const metadata :Map<*, *> = storedSeqAction.getIn(['value', 'metadata']);
          if (metadata.has('description')) {
            return state.setIn(['propertyTypes', propertyTypeIndex, 'description'], metadata.get('description'));
          }
          if (metadata.has('title')) {
            return state.setIn(['propertyTypes', propertyTypeIndex, 'title'], metadata.get('title'));
          }
          if (metadata.has('type')) {
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

export type {
  IndexMap,
};
