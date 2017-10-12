/*
 * @flow
 */

export const FETCH_ALL_ASSOCIATION_TYPES_REQUEST :string = 'FETCH_ALL_ASSOCIATION_TYPES_REQUEST';
export const FETCH_ALL_ASSOCIATION_TYPES_SUCCESS :string = 'FETCH_ALL_ASSOCIATION_TYPES_SUCCESS';
export const FETCH_ALL_ASSOCIATION_TYPES_FAILURE :string = 'FETCH_ALL_ASSOCIATION_TYPES_FAILURE';

export function fetchAllAssociationTypesRequest() :Object {

  return {
    type: FETCH_ALL_ASSOCIATION_TYPES_REQUEST
  };
}

export function fetchAllAssociationTypesSuccess(associationTypes :Object[]) :Object {

  return {
    type: FETCH_ALL_ASSOCIATION_TYPES_SUCCESS,
    associationTypes
  };
}

export function fetchAllAssociationTypesFailure(error :any) :Object {

  return {
    type: FETCH_ALL_ASSOCIATION_TYPES_FAILURE,
    error
  };
}
