/*
 * @flow
 */

import React from 'react';

import qs from 'qs';
import styled from 'styled-components';
import { AuthActionFactory, AuthUtils } from 'lattice-auth';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { bindActionCreators } from 'redux';

import OpenLatticeLogo from '../../assets/images/logo_and_name.png';
import StyledButton from '../../components/buttons/StyledButton';
import * as Routes from '../../core/router/Routes';

import EntityDataModelContainer from '../edm/EntityDataModelContainer';

const {
  logout
} = AuthActionFactory;

/*
 * styled components
 */

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 800px;
`;

const AppHeaderOuterWrapper = styled.header`
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
`;

const AppHeaderInnerWrapper = styled.div`
  align-items: center;
  background-color: #fefefe;
  border-bottom: 1px solid #c5d5e5;
  display: flex;
  flex: 1 0 auto;
  flex-direction: row;
  height: 100px;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 0;
`;

const StyledActionButton = StyledButton.extend`
  position: absolute;
  right: 50px;
`;

const LoginAnchor = StyledActionButton.withComponent('a');

const Logo = styled.img`
  position: absolute;
  left: 50px;
`;

/*
 * types
 */

type Props = {
  actions :{
    logout :() => void;
  };
};

function getLoginUrl() :string {

  const queryString = qs.stringify(
    { redirectUrl: `${window.location.origin}${window.location.pathname}` },
    { addQueryPrefix: true }
  );

  return `${window.location.origin}${Routes.LOGIN}/${queryString}`;
}

const AppContainer = (props :Props) => (
  <AppWrapper>
    <AppHeaderOuterWrapper>
      <AppHeaderInnerWrapper>
        <Logo src={OpenLatticeLogo} height="50" />
        <Title>Entity Data Model</Title>
        {
          AuthUtils.isAuthenticated()
            ? (
              <StyledActionButton onClick={props.actions.logout}>Logout</StyledActionButton>
            )
            : (
              <LoginAnchor href={`${getLoginUrl()}`}>Login</LoginAnchor>
            )
        }
      </AppHeaderInnerWrapper>
    </AppHeaderOuterWrapper>
    <Switch>
      <Route path={Routes.ROOT} component={EntityDataModelContainer} />
      <Redirect to={Routes.ROOT} />
    </Switch>
  </AppWrapper>
);

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ logout }, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(AppContainer);
