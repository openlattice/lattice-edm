/*
 * @flow
 */

import isUUID from 'validator/lib/isUUID';

export function isValidUuid(value :any) :boolean {

  return isUUID(value);
}

export function randomId() :string {

  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  // not meant to be a cryptographically strong random id
  return Math.random().toString(36).slice(2);
}
