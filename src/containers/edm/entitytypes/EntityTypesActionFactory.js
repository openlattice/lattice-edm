/*
 * @flow
 */

export const FETCH_ALL_ENTITY_TYPES_REQUEST :string = 'FETCH_ALL_ENTITY_TYPES_REQUEST';
export const FETCH_ALL_ENTITY_TYPES_SUCCESS :string = 'FETCH_ALL_ENTITY_TYPES_SUCCESS';
export const FETCH_ALL_ENTITY_TYPES_FAILURE :string = 'FETCH_ALL_ENTITY_TYPES_FAILURE';

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
