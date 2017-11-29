/*
 * @flow
 */

import { newRequestSequence } from '../../../core/redux/RequestSequence';

import type { RequestSequence } from '../../../core/redux/RequestSequence';

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

const ADD_DST_ET_TO_AT :'ADD_DST_ET_TO_AT' = 'ADD_DST_ET_TO_AT';
const addDestinationEntityTypeToAssociationType :RequestSequence = newRequestSequence(ADD_DST_ET_TO_AT);

const ADD_SRC_ET_TO_AT :'ADD_SRC_ET_TO_AT' = 'ADD_SRC_ET_TO_AT';
const addSourceEntityTypeToAssociationType :RequestSequence = newRequestSequence(ADD_SRC_ET_TO_AT);

const RM_DST_ET_FROM_AT :'RM_DST_ET_FROM_AT' = 'RM_DST_ET_FROM_AT';
const removeDestinationEntityTypeFromAssociationType :RequestSequence = newRequestSequence(RM_DST_ET_FROM_AT);

const RM_SRC_ET_FROM_AT :'RM_SRC_ET_FROM_AT' = 'RM_SRC_ET_FROM_AT';
const removeSourceEntityTypeFromAssociationType :RequestSequence = newRequestSequence(RM_SRC_ET_FROM_AT);

export {
  ADD_DST_ET_TO_AT,
  ADD_SRC_ET_TO_AT,
  DELETE_ASSOCIATION_TYPE_FAILURE,
  DELETE_ASSOCIATION_TYPE_REQUEST,
  DELETE_ASSOCIATION_TYPE_SUCCESS,
  RM_DST_ET_FROM_AT,
  RM_SRC_ET_FROM_AT,
  UPDATE_ASSOCIATION_TYPE_METADATA_FAILURE,
  UPDATE_ASSOCIATION_TYPE_METADATA_REQUEST,
  UPDATE_ASSOCIATION_TYPE_METADATA_SUCCESS
};

export {
  addDestinationEntityTypeToAssociationType,
  addSourceEntityTypeToAssociationType,
  deleteAssociationTypeFailure,
  deleteAssociationTypeRequest,
  deleteAssociationTypeSuccess,
  removeDestinationEntityTypeFromAssociationType,
  removeSourceEntityTypeFromAssociationType,
  updateAssociationTypeMetaDataFailure,
  updateAssociationTypeMetaDataRequest,
  updateAssociationTypeMetaDataSuccess
};

export type {
  DeleteAssociationTypeFailureAction,
  DeleteAssociationTypeRequestAction,
  DeleteAssociationTypeSuccessAction,
  UpdateAssociationTypeMetaDataFailureAction,
  UpdateAssociationTypeMetaDataRequestAction,
  UpdateAssociationTypeMetaDataSuccessAction
};

export type Action =
  | DeleteAssociationTypeFailureAction
  | DeleteAssociationTypeRequestAction
  | DeleteAssociationTypeSuccessAction
  | UpdateAssociationTypeMetaDataFailureAction
  | UpdateAssociationTypeMetaDataRequestAction
  | UpdateAssociationTypeMetaDataSuccessAction;
