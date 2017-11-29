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

const DELETE_ENTITY_TYPE_FAILURE :'DELETE_ENTITY_TYPE_FAILURE' = 'DELETE_ENTITY_TYPE_FAILURE';
const DELETE_ENTITY_TYPE_REQUEST :'DELETE_ENTITY_TYPE_REQUEST' = 'DELETE_ENTITY_TYPE_REQUEST';
const DELETE_ENTITY_TYPE_SUCCESS :'DELETE_ENTITY_TYPE_SUCCESS' = 'DELETE_ENTITY_TYPE_SUCCESS';

type DeleteEntityTypeFailureAction = {
  error :any,
  entityTypeId :string,
  type :typeof DELETE_ENTITY_TYPE_FAILURE
}

function deleteEntityTypeFailure(entityTypeId :string, error :any) :DeleteEntityTypeFailureAction {

  return {
    error,
    entityTypeId,
    type: DELETE_ENTITY_TYPE_FAILURE
  };
}

type DeleteEntityTypeRequestAction = {
  entityTypeId :string,
  type :typeof DELETE_ENTITY_TYPE_REQUEST
}

function deleteEntityTypeRequest(entityTypeId :string) :DeleteEntityTypeRequestAction {

  return {
    entityTypeId,
    type: DELETE_ENTITY_TYPE_REQUEST
  };
}

type DeleteEntityTypeSuccessAction = {
  entityTypeId :string,
  type :typeof DELETE_ENTITY_TYPE_SUCCESS
}

function deleteEntityTypeSuccess(entityTypeId :string) :DeleteEntityTypeSuccessAction {

  return {
    entityTypeId,
    type: DELETE_ENTITY_TYPE_SUCCESS
  };
}

const ADD_PROPERTY_TYPE_TO_ENTITY_TYPE :'ADD_PROPERTY_TYPE_TO_ENTITY_TYPE' = 'ADD_PROPERTY_TYPE_TO_ENTITY_TYPE';
const addPropertyTypeToEntityType :RequestSequence = newRequestSequence(ADD_PROPERTY_TYPE_TO_ENTITY_TYPE);

const RM_PROPERTY_TYPE_FROM_ENTITY_TYPE :'RM_PROPERTY_TYPE_FROM_ENTITY_TYPE' = 'RM_PROPERTY_TYPE_FROM_ENTITY_TYPE';
const removePropertyTypeFromEntityType :RequestSequence = newRequestSequence(RM_PROPERTY_TYPE_FROM_ENTITY_TYPE);

export {
  ADD_PROPERTY_TYPE_TO_ENTITY_TYPE,
  DELETE_ENTITY_TYPE_FAILURE,
  DELETE_ENTITY_TYPE_REQUEST,
  DELETE_ENTITY_TYPE_SUCCESS,
  RM_PROPERTY_TYPE_FROM_ENTITY_TYPE,
  UPDATE_ENTITY_TYPE_METADATA_FAILURE,
  UPDATE_ENTITY_TYPE_METADATA_REQUEST,
  UPDATE_ENTITY_TYPE_METADATA_SUCCESS
};

export {
  addPropertyTypeToEntityType,
  deleteEntityTypeFailure,
  deleteEntityTypeRequest,
  deleteEntityTypeSuccess,
  removePropertyTypeFromEntityType,
  updateEntityTypeMetaDataFailure,
  updateEntityTypeMetaDataRequest,
  updateEntityTypeMetaDataSuccess
};

export type {
  DeleteEntityTypeFailureAction,
  DeleteEntityTypeRequestAction,
  DeleteEntityTypeSuccessAction,
  UpdateEntityTypeMetaDataFailureAction,
  UpdateEntityTypeMetaDataRequestAction,
  UpdateEntityTypeMetaDataSuccessAction
};

export type Action =
  | DeleteEntityTypeFailureAction
  | DeleteEntityTypeRequestAction
  | DeleteEntityTypeSuccessAction
  | UpdateEntityTypeMetaDataFailureAction
  | UpdateEntityTypeMetaDataRequestAction
  | UpdateEntityTypeMetaDataSuccessAction;
