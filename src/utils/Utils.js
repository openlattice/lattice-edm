/*
 * @flow
 */

import Lattice from 'lattice';
import isUUID from 'validator/lib/isUUID';

// injected by Webpack.DefinePlugin
declare var __DEV__;

export function configureLattice(authToken :string) {

  const host :string = window.location.host;
  const hostName :string = (host.startsWith('www.')) ? host.substring('www.'.length) : host;
  const baseUrl :string = (__DEV__) ? 'http://localhost:8080' : `https://api.${hostName}`;

  Lattice.configure({ authToken, baseUrl });
}

export function isValidUuid(value :any) :boolean {

  return isUUID(value);
}
