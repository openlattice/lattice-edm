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
  FETCH_ALL_ASSOCIATION_TYPES_SUCCESS
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

      const currentById :Map<string, Map<*, *>> = state.get('associationTypesById', Immutable.Map());
      const updatedById :Map<string, Map<*, *>> = currentById.set(action.associationTypeId, iAssociationType);

      return state
        .set('isCreatingNewAssociationType', false)
        .set('newlyCreatedAssociationTypeId', action.associationTypeId)
        .set('associationTypes', updated)
        .set('associationTypesById', updatedById);
    }

    case CREATE_ASSOCIATION_TYPE_FAILURE:
      return state
        .set('isCreatingNewAssociationType', false)
        .set('newlyCreatedAssociationTypeId', '');

    case FETCH_ALL_ASSOCIATION_TYPES_REQUEST:
      return state.set('isFetchingAllAssociationTypes', true);

    case FETCH_ALL_ASSOCIATION_TYPES_SUCCESS: {

      const allAssociationTypes :List<Map<*, *>> = Immutable.fromJS(action.associationTypes);
      const associationTypesById :Map<string, Map<*, *>> = Immutable.Map()
        .withMutations((map :Map<string, Map<*, *>>) => {
          allAssociationTypes.forEach((associationType :Map<*, *>) => {
            const entityType :Map<*, *> = associationType.get('entityType', Immutable.Map());
            map.set(entityType.get('id'), associationType);
          });
        });

      return state
        .set('isFetchingAllAssociationTypes', false)
        .set('associationTypes', allAssociationTypes)
        .set('associationTypesById', associationTypesById);
    }

    case FETCH_ALL_ASSOCIATION_TYPES_FAILURE:
      return state
        .set('isFetchingAllAssociationTypes', false)
        .set('associationTypes', Immutable.List());

    default:
      return state;
  }
}
