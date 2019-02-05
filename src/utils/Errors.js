/*
 * @flow
 */

const ERR_ACTION_VALUE_NOT_DEFINED :string = 'invalid parameter: action.value is required and must be defined';
const ERR_INVALID_ROUTE :string = 'invalid route: a route must be a non-empty string that starts with "/"';
const ERR_WORKER_SAGA :string = 'caught exception in worker saga';

const ERR_FQN_EXISTS :string = 'FQN already exists';
const ERR_ET_DOES_NOT_EXIST :string = 'EntityType does not exist';
const ERR_PT_DOES_NOT_EXIST :string = 'PropertyType does not exist';

export {
  ERR_ACTION_VALUE_NOT_DEFINED,
  ERR_ET_DOES_NOT_EXIST,
  ERR_FQN_EXISTS,
  ERR_INVALID_ROUTE,
  ERR_PT_DOES_NOT_EXIST,
  ERR_WORKER_SAGA,
};
