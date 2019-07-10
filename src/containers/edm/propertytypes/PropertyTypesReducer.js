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
import { RequestStates } from 'redux-reqseq';
import type { FQN, PropertyTypeObject } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isValidUUID } from '../../../utils/ValidationUtils';
import {
  LOCAL_CREATE_PROPERTY_TYPE,
  LOCAL_DELETE_PROPERTY_TYPE,
  LOCAL_UPDATE_PROPERTY_TYPE_META,
  RESET_REQUEST_STATE,
  localCreatePropertyType,
  localDeletePropertyType,
  localUpdatePropertyTypeMeta,
} from './PropertyTypesActions';
import {
  LOCAL_UPDATE_SCHEMA,
  localUpdateSchema,
} from '../schemas/SchemasActions';
import type { IndexMap, UpdatePropertyTypeMeta } from '../Types';

const LOG :Logger = new Logger('PropertyTypesReducer');

const {
  getEntityDataModel,
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
  [LOCAL_CREATE_PROPERTY_TYPE]: {
    requestState: RequestStates.STANDBY,
  },
  [LOCAL_DELETE_PROPERTY_TYPE]: {
    requestState: RequestStates.STANDBY,
  },
  [LOCAL_UPDATE_PROPERTY_TYPE_META]: {
    requestState: RequestStates.STANDBY,
  },
  [LOCAL_UPDATE_SCHEMA]: {
    requestState: RequestStates.STANDBY,
  },
  newlyCreatedPropertyTypeFQN: undefined,
  propertyTypes: List(),
  propertyTypesIndexMap: Map(),
});

