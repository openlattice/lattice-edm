/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import StyledButton from '../../components/buttons/StyledButton';
import * as AuthUtils from '../../core/auth/AuthUtils';
import * as Routes from '../../core/router/Routes';
import { login, logout } from '../../core/auth/AuthActionFactory';

import EntityDataModelContainer from '../edm/EntityDataModelContainer';

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

/*
 * types
 */

type Props = {
  actions :{
    login :Function,
    logout :Function
  },
  isAuthenticated :boolean
};

const AppContainer = (props :Props) => {

  return (
    <AppWrapper>
      <AppHeaderOuterWrapper>
        <AppHeaderInnerWrapper>
          <Title>OpenLattice Entity Data Model</Title>
          {
            props.isAuthenticated
              ? (
                <StyledActionButton onClick={props.actions.logout}>Logout</StyledActionButton>
              )
              : (
                <StyledActionButton onClick={props.actions.login}>Login</StyledActionButton>
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
};

function mapStateToProps() :Object {

  return {
    isAuthenticated: AuthUtils.isAuthenticated()
  };
}


function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ login, logout }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
