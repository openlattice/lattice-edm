/*
 * @flow
 */

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
  UPDATE_PROPERTY_TYPE_METADATA_FAILURE,
  UPDATE_PROPERTY_TYPE_METADATA_REQUEST,
  UPDATE_PROPERTY_TYPE_METADATA_SUCCESS
};

export {
  updatePropertyTypeMetaDataFailure,
  updatePropertyTypeMetaDataRequest,
  updatePropertyTypeMetaDataSuccess
};

export type {
  UpdatePropertyTypeMetaDataFailureAction,
  UpdatePropertyTypeMetaDataRequestAction,
  UpdatePropertyTypeMetaDataSuccessAction
};

export type Action =
  | UpdatePropertyTypeMetaDataFailureAction
  | UpdatePropertyTypeMetaDataRequestAction
  | UpdatePropertyTypeMetaDataSuccessAction;
