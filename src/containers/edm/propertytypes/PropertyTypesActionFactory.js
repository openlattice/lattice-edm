/*
 * @flow
 */

export const FETCH_ALL_PROPERTY_TYPES_FAILURE :string = 'FETCH_ALL_PROPERTY_TYPES_FAILURE';
export const FETCH_ALL_PROPERTY_TYPES_REQUEST :string = 'FETCH_ALL_PROPERTY_TYPES_REQUEST';
export const FETCH_ALL_PROPERTY_TYPES_SUCCESS :string = 'FETCH_ALL_PROPERTY_TYPES_SUCCESS';

declare type Action = { [key :string] :any };

export function fetchAllPropertyTypesRequest() :Action {

  return {
    type: FETCH_ALL_PROPERTY_TYPES_REQUEST
  };
}

export function fetchAllPropertyTypesSuccess(propertyTypes :Object[]) :Action {

  return {
    type: FETCH_ALL_PROPERTY_TYPES_SUCCESS,
    propertyTypes
  };
}

export function fetchAllPropertyTypesFailure(error :any) :Action {

  return {
    type: FETCH_ALL_PROPERTY_TYPES_FAILURE,
    error
  };
}
