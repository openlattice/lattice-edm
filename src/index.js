/*
 * @flow
 */

import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import FontAwesome from '@fortawesome/fontawesome';
import { faSearch } from '@fortawesome/fontawesome-free-solid';

import { normalize } from 'polished';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { injectGlobal } from 'styled-components';

import AuthRoute from './core/auth/AuthRoute';
import initializeReduxStore from './core/redux/ReduxStore';
import initializeRouterHistory from './core/router/RouterHistory';
import * as Auth0 from './core/auth/Auth0';
import * as Routes from './core/router/Routes';

import AppContainer from './containers/app/AppContainer';

/* eslint-disable */
injectGlobal`${normalize()}`;

// TODO: define style defaults and themes
injectGlobal`
  html,
  body {
    background-color: #f6f9fc;
    color: #113355;
    height: 100%;
    width: 100%;
    font-family: 'Open Sans', sans-serif;
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
    display: flex;
    flex: 1 0 auto;
  }
`;
/* eslint-enable */

// TODO: move styling into core/style
FontAwesome.library.add(faSearch);

/*
 * // !!! MUST HAPPEN FIRST !!!
 */
Auth0.initialize();
/*
 * // !!! MUST HAPPEN FIRST !!!
 */

const routerHistory = initializeRouterHistory();
const reduxStore = initializeReduxStore(routerHistory);

ReactDOM.render(
  <Provider store={reduxStore}>
    <ConnectedRouter history={routerHistory}>
      <AuthRoute path={Routes.ROOT} component={AppContainer} />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);
