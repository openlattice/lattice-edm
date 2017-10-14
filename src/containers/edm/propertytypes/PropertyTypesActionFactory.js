/*
 * @flow
 */

import { Models } from 'lattice';

const { PropertyType } = Models;

const FETCH_ALL_PROPERTY_TYPES_FAILURE :'FETCH_ALL_PROPERTY_TYPES_FAILURE' = 'FETCH_ALL_PROPERTY_TYPES_FAILURE';
const FETCH_ALL_PROPERTY_TYPES_REQUEST :'FETCH_ALL_PROPERTY_TYPES_REQUEST' = 'FETCH_ALL_PROPERTY_TYPES_REQUEST';
const FETCH_ALL_PROPERTY_TYPES_SUCCESS :'FETCH_ALL_PROPERTY_TYPES_SUCCESS' = 'FETCH_ALL_PROPERTY_TYPES_SUCCESS';

type FetchAllPropertyTypesFailureAction = {
  error :any,
  type :typeof FETCH_ALL_PROPERTY_TYPES_FAILURE
};

function fetchAllPropertyTypesFailure(error :any) :FetchAllPropertyTypesFailureAction {

  return {
    type: FETCH_ALL_PROPERTY_TYPES_FAILURE,
    error
  };
}

type FetchAllPropertyTypesRequestAction = {
  type :typeof FETCH_ALL_PROPERTY_TYPES_REQUEST
};

function fetchAllPropertyTypesRequest() :FetchAllPropertyTypesRequestAction {

  return {
    type: FETCH_ALL_PROPERTY_TYPES_REQUEST
  };
}

type FetchAllPropertyTypesSuccessAction = {
  propertyTypes :PropertyType[],
  type :typeof FETCH_ALL_PROPERTY_TYPES_SUCCESS
};

function fetchAllPropertyTypesSuccess(propertyTypes :PropertyType[]) :FetchAllPropertyTypesSuccessAction {

  return {
    type: FETCH_ALL_PROPERTY_TYPES_SUCCESS,
    propertyTypes
  };
}

const CREATE_PROPERTY_TYPE_FAILURE :'CREATE_PROPERTY_TYPE_FAILURE' = 'CREATE_PROPERTY_TYPE_FAILURE';
const CREATE_PROPERTY_TYPE_REQUEST :'CREATE_PROPERTY_TYPE_REQUEST' = 'CREATE_PROPERTY_TYPE_REQUEST';
const CREATE_PROPERTY_TYPE_SUCCESS :'CREATE_PROPERTY_TYPE_SUCCESS' = 'CREATE_PROPERTY_TYPE_SUCCESS';

type CreatePropertyTypeFailureAction = {
  error :any,
  propertyType :PropertyType,
  type :typeof CREATE_PROPERTY_TYPE_FAILURE
};

function createPropertyTypeFailure(propertyType :PropertyType, error :any) :CreatePropertyTypeFailureAction {

  return {
    type: CREATE_PROPERTY_TYPE_FAILURE,
    error,
    propertyType
  };
}

type CreatePropertyTypeRequestAction = {
  propertyType :PropertyType,
  type :typeof CREATE_PROPERTY_TYPE_REQUEST
};

function createPropertyTypeRequest(propertyType :PropertyType) :CreatePropertyTypeRequestAction {

  return {
    type: CREATE_PROPERTY_TYPE_REQUEST,
    propertyType
  };
}

type CreatePropertyTypeSuccessAction = {
  propertyType :PropertyType,
  propertyTypeId :string,
  type :typeof CREATE_PROPERTY_TYPE_SUCCESS
};

function createPropertyTypeSuccess(
    propertyType :PropertyType,
    propertyTypeId :string
) :CreatePropertyTypeSuccessAction {

  return {
    type: CREATE_PROPERTY_TYPE_SUCCESS,
    propertyType,
    propertyTypeId
  };
}

export {
  CREATE_PROPERTY_TYPE_FAILURE,
  CREATE_PROPERTY_TYPE_REQUEST,
  CREATE_PROPERTY_TYPE_SUCCESS,
  FETCH_ALL_PROPERTY_TYPES_REQUEST,
  FETCH_ALL_PROPERTY_TYPES_SUCCESS,
  FETCH_ALL_PROPERTY_TYPES_FAILURE
};

export {
  createPropertyTypeFailure,
  createPropertyTypeRequest,
  createPropertyTypeSuccess,
  fetchAllPropertyTypesFailure,
  fetchAllPropertyTypesRequest,
  fetchAllPropertyTypesSuccess
};

export type Action =
  | CreatePropertyTypeFailureAction
  | CreatePropertyTypeRequestAction
  | CreatePropertyTypeSuccessAction
  | FetchAllPropertyTypesFailureAction
  | FetchAllPropertyTypesRequestAction
  | FetchAllPropertyTypesSuccessAction;
