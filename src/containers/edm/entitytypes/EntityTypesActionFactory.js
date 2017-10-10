/*
 * @flow
 */

export const FETCH_ALL_ENTITY_TYPES_REQUEST :string = 'FETCH_ALL_ENTITY_TYPES_REQUEST';
export const FETCH_ALL_ENTITY_TYPES_SUCCESS :string = 'FETCH_ALL_ENTITY_TYPES_SUCCESS';
export const FETCH_ALL_ENTITY_TYPES_FAILURE :string = 'FETCH_ALL_ENTITY_TYPES_FAILURE';

export const SEARCH_FOR_ENTITY_TYPES_REQUEST :string = 'SEARCH_FOR_ENTITY_TYPES_REQUEST';
export const SEARCH_FOR_ENTITY_TYPES_SUCCESS :string = 'SEARCH_FOR_ENTITY_TYPES_SUCCESS';
export const SEARCH_FOR_ENTITY_TYPES_FAILURE :string = 'SEARCH_FOR_ENTITY_TYPES_FAILURE';

export function fetchAllEntityTypesRequest() :Object {

  return {
    type: FETCH_ALL_ENTITY_TYPES_REQUEST
  };
}

export function fetchAllEntityTypesSuccess(entityTypes :Object[]) :Object {

  return {
    type: FETCH_ALL_ENTITY_TYPES_SUCCESS,
    entityTypes
  };
}

export function fetchAllEntityTypesFailure(error :any) :Object {

  return {
    type: FETCH_ALL_ENTITY_TYPES_FAILURE,
    error
  };
}

export function searchForEntityTypesRequest(searchQuery :string, page :number) :Object {

  return {
    type: SEARCH_FOR_ENTITY_TYPES_REQUEST,
    page: page || 1,
    searchQuery
  };
}

export function searchForEntityTypesSuccess(searchResults :Object) :Object {

  return {
    type: SEARCH_FOR_ENTITY_TYPES_SUCCESS,
    searchResults
  };
}

export function searchForEntityTypesFailure(error :any) :Object {

  return {
    type: SEARCH_FOR_ENTITY_TYPES_FAILURE,
    error
  };
}
