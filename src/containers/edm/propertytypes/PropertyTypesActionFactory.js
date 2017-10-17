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
    error,
    type: FETCH_ALL_PROPERTY_TYPES_FAILURE
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
    propertyTypes,
    type: FETCH_ALL_PROPERTY_TYPES_SUCCESS
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
    error,
    propertyType,
    type: CREATE_PROPERTY_TYPE_FAILURE
  };
}

type CreatePropertyTypeRequestAction = {
  propertyType :PropertyType,
  type :typeof CREATE_PROPERTY_TYPE_REQUEST
};

function createPropertyTypeRequest(propertyType :PropertyType) :CreatePropertyTypeRequestAction {

  return {
    propertyType,
    type: CREATE_PROPERTY_TYPE_REQUEST
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
    propertyType,
    propertyTypeId,
    type: CREATE_PROPERTY_TYPE_SUCCESS
  };
}

/* eslint-disable max-len */
const UPDATE_PROPERTY_TYPE_METADATA_FAILURE :'UPDATE_PROPERTY_TYPE_METADATA_FAILURE' = 'UPDATE_PROPERTY_TYPE_METADATA_FAILURE';
const UPDATE_PROPERTY_TYPE_METADATA_REQUEST :'UPDATE_PROPERTY_TYPE_METADATA_REQUEST' = 'UPDATE_PROPERTY_TYPE_METADATA_REQUEST';
const UPDATE_PROPERTY_TYPE_METADATA_SUCCESS :'UPDATE_PROPERTY_TYPE_METADATA_SUCCESS' = 'UPDATE_PROPERTY_TYPE_METADATA_SUCCESS';
/* eslint-enable */

type UpdatePropertyTypeMetaDataFailureAction = {
  error :any,
  propertyTypeId :string,
  type :typeof UPDATE_PROPERTY_TYPE_METADATA_FAILURE
}

function updatePropertyTypeMetaDataFailure(
  propertyTypeId :string,
  error :any
) :UpdatePropertyTypeMetaDataFailureAction {

  return {
    error,
    propertyTypeId,
    type: UPDATE_PROPERTY_TYPE_METADATA_FAILURE
  };
}

type UpdatePropertyTypeMetaDataRequestAction = {
  metadata :Object,
  propertyTypeId :string,
  type :typeof UPDATE_PROPERTY_TYPE_METADATA_REQUEST
}

function updatePropertyTypeMetaDataRequest(
  propertyTypeId :string,
  metadata :Object
) :UpdatePropertyTypeMetaDataRequestAction {

  return {
    metadata,
    propertyTypeId,
    type: UPDATE_PROPERTY_TYPE_METADATA_REQUEST
  };
}

type UpdatePropertyTypeMetaDataSuccessAction = {
  metadata :Object,
  propertyTypeId :string,
  type :typeof UPDATE_PROPERTY_TYPE_METADATA_SUCCESS
}

function updatePropertyTypeMetaDataSuccess(
  propertyTypeId :string,
  metadata :Object
) :UpdatePropertyTypeMetaDataSuccessAction {

  return {
    metadata,
    propertyTypeId,
    type: UPDATE_PROPERTY_TYPE_METADATA_SUCCESS
  };
}

export {
  CREATE_PROPERTY_TYPE_FAILURE,
  CREATE_PROPERTY_TYPE_REQUEST,
  CREATE_PROPERTY_TYPE_SUCCESS,
  FETCH_ALL_PROPERTY_TYPES_FAILURE,
  FETCH_ALL_PROPERTY_TYPES_REQUEST,
  FETCH_ALL_PROPERTY_TYPES_SUCCESS,
  UPDATE_PROPERTY_TYPE_METADATA_FAILURE,
  UPDATE_PROPERTY_TYPE_METADATA_REQUEST,
  UPDATE_PROPERTY_TYPE_METADATA_SUCCESS
};

export {
  createPropertyTypeFailure,
  createPropertyTypeRequest,
  createPropertyTypeSuccess,
  fetchAllPropertyTypesFailure,
  fetchAllPropertyTypesRequest,
  fetchAllPropertyTypesSuccess,
  updatePropertyTypeMetaDataFailure,
  updatePropertyTypeMetaDataRequest,
  updatePropertyTypeMetaDataSuccess
};

export type {
  CreatePropertyTypeFailureAction,
  CreatePropertyTypeRequestAction,
  CreatePropertyTypeSuccessAction,
  FetchAllPropertyTypesFailureAction,
  FetchAllPropertyTypesRequestAction,
  FetchAllPropertyTypesSuccessAction,
  UpdatePropertyTypeMetaDataFailureAction,
  UpdatePropertyTypeMetaDataRequestAction,
  UpdatePropertyTypeMetaDataSuccessAction
};

export type Action =
  | CreatePropertyTypeFailureAction
  | CreatePropertyTypeRequestAction
  | CreatePropertyTypeSuccessAction
  | FetchAllPropertyTypesFailureAction
  | FetchAllPropertyTypesRequestAction
  | FetchAllPropertyTypesSuccessAction
  | UpdatePropertyTypeMetaDataFailureAction
  | UpdatePropertyTypeMetaDataRequestAction
  | UpdatePropertyTypeMetaDataSuccessAction;
