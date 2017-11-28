/*
 * @flow
 */

import { Models } from 'lattice';

const { PropertyType } = Models;

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

const DELETE_PROPERTY_TYPE_FAILURE :'DELETE_PROPERTY_TYPE_FAILURE' = 'DELETE_PROPERTY_TYPE_FAILURE';
const DELETE_PROPERTY_TYPE_REQUEST :'DELETE_PROPERTY_TYPE_REQUEST' = 'DELETE_PROPERTY_TYPE_REQUEST';
const DELETE_PROPERTY_TYPE_SUCCESS :'DELETE_PROPERTY_TYPE_SUCCESS' = 'DELETE_PROPERTY_TYPE_SUCCESS';

type DeletePropertyTypeFailureAction = {
  error :any,
  propertyTypeId :string,
  type :typeof DELETE_PROPERTY_TYPE_FAILURE
}

function deletePropertyTypeFailure(propertyTypeId :string, error :any) :DeletePropertyTypeFailureAction {

  return {
    error,
    propertyTypeId,
    type: DELETE_PROPERTY_TYPE_FAILURE
  };
}

type DeletePropertyTypeRequestAction = {
  propertyTypeId :string,
  type :typeof DELETE_PROPERTY_TYPE_REQUEST
}

function deletePropertyTypeRequest(propertyTypeId :string) :DeletePropertyTypeRequestAction {

  return {
    propertyTypeId,
    type: DELETE_PROPERTY_TYPE_REQUEST
  };
}

type DeletePropertyTypeSuccessAction = {
  propertyTypeId :string,
  type :typeof DELETE_PROPERTY_TYPE_SUCCESS
}

function deletePropertyTypeSuccess(propertyTypeId :string) :DeletePropertyTypeSuccessAction {

  return {
    propertyTypeId,
    type: DELETE_PROPERTY_TYPE_SUCCESS
  };
}

export {
  CREATE_PROPERTY_TYPE_FAILURE,
  CREATE_PROPERTY_TYPE_REQUEST,
  CREATE_PROPERTY_TYPE_SUCCESS,
  DELETE_PROPERTY_TYPE_FAILURE,
  DELETE_PROPERTY_TYPE_REQUEST,
  DELETE_PROPERTY_TYPE_SUCCESS,
  UPDATE_PROPERTY_TYPE_METADATA_FAILURE,
  UPDATE_PROPERTY_TYPE_METADATA_REQUEST,
  UPDATE_PROPERTY_TYPE_METADATA_SUCCESS
};

export {
  createPropertyTypeFailure,
  createPropertyTypeRequest,
  createPropertyTypeSuccess,
  deletePropertyTypeFailure,
  deletePropertyTypeRequest,
  deletePropertyTypeSuccess,
  updatePropertyTypeMetaDataFailure,
  updatePropertyTypeMetaDataRequest,
  updatePropertyTypeMetaDataSuccess
};

export type {
  CreatePropertyTypeFailureAction,
  CreatePropertyTypeRequestAction,
  CreatePropertyTypeSuccessAction,
  DeletePropertyTypeFailureAction,
  DeletePropertyTypeRequestAction,
  DeletePropertyTypeSuccessAction,
  UpdatePropertyTypeMetaDataFailureAction,
  UpdatePropertyTypeMetaDataRequestAction,
  UpdatePropertyTypeMetaDataSuccessAction
};

export type Action =
  | CreatePropertyTypeFailureAction
  | CreatePropertyTypeRequestAction
  | CreatePropertyTypeSuccessAction
  | DeletePropertyTypeFailureAction
  | DeletePropertyTypeRequestAction
  | DeletePropertyTypeSuccessAction
  | UpdatePropertyTypeMetaDataFailureAction
  | UpdatePropertyTypeMetaDataRequestAction
  | UpdatePropertyTypeMetaDataSuccessAction;
