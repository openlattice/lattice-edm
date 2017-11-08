/*
 * @flow
 */

import { Models } from 'lattice';

import { newRequestSequence } from '../../../core/redux/RequestSequence';

import type { RequestSequence } from '../../../core/redux/RequestSequence';

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

/* eslint-disable max-len */
const UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE :'UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE' = 'UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE';
const UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST :'UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST' = 'UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST';
const UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS :'UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS' = 'UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS';
/* eslint-enable */

type UpdateAssociationTypeMetaDataFailureAction = {
  associationTypeId :string,
  error :any,
  type :typeof UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE
}

function updateAssociationTypeMetaDataFailure(
  associationTypeId :string,
  error :any
) :UpdateAssociationTypeMetaDataFailureAction {

  return {
    associationTypeId,
    error,
    type: UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE
  };
}

type UpdateAssociationTypeMetaDataRequestAction = {
  associationTypeId :string,
  metadata :Object,
  type :typeof UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST
}

function updateAssociationTypeMetaDataRequest(
  associationTypeId :string,
  metadata :Object
) :UpdateAssociationTypeMetaDataRequestAction {

  return {
    associationTypeId,
    metadata,
    type: UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST
  };
}

type UpdateAssociationTypeMetaDataSuccessAction = {
  associationTypeId :string,
  metadata :Object,
  type :typeof UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS
}

function updateAssociationTypeMetaDataSuccess(
  associationTypeId :string,
  metadata :Object
) :UpdateAssociationTypeMetaDataSuccessAction {

  return {
    associationTypeId,
    metadata,
    type: UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS
  };
}

const DELETE_ASSOCIATION_TYPE_FAILURE :'DELETE_ASSOCIATION_TYPE_FAILURE' = 'DELETE_ASSOCIATION_TYPE_FAILURE';
const DELETE_ASSOCIATION_TYPE_REQUEST :'DELETE_ASSOCIATION_TYPE_REQUEST' = 'DELETE_ASSOCIATION_TYPE_REQUEST';
const DELETE_ASSOCIATION_TYPE_SUCCESS :'DELETE_ASSOCIATION_TYPE_SUCCESS' = 'DELETE_ASSOCIATION_TYPE_SUCCESS';

type DeleteAssociationTypeFailureAction = {
  associationTypeId :string,
  error :any,
  type :typeof DELETE_ASSOCIATION_TYPE_FAILURE
}

function deleteAssociationTypeFailure(associationTypeId :string, error :any) :DeleteAssociationTypeFailureAction {

  return {
    associationTypeId,
    error,
    type: DELETE_ASSOCIATION_TYPE_FAILURE
  };
}

type DeleteAssociationTypeRequestAction = {
  associationTypeId :string,
  type :typeof DELETE_ASSOCIATION_TYPE_REQUEST
}

function deleteAssociationTypeRequest(associationTypeId :string) :DeleteAssociationTypeRequestAction {

  return {
    associationTypeId,
    type: DELETE_ASSOCIATION_TYPE_REQUEST
  };
}

type DeleteAssociationTypeSuccessAction = {
  associationTypeId :string,
  type :typeof DELETE_ASSOCIATION_TYPE_SUCCESS
}

function deleteAssociationTypeSuccess(associationTypeId :string) :DeleteAssociationTypeSuccessAction {

  return {
    associationTypeId,
    type: DELETE_ASSOCIATION_TYPE_SUCCESS
  };
}

const ADD_SRC_ET_TO_AT :'ADD_SRC_ET_TO_AT' = 'ADD_SRC_ET_TO_AT';
const addSourceEntityTypeToAssociationType :RequestSequence = newRequestSequence(ADD_SRC_ET_TO_AT);

const RM_SRC_ET_FROM_AT :'RM_SRC_ET_FROM_AT' = 'RM_SRC_ET_FROM_AT';
const removeSourceEntityTypeFromAssociationType :RequestSequence = newRequestSequence(RM_SRC_ET_FROM_AT);

export {
  ADD_SRC_ET_TO_AT,
  CREATE_ASSOCIATION_TYPE_FAILURE,
  CREATE_ASSOCIATION_TYPE_REQUEST,
  CREATE_ASSOCIATION_TYPE_SUCCESS,
  DELETE_ASSOCIATION_TYPE_FAILURE,
  DELETE_ASSOCIATION_TYPE_REQUEST,
  DELETE_ASSOCIATION_TYPE_SUCCESS,
  FETCH_ALL_ASSOCIATION_TYPES_FAILURE,
  FETCH_ALL_ASSOCIATION_TYPES_REQUEST,
  FETCH_ALL_ASSOCIATION_TYPES_SUCCESS,
  RM_SRC_ET_FROM_AT,
  UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE,
  UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST,
  UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS
};

export {
  addSourceEntityTypeToAssociationType,
  createAssociationTypeFailure,
  createAssociationTypeRequest,
  createAssociationTypeSuccess,
  deleteAssociationTypeFailure,
  deleteAssociationTypeRequest,
  deleteAssociationTypeSuccess,
  fetchAllAssociationTypesFailure,
  fetchAllAssociationTypesRequest,
  fetchAllAssociationTypesSuccess,
  removeSourceEntityTypeFromAssociationType,
  updateAssociationTypeMetaDataFailure,
  updateAssociationTypeMetaDataRequest,
  updateAssociationTypeMetaDataSuccess
};

export type {
  CreateAssociationTypeFailureAction,
  CreateAssociationTypeRequestAction,
  CreateAssociationTypeSuccessAction,
  DeleteAssociationTypeFailureAction,
  DeleteAssociationTypeRequestAction,
  DeleteAssociationTypeSuccessAction,
  FetchAllAssociationTypesFailureAction,
  FetchAllAssociationTypesRequestAction,
  FetchAllAssociationTypesSuccessAction,
  UpdateAssociationTypeMetaDataFailureAction,
  UpdateAssociationTypeMetaDataRequestAction,
  UpdateAssociationTypeMetaDataSuccessAction
};

export type Action =
  | CreateAssociationTypeFailureAction
  | CreateAssociationTypeRequestAction
  | CreateAssociationTypeSuccessAction
  | DeleteAssociationTypeFailureAction
  | DeleteAssociationTypeRequestAction
  | DeleteAssociationTypeSuccessAction
  | FetchAllAssociationTypesFailureAction
  | FetchAllAssociationTypesRequestAction
  | FetchAllAssociationTypesSuccessAction
  | UpdateAssociationTypeMetaDataFailureAction
  | UpdateAssociationTypeMetaDataRequestAction
  | UpdateAssociationTypeMetaDataSuccessAction;
