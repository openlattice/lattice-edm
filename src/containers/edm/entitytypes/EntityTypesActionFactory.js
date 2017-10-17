/*
 * @flow
 */

import { Models } from 'lattice';

const { EntityType } = Models;

const FETCH_ALL_ENTITY_TYPES_FAILURE :'FETCH_ALL_ENTITY_TYPES_FAILURE' = 'FETCH_ALL_ENTITY_TYPES_FAILURE';
const FETCH_ALL_ENTITY_TYPES_REQUEST :'FETCH_ALL_ENTITY_TYPES_REQUEST' = 'FETCH_ALL_ENTITY_TYPES_REQUEST';
const FETCH_ALL_ENTITY_TYPES_SUCCESS :'FETCH_ALL_ENTITY_TYPES_SUCCESS' = 'FETCH_ALL_ENTITY_TYPES_SUCCESS';

type FetchAllEntityTypesFailureAction = {
  error :any,
  type :typeof FETCH_ALL_ENTITY_TYPES_FAILURE
};

function fetchAllEntityTypesFailure(error :any) :FetchAllEntityTypesFailureAction {

  return {
    error,
    type: FETCH_ALL_ENTITY_TYPES_FAILURE
  };
}

type FetchAllEntityTypesRequestAction = {
  type :typeof FETCH_ALL_ENTITY_TYPES_REQUEST
};

function fetchAllEntityTypesRequest() :FetchAllEntityTypesRequestAction {

  return {
    type: FETCH_ALL_ENTITY_TYPES_REQUEST
  };
}

type FetchAllEntityTypesSuccessAction = {
  entityTypes :EntityType[],
  type :typeof FETCH_ALL_ENTITY_TYPES_SUCCESS
};

function fetchAllEntityTypesSuccess(entityTypes :Object[]) :FetchAllEntityTypesSuccessAction {

  return {
    entityTypes,
    type: FETCH_ALL_ENTITY_TYPES_SUCCESS
  };
}

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

export {
  CREATE_ENTITY_TYPE_FAILURE,
  CREATE_ENTITY_TYPE_REQUEST,
  CREATE_ENTITY_TYPE_SUCCESS,
  FETCH_ALL_ENTITY_TYPES_FAILURE,
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  FETCH_ALL_ENTITY_TYPES_SUCCESS,
  UPDATE_ENTITY_TYPE_METADATA_FAILURE,
  UPDATE_ENTITY_TYPE_METADATA_REQUEST,
  UPDATE_ENTITY_TYPE_METADATA_SUCCESS
};

export {
  createEntityTypeFailure,
  createEntityTypeRequest,
  createEntityTypeSuccess,
  fetchAllEntityTypesFailure,
  fetchAllEntityTypesRequest,
  fetchAllEntityTypesSuccess,
  updateEntityTypeMetaDataFailure,
  updateEntityTypeMetaDataRequest,
  updateEntityTypeMetaDataSuccess
};

export type {
  CreateEntityTypeFailureAction,
  CreateEntityTypeRequestAction,
  CreateEntityTypeSuccessAction,
  FetchAllEntityTypesFailureAction,
  FetchAllEntityTypesRequestAction,
  FetchAllEntityTypesSuccessAction,
  UpdateEntityTypeMetaDataFailureAction,
  UpdateEntityTypeMetaDataRequestAction,
  UpdateEntityTypeMetaDataSuccessAction
};

export type Action =
  | CreateEntityTypeFailureAction
  | CreateEntityTypeRequestAction
  | CreateEntityTypeSuccessAction
  | FetchAllEntityTypesFailureAction
  | FetchAllEntityTypesRequestAction
  | FetchAllEntityTypesSuccessAction
  | UpdateEntityTypeMetaDataFailureAction
  | UpdateEntityTypeMetaDataRequestAction
  | UpdateEntityTypeMetaDataSuccessAction;
