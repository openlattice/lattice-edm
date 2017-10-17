/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';

import {
  CREATE_ASSOCIATION_TYPE_FAILURE,
  CREATE_ASSOCIATION_TYPE_REQUEST,
  CREATE_ASSOCIATION_TYPE_SUCCESS,
  FETCH_ALL_ASSOCIATION_TYPES_FAILURE,
  FETCH_ALL_ASSOCIATION_TYPES_REQUEST,
  FETCH_ALL_ASSOCIATION_TYPES_SUCCESS,
  UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE,
  UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST,
  UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS
} from './AssociationTypesActionFactory';

import type { Action } from './AssociationTypesActionFactory';

const { AssociationType, AssociationTypeBuilder } = Models;

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  associationTypes: Immutable.List(),
  associationTypesById: Immutable.Map(),
  isCreatingNewAssociationType: false,
  isFetchingAllAssociationTypes: false,
  newlyCreatedAssociationTypeId: ''
});

export default function associationTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case CREATE_ASSOCIATION_TYPE_FAILURE:
      return state
        .set('isCreatingNewAssociationType', false)
        .set('newlyCreatedAssociationTypeId', '');

    case CREATE_ASSOCIATION_TYPE_REQUEST:
      return state
        .set('isCreatingNewAssociationType', true)
        .set('newlyCreatedAssociationTypeId', '');

    case CREATE_ASSOCIATION_TYPE_SUCCESS: {

      const associationType :AssociationType = new AssociationTypeBuilder()
        .setEntityType(action.associationType.entityType)
        .setSourceEntityTypeIds(action.associationType.src)
        .setDestinationEntityTypeIds(action.associationType.dst)
        .setBidirectional(action.associationType.bidirectional)
        .build();

      const iAssociationType :Map<*, *> = associationType.asImmutable();
      const current :List<Map<*, *>> = state.get('associationTypes', Immutable.List());
      const updated :List<Map<*, *>> = current.push(iAssociationType);

      const currentById :Map<string, number> = state.get('associationTypesById', Immutable.Map());
      const updatedById :Map<string, number> = currentById.set(action.associationTypeId, updated.size - 1);

      return state
        .set('isCreatingNewAssociationType', false)
        .set('newlyCreatedAssociationTypeId', action.associationTypeId)
        .set('associationTypes', updated)
        .set('associationTypesById', updatedById);
    }

    case FETCH_ALL_ASSOCIATION_TYPES_FAILURE:
      return state
        .set('isFetchingAllAssociationTypes', false)
        .set('associationTypes', Immutable.List())
        .set('associationTypesById', Immutable.Map());

    case FETCH_ALL_ASSOCIATION_TYPES_REQUEST:
      return state.set('isFetchingAllAssociationTypes', true);

    case FETCH_ALL_ASSOCIATION_TYPES_SUCCESS: {

      const allAssociationTypes :List<Map<*, *>> = Immutable.fromJS(action.associationTypes);
      const associationTypesById :Map<string, number> = Immutable.Map()
        .withMutations((byIdMap :Map<string, number>) => {
          allAssociationTypes.forEach((associationType :Map<*, *>, associationTypeIndex :number) => {
            const entityType :Map<*, *> = associationType.get('entityType', Immutable.Map());
            byIdMap.set(entityType.get('id'), associationTypeIndex);
          });
        });

      return state
        .set('isFetchingAllAssociationTypes', false)
        .set('associationTypes', allAssociationTypes)
        .set('associationTypesById', associationTypesById);
    }

    case UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE:
    case UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST:
      return state;

    case UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS: {

      debugger;

      const associationTypeId :string = action.associationTypeId;
      const associationTypeIndex :number = state.getIn(['associationTypesById', associationTypeId], -1);
      if (associationTypeIndex < 0) {
        return state;
      }

      if (action.metadata.description) {
        return state.setIn(
          ['associationTypes', associationTypeIndex, 'entityType', 'description'],
          action.metadata.description
        );
      }
      else if (action.metadata.title) {
        return state.setIn(
          ['associationTypes', associationTypeIndex, 'entityType', 'title'],
          action.metadata.title
        );
      }
      else if (action.metadata.type) {
        // TODO: potential bug with how immutable.js deals with custom objects
        // TODO: consider storing plain object instead of FullyQualifiedName object
        return state.setIn(
          ['associationTypes', associationTypeIndex, 'entityType', 'type'],
          action.metadata.type
        );
      }

      return state;
    }

    default:
      return state;
  }
}
