/*
 * @flow
 */

export const FETCH_ALL_PROPERTY_TYPES_REQUEST :string = 'FETCH_ALL_PROPERTY_TYPES_REQUEST';
export const FETCH_ALL_PROPERTY_TYPES_SUCCESS :string = 'FETCH_ALL_PROPERTY_TYPES_SUCCESS';
export const FETCH_ALL_PROPERTY_TYPES_FAILURE :string = 'FETCH_ALL_PROPERTY_TYPES_FAILURE';

export const SEARCH_FOR_PROPERTY_TYPES_REQUEST :string = 'SEARCH_FOR_PROPERTY_TYPES_REQUEST';
export const SEARCH_FOR_PROPERTY_TYPES_SUCCESS :string = 'SEARCH_FOR_PROPERTY_TYPES_SUCCESS';
export const SEARCH_FOR_PROPERTY_TYPES_FAILURE :string = 'SEARCH_FOR_PROPERTY_TYPES_FAILURE';

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

export function searchForPropertyTypesRequest(searchQuery :string, page :number) :Action {

  return {
    type: SEARCH_FOR_PROPERTY_TYPES_REQUEST,
    page: page || 1,
    searchQuery
  };
}

export function searchForPropertyTypesSuccess(searchResults :Object) :Action {

  return {
    type: SEARCH_FOR_PROPERTY_TYPES_SUCCESS,
    searchResults
  };
}

export function searchForPropertyTypesFailure(error :any) :Action {

  return {
    type: SEARCH_FOR_PROPERTY_TYPES_FAILURE,
    error
  };
}
