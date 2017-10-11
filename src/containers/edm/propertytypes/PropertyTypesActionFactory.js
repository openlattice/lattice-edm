/*
 * @flow
 */

export const FETCH_ALL_PROPERTY_TYPES_REQUEST :string = 'FETCH_ALL_PROPERTY_TYPES_REQUEST';
export const FETCH_ALL_PROPERTY_TYPES_SUCCESS :string = 'FETCH_ALL_PROPERTY_TYPES_SUCCESS';
export const FETCH_ALL_PROPERTY_TYPES_FAILURE :string = 'FETCH_ALL_PROPERTY_TYPES_FAILURE';

export function fetchAllPropertyTypesRequest() :Object {

  return {
    type: FETCH_ALL_PROPERTY_TYPES_REQUEST
  };
}

export function fetchAllPropertyTypesSuccess(propertyTypes :Object[]) :Object {

  return {
    type: FETCH_ALL_PROPERTY_TYPES_SUCCESS,
    propertyTypes
  };
}

export function fetchAllPropertyTypesFailure(error :any) :Object {

  return {
    type: FETCH_ALL_PROPERTY_TYPES_FAILURE,
    error
  };
}
