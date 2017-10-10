/*
 * @flow
 */

import { EntityDataModelApi, SearchApi } from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import {
  FETCH_ALL_ENTITY_TYPES_REQUEST,
  SEARCH_FOR_ENTITY_TYPES_REQUEST,
  fetchAllEntityTypesSuccess,
  fetchAllEntityTypesFailure,
  searchForEntityTypesSuccess,
  searchForEntityTypesFailure
} from './EntityTypesActionFactory';

const SEARCH_MAX_HITS = 100;

export function* watchFetchAllEntityTypesRequest() :Generator<*, *, *> {

  while (true) {
    yield take(FETCH_ALL_ENTITY_TYPES_REQUEST);
    try {
      const response = yield call(EntityDataModelApi.getAllEntityTypes);
      yield put(fetchAllEntityTypesSuccess(response));
    }
    catch (error) {
      yield put(fetchAllEntityTypesFailure(error));
    }
  }
}

export function* watchSearchForEntityTypesRequest() :Generator<*, *, *> {

  while (true) {
    const action :Object = yield take(SEARCH_FOR_ENTITY_TYPES_REQUEST);
    try {
      const response = yield call(
        SearchApi.searchEntityTypes,
        {
          searchTerm: action.searchQuery,
          page: action.page,
          start: ((action.page - 1) * SEARCH_MAX_HITS),
          maxHits: SEARCH_MAX_HITS
        }
      );
      yield put(searchForEntityTypesSuccess(response));
    }
    catch (error) {
      yield put(searchForEntityTypesFailure(error));
    }
  }
}
