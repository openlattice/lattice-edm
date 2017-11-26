/*
 * @flow
 */

import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import FontAwesome from '@fortawesome/fontawesome';
import { faCheck, faPencilAlt, faSearch, faTimes } from '@fortawesome/fontawesome-free-solid';

import { normalize } from 'polished';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { injectGlobal } from 'styled-components';

import AuthRoute from './core/auth/AuthRoute';
import initializeReduxStore from './core/redux/ReduxStore';
import initializeRouterHistory from './core/router/RouterHistory';
import * as Auth0 from './core/auth/Auth0';
import * as AuthUtils from './core/auth/AuthUtils';
import * as Routes from './core/router/Routes';
import * as Utils from './utils/Utils';

import AppContainer from './containers/app/AppContainer';

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

// TODO: move styling into core/style
FontAwesome.library.add(faCheck, faPencilAlt, faSearch, faTimes);

/*
 * // !!! MUST HAPPEN FIRST !!!
 */
Auth0.initialize();
Utils.configureLattice(AuthUtils.getAuthToken());
/*
 * // !!! MUST HAPPEN FIRST !!!
 */

const routerHistory = initializeRouterHistory();
const reduxStore = initializeReduxStore(routerHistory);

ReactDOM.render(
  <Provider store={reduxStore}>
    <ConnectedRouter history={routerHistory}>
      <Switch>
        <AuthRoute exact strict path={Routes.LOGIN} />
        <Route path={Routes.ROOT} component={AppContainer} />
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);
