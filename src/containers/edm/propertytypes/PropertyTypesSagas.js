/*
 * @flow
 */

import { EntityDataModelApi, SearchApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  FETCH_ALL_PROPERTY_TYPES_REQUEST,
  SEARCH_FOR_PROPERTY_TYPES_REQUEST,
  fetchAllPropertyTypesSuccess,
  fetchAllPropertyTypesFailure,
  searchForPropertyTypesSuccess,
  searchForPropertyTypesFailure
} from './PropertyTypesActionFactory';

const SEARCH_MAX_HITS = 100;

export function* watchFetchAllPropertyTypesRequest() :Generator<*, *, *> {

  while (true) {
    yield take(FETCH_ALL_PROPERTY_TYPES_REQUEST);
    try {
      const response = yield call(EntityDataModelApi.getAllPropertyTypes);
      yield put(fetchAllPropertyTypesSuccess(response));
    }
    catch (error) {
      yield put(fetchAllPropertyTypesFailure(error));
    }
  }
}

export function* watchSearchForPropertyTypesRequest() :Generator<*, *, *> {

  while (true) {
    const action :Object = yield take(SEARCH_FOR_PROPERTY_TYPES_REQUEST);
    try {
      const response = yield call(
        SearchApi.searchPropertyTypes,
        {
          searchTerm: action.searchQuery,
          page: action.page,
          start: ((action.page - 1) * SEARCH_MAX_HITS),
          maxHits: SEARCH_MAX_HITS
        }
      );
      yield put(searchForPropertyTypesSuccess(response));
    }
    catch (error) {
      yield put(searchForPropertyTypesFailure(error));
    }
  }
}
