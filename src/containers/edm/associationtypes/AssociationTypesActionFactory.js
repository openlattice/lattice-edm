/*
 * @flow
 */

import { Models } from 'lattice';

const { AssociationType } = Models;

/* eslint-disable max-len */
const FETCH_ALL_ASSOCIATION_TYPES_FAILURE :'FETCH_ALL_ASSOCIATION_TYPES_FAILURE' = 'FETCH_ALL_ASSOCIATION_TYPES_FAILURE';
const FETCH_ALL_ASSOCIATION_TYPES_REQUEST :'FETCH_ALL_ASSOCIATION_TYPES_REQUEST' = 'FETCH_ALL_ASSOCIATION_TYPES_REQUEST';
const FETCH_ALL_ASSOCIATION_TYPES_SUCCESS :'FETCH_ALL_ASSOCIATION_TYPES_SUCCESS' = 'FETCH_ALL_ASSOCIATION_TYPES_SUCCESS';
/* eslint-enable */

type FetchAllAssociationTypesFailureAction = {
  error :any,
  type :typeof FETCH_ALL_ASSOCIATION_TYPES_FAILURE
};

function fetchAllAssociationTypesFailure(error :any) :FetchAllAssociationTypesFailureAction {

  return {
    type: FETCH_ALL_ASSOCIATION_TYPES_FAILURE,
    error
  };
}

type FetchAllAssociationTypesRequestAction = {
  type :typeof FETCH_ALL_ASSOCIATION_TYPES_REQUEST
};

function fetchAllAssociationTypesRequest() :FetchAllAssociationTypesRequestAction {

  return {
    type: FETCH_ALL_ASSOCIATION_TYPES_REQUEST
  };
}

type FetchAllAssociationTypesSuccessAction = {
  associationTypes :AssociationType[],
  type :typeof FETCH_ALL_ASSOCIATION_TYPES_SUCCESS
};

function fetchAllAssociationTypesSuccess(
  associationTypes :AssociationType[]
) :FetchAllAssociationTypesSuccessAction {

  return {
    type: FETCH_ALL_ASSOCIATION_TYPES_SUCCESS,
    associationTypes
  };
}

const CREATE_ASSOCIATION_TYPE_FAILURE :'CREATE_ASSOCIATION_TYPE_FAILURE' = 'CREATE_ASSOCIATION_TYPE_FAILURE';
const CREATE_ASSOCIATION_TYPE_REQUEST :'CREATE_ASSOCIATION_TYPE_REQUEST' = 'CREATE_ASSOCIATION_TYPE_REQUEST';
const CREATE_ASSOCIATION_TYPE_SUCCESS :'CREATE_ASSOCIATION_TYPE_SUCCESS' = 'CREATE_ASSOCIATION_TYPE_SUCCESS';

type CreateAssociationTypeFailureAction = {
  error :any,
  associationType :AssociationType,
  type :typeof CREATE_ASSOCIATION_TYPE_FAILURE
};

function createAssociationTypeFailure(
  associationType :AssociationType,
  error :any
) :CreateAssociationTypeFailureAction {

  return {
    type: CREATE_ASSOCIATION_TYPE_FAILURE,
    error,
    associationType
  };
}

type CreateAssociationTypeRequestAction = {
  associationType :AssociationType,
  type :typeof CREATE_ASSOCIATION_TYPE_REQUEST
};

function createAssociationTypeRequest(associationType :AssociationType) :CreateAssociationTypeRequestAction {

  return {
    type: CREATE_ASSOCIATION_TYPE_REQUEST,
    associationType
  };
}

type CreateAssociationTypeSuccessAction = {
  associationType :AssociationType,
  associationTypeId :string,
  type :typeof CREATE_ASSOCIATION_TYPE_SUCCESS
};

function createAssociationTypeSuccess(
  associationType :AssociationType,
  associationTypeId :string
) :CreateAssociationTypeSuccessAction {

  return {
    type: CREATE_ASSOCIATION_TYPE_SUCCESS,
    associationType,
    associationTypeId
  };
}

export {
  CREATE_ASSOCIATION_TYPE_REQUEST,
  CREATE_ASSOCIATION_TYPE_FAILURE,
  CREATE_ASSOCIATION_TYPE_SUCCESS,
  FETCH_ALL_ASSOCIATION_TYPES_REQUEST,
  FETCH_ALL_ASSOCIATION_TYPES_SUCCESS,
  FETCH_ALL_ASSOCIATION_TYPES_FAILURE
};

export {
  createAssociationTypeFailure,
  createAssociationTypeRequest,
  createAssociationTypeSuccess,
  fetchAllAssociationTypesFailure,
  fetchAllAssociationTypesRequest,
  fetchAllAssociationTypesSuccess
};

export type Action =
  | CreateAssociationTypeFailureAction
  | CreateAssociationTypeRequestAction
  | CreateAssociationTypeSuccessAction
  | FetchAllAssociationTypesFailureAction
  | FetchAllAssociationTypesRequestAction
  | FetchAllAssociationTypesSuccessAction;
