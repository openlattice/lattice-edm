/*
 * @flow
 */

import { List, fromJS } from 'immutable';
import { EntityDataModelApiActions } from 'lattice-sagas';
import { combineReducers } from 'redux-immutable';

import associationTypesReducer from './associationtypes/AssociationTypesReducer';
import entityTypesReducer from './entitytypes/EntityTypesReducer';
import propertyTypesReducer from './propertytypes/PropertyTypesReducer';
import schemasReducer from './schemas/SchemasReducer';

const { getEntityDataModel } = EntityDataModelApiActions;

export default function edmReducer() {

  /*
   * NOTE
   * this feels hacky. this function should be refactored so that it still uses the other helper reducers, but is also
   * an actual reducer with the "edm" state defined here.
   */

  const isFetchingEntityDataModelReducer = (state = false, action) => {
    switch (action.type) {
      case getEntityDataModel.case(action.type): {
        return getEntityDataModel.reducer(state, action, {
          REQUEST: () => true,
          FINALLY: () => false,
        });
      }
      default:
        return state;
    }
  };

  const namespacesReducer = (state = List(), action) => {
    switch (action.type) {
      case getEntityDataModel.case(action.type): {
        return getEntityDataModel.reducer(state, action, {
          SUCCESS: () => fromJS(action.value.namespaces),
          FAILURE: () => List(),
        });
      }
      default:
        return state;
    }
  };

  return combineReducers({
    associationTypes: associationTypesReducer,
    entityTypes: entityTypesReducer,
    isFetchingEntityDataModel: isFetchingEntityDataModelReducer,
    namespaces: namespacesReducer,
    propertyTypes: propertyTypesReducer,
    schemas: schemasReducer,
  });
}
