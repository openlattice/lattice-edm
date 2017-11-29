/*
 * @flow
 */

import { newRequestSequence } from '../../../core/redux/RequestSequence';

import type { RequestSequence } from '../../../core/redux/RequestSequence';

/* eslint-disable max-len */
const UPDATE_ENTITY_TYPE_METADATA_FAILURE :'UPDATE_ENTITY_TYPE_METADATA_FAILURE' = 'UPDATE_ENTITY_TYPE_METADATA_FAILURE';
const UPDATE_ENTITY_TYPE_METADATA_REQUEST :'UPDATE_ENTITY_TYPE_METADATA_REQUEST' = 'UPDATE_ENTITY_TYPE_METADATA_REQUEST';
const UPDATE_ENTITY_TYPE_METADATA_SUCCESS :'UPDATE_ENTITY_TYPE_METADATA_SUCCESS' = 'UPDATE_ENTITY_TYPE_METADATA_SUCCESS';
/* eslint-enable */

type UpdateEntityTypeMetaDataFailureAction = {
  entityTypeId :string,
  error :any,
  type :typeof UPDATE_ENTITY_TYPE_METADATA_FAILURE
}

function updateEntityTypeMetaDataFailure(
  entityTypeId :string,
  error :any
) :UpdateEntityTypeMetaDataFailureAction {

  return {
    entityTypeId,
    error,
    type: UPDATE_ENTITY_TYPE_METADATA_FAILURE
  };
}

type UpdateEntityTypeMetaDataRequestAction = {
  entityTypeId :string,
  metadata :Object,
  type :typeof UPDATE_ENTITY_TYPE_METADATA_REQUEST
}

function updateEntityTypeMetaDataRequest(
  entityTypeId :string,
  metadata :Object
) :UpdateEntityTypeMetaDataRequestAction {

  return {
    entityTypeId,
    metadata,
    type: UPDATE_ENTITY_TYPE_METADATA_REQUEST
  };
}

type UpdateEntityTypeMetaDataSuccessAction = {
  entityTypeId :string,
  metadata :Object,
  type :typeof UPDATE_ENTITY_TYPE_METADATA_SUCCESS
}

function updateEntityTypeMetaDataSuccess(
  entityTypeId :string,
  metadata :Object
) :UpdateEntityTypeMetaDataSuccessAction {

  return {
    entityTypeId,
    metadata,
    type: UPDATE_ENTITY_TYPE_METADATA_SUCCESS
  };
}

const ADD_PROPERTY_TYPE_TO_ENTITY_TYPE :'ADD_PROPERTY_TYPE_TO_ENTITY_TYPE' = 'ADD_PROPERTY_TYPE_TO_ENTITY_TYPE';
const addPropertyTypeToEntityType :RequestSequence = newRequestSequence(ADD_PROPERTY_TYPE_TO_ENTITY_TYPE);

const RM_PROPERTY_TYPE_FROM_ENTITY_TYPE :'RM_PROPERTY_TYPE_FROM_ENTITY_TYPE' = 'RM_PROPERTY_TYPE_FROM_ENTITY_TYPE';
const removePropertyTypeFromEntityType :RequestSequence = newRequestSequence(RM_PROPERTY_TYPE_FROM_ENTITY_TYPE);

export {
  ADD_PROPERTY_TYPE_TO_ENTITY_TYPE,
  RM_PROPERTY_TYPE_FROM_ENTITY_TYPE,
  UPDATE_ENTITY_TYPE_METADATA_FAILURE,
  UPDATE_ENTITY_TYPE_METADATA_REQUEST,
  UPDATE_ENTITY_TYPE_METADATA_SUCCESS
};

export {
  addPropertyTypeToEntityType,
  removePropertyTypeFromEntityType,
  updateEntityTypeMetaDataFailure,
  updateEntityTypeMetaDataRequest,
  updateEntityTypeMetaDataSuccess
};

export type {
  UpdateEntityTypeMetaDataFailureAction,
  UpdateEntityTypeMetaDataRequestAction,
  UpdateEntityTypeMetaDataSuccessAction
};

export type Action =
  | UpdateEntityTypeMetaDataFailureAction
  | UpdateEntityTypeMetaDataRequestAction
  | UpdateEntityTypeMetaDataSuccessAction;
