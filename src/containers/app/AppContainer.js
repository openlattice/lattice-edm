/*
 * @flow
 */

import React, { Component } from 'react';

import isFunction from 'lodash/isFunction';
import qs from 'qs';
import styled from 'styled-components';
import { AuthActions, AuthUtils } from 'lattice-auth';
import { EntityDataModelApiActions } from 'lattice-sagas';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import OpenLatticeLogo from '../../assets/images/logo_and_name.png';
import StyledButton from '../../components/buttons/StyledButton';
import * as Routes from '../../core/router/Routes';

import EntityDataModelContainer from '../edm/EntityDataModelContainer';
import GitHubContainer from '../github/GitHubContainer';
import NavContainer from './NavContainer';
import OnlineToggleContainer from './OnlineToggleContainer';
import SyncContainer from '../sync/SyncContainer';
import { GOOGLE_TRACKING_ID } from '../../core/tracking/google/GoogleAnalytics';

declare var gtag :?Function;

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
  position: relative;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 0;
`;

const StyledActionButton = styled(StyledButton)`
  position: absolute;
  right: 50px;
`;

const Logo = styled.img`
  position: absolute;
  left: 50px;
`;

/*
 * types
 */

type Props = {
  actions :{
    getEntityDataModel :RequestSequence;
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

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;
    actions.getEntityDataModel();
  }

  handleOnClickLogOut = () => {

    const { actions } = this.props;
    actions.logout();

    if (isFunction(gtag)) {
      gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    }
  }

  render() {

    // TODO: revert when ready to release
    const showOnlineToggle :boolean = AuthUtils.isAuthenticated() && AuthUtils.isAdmin();

    return (
      <AppWrapper>
        <AppHeaderOuterWrapper>
          <AppHeaderInnerWrapper>
            <Logo src={OpenLatticeLogo} height="50" />
            <Title>
              Entity Data Model
            </Title>
            {
              AuthUtils.isAuthenticated()
                ? (
                  <StyledActionButton onClick={this.handleOnClickLogOut}>Logout</StyledActionButton>
                )
                : (
                  <StyledActionButton as="a" href={`${getLoginUrl()}`}>Login</StyledActionButton>
                )
            }
          </AppHeaderInnerWrapper>
        </AppHeaderOuterWrapper>
        <NavContainer />
        {
          showOnlineToggle && (
            <OnlineToggleContainer />
          )
        }
        <Switch>
          <Route path={Routes.SYNC} component={SyncContainer} />
          <Route path={Routes.GITHUB} component={GitHubContainer} />
          <Route path={Routes.ROOT} component={EntityDataModelContainer} />
          <Redirect to={Routes.ROOT} />
        </Switch>
      </AppWrapper>
    );
  }
}

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getEntityDataModel: EntityDataModelApiActions.getEntityDataModel,
    logout: AuthActions.logout,
  }, dispatch)
});

export default connect<*, *, *, *, *, *>(null, mapDispatchToProps)(AppContainer);
