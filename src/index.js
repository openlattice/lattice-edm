/*
 * @flow
 */

import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import LatticeAuth from 'lattice-auth';
import { normalize } from 'polished';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { injectGlobal } from 'styled-components';

import OpenLatticeLogo from './assets/images/logo.png';
import AppContainer from './containers/app/AppContainer';
import initializeReduxStore from './core/redux/ReduxStore';
import initializeRouterHistory from './core/router/RouterHistory';
import * as Routes from './core/router/Routes';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;
declare var __ENV_DEV__ :boolean;

const {
  AuthUtils
} = LatticeAuth;

/* eslint-disable */
injectGlobal`${normalize()}`;

// TODO: define style defaults and themes
injectGlobal`
  html,
  body {
    background-color: #f9fcff;
    color: #113355;
    font-family: 'Open Sans', sans-serif;
    height: 100%;
    width: 100%;
  }

  * {
    -webkit-box-sizing: border-box;
       -moz-box-sizing: border-box;
            box-sizing: border-box;
  }

  *:before,
  *:after {
    -webkit-box-sizing: border-box;
       -moz-box-sizing: border-box;
            box-sizing: border-box;
  }

  #app {
    display: block;
    height: 100%;
    width: 100%;
  }
`;
/* eslint-enable */

/*
 * // !!! MUST HAPPEN FIRST !!!
 */

LatticeAuth.configure({
  auth0ClientId: __AUTH0_CLIENT_ID__,
  auth0Domain: __AUTH0_DOMAIN__,
  auth0Lock: {
    logo: OpenLatticeLogo,
    title: 'OpenLattice'
  },
  authToken: AuthUtils.getAuthToken(),
  baseUrl: (__ENV_DEV__) ? 'localhost' : 'production'
});

/*
 * // !!! MUST HAPPEN FIRST !!!
 */

const routerHistory = initializeRouterHistory();
const reduxStore = initializeReduxStore(routerHistory);

ReactDOM.render(
  <Provider store={reduxStore}>
    <ConnectedRouter history={routerHistory}>
      <Switch>
        <Route path={Routes.ROOT} component={AppContainer} />
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);
