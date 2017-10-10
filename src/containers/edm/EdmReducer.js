/*
 * @flow
 */

import { combineReducers } from 'redux-immutable';

import entityTypesReducer from './entitytypes/EntityTypesReducer';
import propertyTypesReducer from './propertytypes/PropertyTypesReducer';

export default function edmReducer() {

  return combineReducers({
    entityTypes: entityTypesReducer,
    propertyTypes: propertyTypesReducer
  });
}
