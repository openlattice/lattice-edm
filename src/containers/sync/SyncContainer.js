/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faCheckCircle, faTimesCircle } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

import StyledButton from '../../components/buttons/StyledButton';
import Spinner from '../../components/spinner/Spinner';
import * as Routes from '../../core/router/Routes';
import { SYNC_STATES } from './SyncReducer';
import { syncProdEntityDataModel } from './SyncActions';

// injected by Webpack.DefinePlugin
declare var __ENV_PROD__ :boolean;

const ContainerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 40px;
  position: relative;
`;

const SpinnerWrapper = styled.div`
  position: relative;
  top: 0;
`;

const SyncSuccess = styled.div`
  align-items: center;
  color: #00be84;
  display: flex;
  flex-direction: column;
  svg {
    font-size: 36px;
  }
`;

const SyncFailure = styled.div`
  align-items: center;
  color: #ff3c5d;
  display: flex;
  flex-direction: column;
  svg {
    font-size: 36px;
  }
`;

type Props = {
  actions :{
    syncProdEntityDataModel :RequestSequence;
  };
  syncState :number;
};

class SyncContainer extends Component<Props> {

  startSync = () => {

    const { actions } = this.props;
    actions.syncProdEntityDataModel();
  }

  renderSyncButton = () => {

    const { syncState } = this.props;
    if (syncState !== SYNC_STATES.PRE_SYNC) {
      return null;
    }

    return (
      <StyledButton onClick={this.startSync}>
        Sync
      </StyledButton>
    );
  }

  renderSyncSuccess = () => {

    const { syncState } = this.props;
    if (syncState !== SYNC_STATES.SYNC_SUCCESS) {
      return null;
    }

    return (
      <SyncSuccess>
        <FontAwesomeIcon icon={faCheckCircle} size="3x" />
        <p>
          Success!
        </p>
      </SyncSuccess>
    );
  }

  renderSyncFailureure = () => {

    const { syncState } = this.props;
    if (syncState !== SYNC_STATES.SYNC_FAILURE) {
      return null;
    }

    return (
      <SyncFailure>
        <FontAwesomeIcon icon={faTimesCircle} size="3x" />
        <p>
          Sync failed. Make sure your local stack has been cleared (elasticsearch, postgres).
        </p>
      </SyncFailure>
    );
  }

  render() {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin() || __ENV_PROD__) {
      return <Redirect to={Routes.ROOT} />;
    }

    const { syncState } = this.props;
    if (syncState === SYNC_STATES.IS_SYNCING) {
      return (
        <ContainerWrapper>
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        </ContainerWrapper>
      );
    }

    return (
      <ContainerWrapper>
        { this.renderSyncButton() }
        { this.renderSyncSuccess() }
        { this.renderSyncFailureure() }
      </ContainerWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    syncState: state.getIn(['sync', 'syncState'], SYNC_STATES.PRE_SYNC),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    syncProdEntityDataModel,
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default withRouter<*>(
  connect(mapStateToProps, mapDispatchToProps)(SyncContainer)
);
