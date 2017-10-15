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
    type: FETCH_ALL_ENTITY_TYPES_FAILURE,
    error
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
    type: FETCH_ALL_ENTITY_TYPES_SUCCESS,
    entityTypes
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
    type: CREATE_ENTITY_TYPE_FAILURE,
    error,
    entityType
  };
}

type CreateEntityTypeRequestAction = {
  entityType :EntityType,
  type :typeof CREATE_ENTITY_TYPE_REQUEST
};

function createEntityTypeRequest(entityType :EntityType) :CreateEntityTypeRequestAction {

  return {
    type: CREATE_ENTITY_TYPE_REQUEST,
    entityType
  };
}

type CreateEntityTypeSuccessAction = {
  entityType :EntityType,
  entityTypeId :string,
  type :typeof CREATE_ENTITY_TYPE_SUCCESS
};

function createEntityTypeSuccess(entityType :EntityType, entityTypeId :string) :CreateEntityTypeSuccessAction {

  return {
    type: CREATE_ENTITY_TYPE_SUCCESS,
    entityType,
    entityTypeId
  };
}

export {
  CREATE_ENTITY_TYPE_FAILURE,
  CREATE_ENTITY_TYPE_REQUEST,
  CREATE_ENTITY_TYPE_SUCCESS,
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  FETCH_ALL_ENTITY_TYPES_SUCCESS,
  FETCH_ALL_ENTITY_TYPES_FAILURE
};

export {
  createEntityTypeFailure,
  createEntityTypeRequest,
  createEntityTypeSuccess,
  fetchAllEntityTypesFailure,
  fetchAllEntityTypesRequest,
  fetchAllEntityTypesSuccess
};

export type Action =
  | CreateEntityTypeFailureAction
  | CreateEntityTypeRequestAction
  | CreateEntityTypeSuccessAction
  | FetchAllEntityTypesFailureAction
  | FetchAllEntityTypesRequestAction
  | FetchAllEntityTypesSuccessAction;
