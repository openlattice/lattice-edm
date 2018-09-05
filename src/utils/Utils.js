/*
 * @flow
 */

import Lattice from 'lattice';
import LatticeAuth from 'lattice-auth';
import isUUID from 'validator/lib/isUUID';

// injected by Webpack.DefinePlugin
declare var __ENV_DEV__ :boolean;

const { AuthUtils } = LatticeAuth;

export function isValidUuid(value :any) :boolean {

  return isUUID(value);
}

export function randomId() :string {

  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  // not meant to be a cryptographically strong random id
  return Math.random().toString(36).slice(2);
}

export function getLatticeConfigBaseUrl() :string {

  // TODO: this probably doesn't belong here, also hardcoded strings == not great
  let baseUrl = 'localhost';
  if (!__ENV_DEV__) {
    baseUrl = window.location.host.startsWith('staging') ? 'staging' : 'production';
  }
  return baseUrl;
}

export function resetLatticeConfig() :void {

  Lattice.configure({
    authToken: AuthUtils.getAuthToken(),
    baseUrl: getLatticeConfigBaseUrl(),
  });
}