export default function propertyTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case getEntityDataModel.case(action.type): {
      return getEntityDataModel.reducer(state, action, {
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const responsePropertyTypes :PropertyTypeObject[] = seqAction.value.propertyTypes;
          if (!responsePropertyTypes || responsePropertyTypes.length === 0) {
            LOG.error('getEntityDataModel() - PropertyTypes missing', responsePropertyTypes);
            return state;
          }

          const propertyTypes :List<Map<*, *>> = List().asMutable();
          const propertyTypesIndexMap :IndexMap = Map().asMutable();

          responsePropertyTypes.forEach((pt :PropertyTypeObject, index :number) => {
            try {
              const propertyTypeId :?UUID = pt.id;
              const propertyTypeFQN :FQN = new FullyQualifiedName(pt.type);
              const propertyType :PropertyType = new PropertyTypeBuilder()
                .setAnalyzer(pt.analyzer)
                .setDataType(pt.datatype)
                .setDescription(pt.description)
                .setEnumValues(pt.enumValues)
                .setId(propertyTypeId)
                .setIndexType(pt.indexType)
                .setMultiValued(pt.multiValued)
                .setPii(pt.pii)
                .setSchemas(pt.schemas)
                .setTitle(pt.title)
                .setType(propertyTypeFQN)
                .build();
              propertyTypes.push(propertyType.toImmutable());
              /*
               * IMPORTANT! we must keep the fqn and id index mapping in sync!
               */
              propertyTypesIndexMap.set(propertyTypeId, index);
              propertyTypesIndexMap.set(propertyTypeFQN, index);
            }
            catch (e) {
              LOG.error('getEntityDataModel()', pt);
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
      });
    }

    case localCreatePropertyType.case(action.type): {
      return localCreatePropertyType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('newlyCreatedPropertyTypeFQN', undefined)
            .setIn([LOCAL_CREATE_PROPERTY_TYPE, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_CREATE_PROPERTY_TYPE, seqAction.id]);

          if (storedSeqAction) {

            const storedPropertyType :PropertyType = storedSeqAction.value;
            const propertyTypeFQN :FQN = new FullyQualifiedName(storedPropertyType.type);
            const propertyTypeId :?UUID = seqAction.value; // id won't be available in "offline" mode
            const newPropertyType :PropertyType = new PropertyTypeBuilder()
              .setAnalyzer(storedPropertyType.analyzer)
              .setDataType(storedPropertyType.datatype)
              .setDescription(storedPropertyType.description)
              .setEnumValues(storedPropertyType.enumValues)
              .setId(propertyTypeId)
              .setIndexType(storedPropertyType.indexType)
              .setMultiValued(storedPropertyType.multiValued)
              .setPii(storedPropertyType.pii)
              .setSchemas(storedPropertyType.schemas)
              .setTitle(storedPropertyType.title)
              .setType(propertyTypeFQN)
              .build();

            const updatedPropertyTypes :List<Map<*, *>> = state
              .get('propertyTypes')
              .push(newPropertyType.toImmutable());

            const newPropertyTypeIndex :number = updatedPropertyTypes.count() - 1;

            /*
             * IMPORTANT! we must keep the fqn and the id index mapping in sync!
             */
            let updatedPropertyTypesIndexMap :IndexMap = state
              .get('propertyTypesIndexMap')
              .set(propertyTypeFQN, newPropertyTypeIndex);
            if (isValidUUID(propertyTypeId)) {
              updatedPropertyTypesIndexMap = updatedPropertyTypesIndexMap
                .set(propertyTypeId, newPropertyTypeIndex);
            }

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
            return state
              .set('newlyCreatedPropertyTypeFQN', undefined)
              .setIn([LOCAL_CREATE_PROPERTY_TYPE, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_CREATE_PROPERTY_TYPE, seqAction.id]);
        },
      });
    }

    case localDeletePropertyType.case(action.type): {
      return localDeletePropertyType.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_DELETE_PROPERTY_TYPE, seqAction.id], seqAction);
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
              /*
               * IMPORTANT! we must keep the fqn and id index mapping in sync!
               */
              const propertyTypeFQN :FQN = new FullyQualifiedName(propertyType.get('type'));
              updatedPropertyTypesIndexMap.set(propertyTypeFQN, index);
              const propertyTypeId :?UUID = propertyType.get('id');
              if (isValidUUID(propertyTypeId)) {
                updatedPropertyTypesIndexMap.set(propertyTypeId, index);
              }
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
          return state.deleteIn([LOCAL_DELETE_PROPERTY_TYPE, seqAction.id]);
        },
      });
    }

    case localUpdatePropertyTypeMeta.case(action.type): {
      const seqAction :SequenceAction = action;
      return localUpdatePropertyTypeMeta.reducer(state, action, {
        REQUEST: () => {
          return state
            .setIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'], RequestStates.PENDING)
            .setIn([LOCAL_UPDATE_PROPERTY_TYPE_META, seqAction.id], seqAction);
        },
        SUCCESS: () => {

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

            let newState :Map<*, *> = state;
            const currentPropertyType :PropertyTypeObject = state.getIn(['propertyTypes', propertyTypeIndex]).toJS();
            const propertyTypeBuilder :PropertyTypeBuilder = new PropertyTypeBuilder()
              .setAnalyzer(currentPropertyType.analyzer)
              .setDataType(currentPropertyType.datatype)
              .setDescription(currentPropertyType.description)
              .setEnumValues(currentPropertyType.enumValues)
              .setId(currentPropertyType.id)
              .setIndexType(currentPropertyType.indexType)
              .setMultiValued(currentPropertyType.multiValued)
              .setPii(currentPropertyType.pii)
              .setSchemas(currentPropertyType.schemas)
              .setTitle(currentPropertyType.title)
              .setType(currentPropertyType.type);

            if (has(metadata, 'description')) {
              propertyTypeBuilder.setDescription(metadata.description);
            }

            if (metadata.title) {
              propertyTypeBuilder.setTitle(metadata.title);
            }

            if (metadata.type) {
              const newPropertyTypeFQN = new FullyQualifiedName(metadata.type);
              propertyTypeBuilder.setType(metadata.type);
              newState = newState
                .deleteIn(['propertyTypesIndexMap', propertyTypeFQN])
                .setIn(['propertyTypesIndexMap', newPropertyTypeFQN], propertyTypeIndex);
            }

            if (has(metadata, 'pii')) {
              propertyTypeBuilder.setPii(metadata.pii);
            }

            const updatedPropertyType :PropertyType = propertyTypeBuilder.build();
            return newState
              .setIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'], RequestStates.SUCCESS)
              .setIn(['propertyTypes', propertyTypeIndex], updatedPropertyType.toImmutable());
          }

          return state;
        },
        FAILURE: () => {
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_PROPERTY_TYPE_META, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_UPDATE_PROPERTY_TYPE_META, 'requestState'], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => {
          return state.deleteIn([LOCAL_UPDATE_PROPERTY_TYPE_META, seqAction.id]);
        },
      });
    }

    case localUpdateSchema.case(action.type): {
      return localUpdateSchema.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state.setIn([LOCAL_UPDATE_SCHEMA, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_SCHEMA, seqAction.id]);

          if (storedSeqAction) {

            const {
              actionType,
              propertyTypeIds,
              propertyTypes,
              schemaFQN,
            } = storedSeqAction.value;

            let newState :Map<*, *> = state;
            let ids :UUID[] = propertyTypeIds;
            if (propertyTypes && propertyTypes.length > 0) {
              ids = propertyTypes.map((propertyType :Map<*, *>) => propertyType.get('id'));
            }

            if (!ids || ids.length <= 0) {
              return state;
            }

            ids.forEach((propertyTypeId :UUID) => {
              const propertyTypeIndex :number = state.get('propertyTypes').findIndex(
                (propertyType :Map<*, *>) => propertyType.get('id') === propertyTypeId
              );
              if (propertyTypeIndex !== -1) {
                const path = ['propertyTypes', propertyTypeIndex, 'schemas'];
                if (actionType === ActionTypes.ADD) {
                  const currentSchemas = newState.getIn(path);
                  const updatedSchemas = currentSchemas.push(fromJS(schemaFQN.toObject()));
                  newState = newState.setIn(path, updatedSchemas);
                }
                else if (actionType === ActionTypes.REMOVE) {
                  const schemaIndex :number = newState.getIn(path).findIndex(
                    (fqn :Map<*, *>) => FullyQualifiedName.toString(fqn) === schemaFQN.toString()
                  );
                  if (schemaIndex !== -1) {
                    path.push(schemaIndex);
                    newState = newState.deleteIn(path);
                  }
                }
              }
            });

            return newState;
          }

          return state;
        },
        FAILURE: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([LOCAL_UPDATE_SCHEMA, seqAction.id]);
          if (storedSeqAction) {
            // TODO: we need a better pattern for setting and handling errors
            return state.setIn([LOCAL_UPDATE_SCHEMA, 'error'], true);
          }
          return state;
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([LOCAL_UPDATE_SCHEMA, seqAction.id]);
        },
      });
    }

    default:
      return state;
  }
}
