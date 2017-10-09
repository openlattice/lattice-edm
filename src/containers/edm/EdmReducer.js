/*
 * @flow
 */

import { combineReducers } from 'redux-immutable';

import propertyTypesReducer from './propertytypes/PropertyTypesReducer';

export default function edmReducer() {

  return combineReducers({
    propertyTypes: propertyTypesReducer
  });
}
