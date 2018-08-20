/*
 * @flow
 */

import React, { Component } from 'react';

import Axios from 'axios';
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
import {
  syncProdEntityDataModel
} from './SyncActionFactory';

// injected by Webpack.DefinePlugin
declare var __ENV_PROD__ :boolean;

const AUDIT_NAMESPACE = 'OPENLATTICE_AUDIT';

const ContainerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 40px;
`;

const SyncSuccess = styled.div`
  align-items: center;
  color: #7dd322;
  display: flex;
  flex-direction: column;
`;

const SyncFailure = styled.div`
  align-items: center;
  color: #e91e63;
  display: flex;
  flex-direction: column;
`;

type Props = {
  actions :{
    syncProdEntityDataModel :RequestSequence;
  };
  isSyncing :boolean;
  syncSuccess :boolean;
};

type State = {

}

class SyncContainer extends Component<Props, State> {

  componentWillReceiveProps(nextProps :Props) {
    // TODO: update state to mark that a sync has been attempted
  }

  startSync = () => {

    const { actions } = this.props;
    actions.syncProdEntityDataModel();
  }

  renderSyncButton = () => {

    const { isSyncing, syncSuccess } = this.props;
    if (isSyncing || syncSuccess) {
      return null;
    }

    return (
      <StyledButton onClick={this.startSync}>
        Sync
      </StyledButton>
    );
  }

  renderSyncSuccess = () => {

    const { isSyncing, syncSuccess } = this.props;
    if (isSyncing || !syncSuccess) {
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

    const { isSyncing, syncSuccess } = this.props;
    if (isSyncing || syncSuccess) {
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

    const { isSyncing } = this.props;
    if (isSyncing) {
      return (
        <Spinner />
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
    isSyncing: state.getIn(['sync', 'isSyncing'], false),
    syncSuccess: state.getIn(['sync', 'syncSuccess'], false),
    conflicts: state.getIn(['sync', 'conflicts'], false),
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

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SyncContainer)
);
