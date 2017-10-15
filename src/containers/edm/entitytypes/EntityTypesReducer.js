/*
 * @flow
 */

import Immutable from 'immutable';
import { Models } from 'lattice';

import {
  CREATE_ENTITY_TYPE_FAILURE,
  CREATE_ENTITY_TYPE_REQUEST,
  CREATE_ENTITY_TYPE_SUCCESS,
  FETCH_ALL_ENTITY_TYPES_FAILURE,
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  FETCH_ALL_ENTITY_TYPES_SUCCESS
} from './EntityTypesActionFactory';

import type { Action } from './EntityTypesActionFactory';

const { EntityType, EntityTypeBuilder } = Models;

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  entityTypes: Immutable.List(),
  entityTypesById: Immutable.Map(),
  isCreatingNewEntityType: false,
  isFetchingAllEntityTypes: false,
  newlyCreatedEntityTypeId: ''
});

export default function entityTypesReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case CREATE_ENTITY_TYPE_REQUEST:
      return state
        .set('isCreatingNewEntityType', true)
        .set('newlyCreatedEntityTypeId', '');

    case CREATE_ENTITY_TYPE_SUCCESS: {

      const entityType :EntityType = new EntityTypeBuilder()
        .setId(action.entityTypeId)
        .setType(action.entityType.type)
        .setTitle(action.entityType.title)
        .setDescription(action.entityType.description)
        .setKey(action.entityType.key)
        .setPropertyTypes(action.entityType.properties)
        .setCategory(action.entityType.category)
        .build();

      const iEntityType :Map<*, *> = entityType.asImmutable();
      const current :List<Map<*, *>> = state.get('entityTypes', Immutable.List());
      const updated :List<Map<*, *>> = current.push(iEntityType);

      const currentById :Map<string, Map<*, *>> = state.get('propertyTypesById', Immutable.Map());
      const updatedById :Map<string, Map<*, *>> = currentById.set(action.entityTypeId, iEntityType);

      return state
        .set('isCreatingNewEntityType', false)
        .set('newlyCreatedEntityTypeId', action.entityTypeId)
        .set('entityTypes', updated)
        .set('entityTypesById', updatedById);
    }

    case CREATE_ENTITY_TYPE_FAILURE:
      return state
        .set('isCreatingNewEntityType', false)
        .set('newlyCreatedEntityTypeId', '');

    case FETCH_ALL_ENTITY_TYPES_REQUEST:
      return state.set('isFetchingAllEntityTypes', true);

    case FETCH_ALL_ENTITY_TYPES_SUCCESS: {

      const allEntityTypes :List<Map<*, *>> = Immutable.fromJS(action.entityTypes);
      const entityTypesStrict :List<Map<*, *>> = allEntityTypes.filter((entityType :Map<*, *>) => {
        return entityType.get('category') === 'EntityType';
      });

      const entityTypesById :Map<string, Map<*, *>> = Immutable.Map()
        .withMutations((map :Map<string, Map<*, *>>) => {
          entityTypesStrict.forEach((entityType :Map<*, *>) => {
            map.set(entityType.get('id'), entityType);
          });
        });

      return state
        .set('isFetchingAllEntityTypes', false)
        .set('entityTypes', entityTypesStrict)
        .set('entityTypesById', entityTypesById);
    }

    case FETCH_ALL_ENTITY_TYPES_FAILURE:
      return state
        .set('isFetchingAllEntityTypes', false)
        .set('entityTypes', Immutable.List());

    default:
      return state;
  }
}
