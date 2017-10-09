/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import StyledButton from '../../components/buttons/StyledButton';
import StyledFlexComponent from '../../components/flex/StyledFlexComponent';
import StyledFlexComponentStacked from '../../components/flex/StyledFlexComponentStacked';
import * as Routes from '../../core/router/Routes';
import { logout } from '../../core/auth/AuthActionFactory';

import EntityDataModelContainer from '../edm/EntityDataModelContainer';

const StyledFlexHeaderComponent = StyledFlexComponent.withComponent('header');

const AppWrapper = StyledFlexComponentStacked.extend`
  flex: 1;
`;

const AppHeaderWrapper = StyledFlexHeaderComponent.extend`
  align-items: center;
  background-color: #fefefe;
  border-bottom: 1px solid #c5d5e5;
  flex: 0 0 auto;
  justify-content: center;
  padding: 20px 50px;
  position: relative;
`;

const AppBodyWrapper = StyledFlexComponent.extend`
  flex: 1 0 auto;
`;

const Title = styled.h1`
  font-weight: normal;
`;

const StyledLogoutButton = StyledButton.extend`
  position: absolute;
  right: 50px;
`;

function mapDispatchToProps(dispatch :Function) {

  return {
    actions: bindActionCreators({ logout }, dispatch)
  };
}

type Props = {
  actions :{
    logout :Function
  }
};

const AppContainer = (props :Props) => {

  return (
    <AppWrapper>
      <AppHeaderWrapper>
        <Title>OpenLattice Entity Data Model</Title>
        <StyledLogoutButton onClick={props.actions.logout}>Logout</StyledLogoutButton>
      </AppHeaderWrapper>
      <AppBodyWrapper>
        <Switch>
          <Route path={Routes.ROOT} component={EntityDataModelContainer} />
          <Redirect to={Routes.ROOT} />
        </Switch>
      </AppBodyWrapper>
    </AppWrapper>
  );
};

export default connect(null, mapDispatchToProps)(AppContainer);
