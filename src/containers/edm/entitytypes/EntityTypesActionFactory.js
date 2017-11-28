/*
 * @flow
 */

import { Models } from 'lattice';

import { newRequestSequence } from '../../../core/redux/RequestSequence';

import type { RequestSequence } from '../../../core/redux/RequestSequence';

const { EntityType } = Models;

const CREATE_ENTITY_TYPE_FAILURE :'CREATE_ENTITY_TYPE_FAILURE' = 'CREATE_ENTITY_TYPE_FAILURE';
const CREATE_ENTITY_TYPE_REQUEST :'CREATE_ENTITY_TYPE_REQUEST' = 'CREATE_ENTITY_TYPE_REQUEST';
const CREATE_ENTITY_TYPE_SUCCESS :'CREATE_ENTITY_TYPE_SUCCESS' = 'CREATE_ENTITY_TYPE_SUCCESS';

type CreateEntityTypeFailureAction = {
  error :any,
  entityType :EntityType,
  type :typeof CREATE_ENTITY_TYPE_FAILURE
};

function createEntityTypeFailure(entityType :EntityType, error :any) :CreateEntityTypeFailureAction {

  return {
    error,
    entityType,
    type: CREATE_ENTITY_TYPE_FAILURE
  };
}

type CreateEntityTypeRequestAction = {
  entityType :EntityType,
  type :typeof CREATE_ENTITY_TYPE_REQUEST
};

function createEntityTypeRequest(entityType :EntityType) :CreateEntityTypeRequestAction {

  return {
    entityType,
    type: CREATE_ENTITY_TYPE_REQUEST
  };
}

type CreateEntityTypeSuccessAction = {
  entityType :EntityType,
  entityTypeId :string,
  type :typeof CREATE_ENTITY_TYPE_SUCCESS
};

function createEntityTypeSuccess(entityType :EntityType, entityTypeId :string) :CreateEntityTypeSuccessAction {

  return {
    entityType,
    entityTypeId,
    type: CREATE_ENTITY_TYPE_SUCCESS
  };
}

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
  CREATE_ENTITY_TYPE_FAILURE,
  CREATE_ENTITY_TYPE_REQUEST,
  CREATE_ENTITY_TYPE_SUCCESS,
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
  createEntityTypeFailure,
  createEntityTypeRequest,
  createEntityTypeSuccess,
  deleteEntityTypeFailure,
  deleteEntityTypeRequest,
  deleteEntityTypeSuccess,
  removePropertyTypeFromEntityType,
  updateEntityTypeMetaDataFailure,
  updateEntityTypeMetaDataRequest,
  updateEntityTypeMetaDataSuccess
};

export type {
  CreateEntityTypeFailureAction,
  CreateEntityTypeRequestAction,
  CreateEntityTypeSuccessAction,
  DeleteEntityTypeFailureAction,
  DeleteEntityTypeRequestAction,
  DeleteEntityTypeSuccessAction,
  UpdateEntityTypeMetaDataFailureAction,
  UpdateEntityTypeMetaDataRequestAction,
  UpdateEntityTypeMetaDataSuccessAction
};

export type Action =
  | CreateEntityTypeFailureAction
  | CreateEntityTypeRequestAction
  | CreateEntityTypeSuccessAction
  | DeleteEntityTypeFailureAction
  | DeleteEntityTypeRequestAction
  | DeleteEntityTypeSuccessAction
  | UpdateEntityTypeMetaDataFailureAction
  | UpdateEntityTypeMetaDataRequestAction
  | UpdateEntityTypeMetaDataSuccessAction;
