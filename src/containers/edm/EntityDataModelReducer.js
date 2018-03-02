/*
 * @flow
 */

import { combineReducers } from 'redux-immutable';

import associationTypesReducer from './associationtypes/AssociationTypesReducer';
import entityTypesReducer from './entitytypes/EntityTypesReducer';
import propertyTypesReducer from './propertytypes/PropertyTypesReducer';
import schemasReducer from './schemas/SchemasReducer';

export default function edmReducer() {

  return combineReducers({
    associationTypes: associationTypesReducer,
    entityTypes: entityTypesReducer,
    propertyTypes: propertyTypesReducer,
    schemas: schemasReducer
  });
}
