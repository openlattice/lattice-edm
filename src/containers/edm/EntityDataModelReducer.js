/*
 * @flow
 */

import { combineReducers } from 'redux-immutable';

import associationTypesReducer from './associationtypes/AssociationTypesReducer';
import entityTypesReducer from './entitytypes/EntityTypesReducer';
import propertyTypesReducer from './propertytypes/PropertyTypesReducer';

export default function edmReducer() {

  return combineReducers({
    associationTypes: associationTypesReducer,
    entityTypes: entityTypesReducer,
    propertyTypes: propertyTypesReducer
  });
}
